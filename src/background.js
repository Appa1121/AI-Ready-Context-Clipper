import { createClip } from './background/capture.js';
import { addClip, applyCommand, readState } from './background/repository.js';
import {
  ContractError,
  ERROR_CODES,
  PROTOCOL_VERSION,
  validateCommand,
} from './shared/contracts.js';

const CONTEXT_MENU_ID = 'save-to-ai-clipper';
const CONTEXT_MENU_TITLE = 'Save to AI Clipper';
const DEFAULT_ACTION_TITLE = 'Open AI-Ready Context Clipper';
const SIDEPANEL_PATH = 'sidepanel/sidepanel.html';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Serial queue preventing concurrent context menu rebuilds from racing across lifecycle hooks.
 * @type {Promise<void>}
 */
let menuSetupTail = Promise.resolve();

/**
 * Monotonic capture sequence counter and serial queue ensuring toolbar badge/title
 * reflect only the most recent capture attempt.
 */
let latestCaptureSeq = 0;
let feedbackTail = Promise.resolve();

/**
 * Invoke a Chrome callback-style API cleanly as a Promise, checking runtime.lastError.
 * @param {(done: () => void) => void} invoke Callback-accepting Chrome API wrapper.
 * @returns {Promise<void>} Resolves on success or rejects with Error on runtime.lastError.
 */
function callChromeCallback(invoke) {
  return new Promise((resolve, reject) => {
    invoke(() => {
      const lastError = chrome.runtime?.lastError;
      if (lastError) {
        reject(new Error(lastError.message || 'Chrome API error'));
        return;
      }
      resolve();
    });
  });
}

/**
 * Configure the global side panel without depending on worker memory.
 * @returns {Promise<void>} Resolves after configuration; logs sanitized failure.
 */
async function configurePanel() {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    if (chrome.runtime?.lastError) {
      throw new Error('lastError');
    }
  } catch {
    console.error('AI Clipper: side panel configuration failed. Reload the extension.');
  }
}

/**
 * Recreate the selection context menu idempotently inside a serialized setup chain.
 * @returns {Promise<void>} Resolves after registration or logs sanitized failure.
 */
function ensureContextMenu() {
  const run = menuSetupTail.then(async () => {
    await callChromeCallback((done) => chrome.contextMenus.removeAll(done));
    await callChromeCallback((done) => {
      chrome.contextMenus.create(
        {
          id: CONTEXT_MENU_ID,
          title: CONTEXT_MENU_TITLE,
          contexts: ['selection'],
        },
        done
      );
    });
  });

  menuSetupTail = run.catch(() => {
    console.error('AI Clipper: context menu setup failed.');
  });
  return menuSetupTail;
}

/**
 * Initialize missing appState on installation without overwriting existing data.
 * @returns {Promise<void>} Resolves after state check/initialization; logs sanitized code on failure.
 */
async function ensureInitializedState() {
  try {
    await readState();
  } catch (error) {
    const code = error instanceof ContractError ? error.code : ERROR_CODES.STORAGE_ERROR;
    console.error(`AI Clipper: storage initialization check failed (${code}).`);
  }
}

/**
 * Map a ContractError or unexpected failure to a safe, non-sensitive action tooltip.
 * @param {unknown} error Capture or storage error.
 * @returns {string} Sanitized tooltip text without clip contents or URLs.
 */
function sanitizeActionTitle(error) {
  const code = error instanceof ContractError ? error.code : ERROR_CODES.INTERNAL_ERROR;
  switch (code) {
    case ERROR_CODES.INVALID_REQUEST:
      return 'AI-Ready Context Clipper — Select non-empty text to save';
    case ERROR_CODES.QUOTA_EXCEEDED:
      return 'AI-Ready Context Clipper — Storage quota exceeded';
    case ERROR_CODES.UNSUPPORTED_SCHEMA:
      return 'AI-Ready Context Clipper — Unsupported saved data version';
    case ERROR_CODES.STORAGE_ERROR:
      return 'AI-Ready Context Clipper — Local storage error';
    default:
      return 'AI-Ready Context Clipper — Could not save selection';
  }
}

/**
 * Safely update the toolbar action badge and tooltip without throwing unhandled rejections.
 * @param {string} badgeText Badge text ('' to clear, '!' on capture error).
 * @param {string} title Sanitized action title.
 * @returns {Promise<void>} Resolves after updating badge and title.
 */
async function setActionFeedback(badgeText, title) {
  if (!chrome.action) return;
  try {
    if (typeof chrome.action.setBadgeText === 'function') {
      await chrome.action.setBadgeText({ text: badgeText });
    }
    if (typeof chrome.action.setTitle === 'function') {
      await chrome.action.setTitle({ title });
    }
  } catch {
    console.error('AI Clipper: could not update action indicator.');
  }
}

/**
 * Build a sanitized Contract v1 failure response envelope.
 * @param {string|null} requestId Valid UUID requestId or null for malformed requests.
 * @param {string} code Contract error code.
 * @param {string} message Safe error message.
 * @returns {import('./shared/contracts.js').Response} Failure response envelope.
 */
function errorEnvelope(requestId, code, message) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    ok: false,
    error: { code, message },
  };
}

/**
 * Extract a valid UUID v4 requestId for failure correlation, or null to avoid input reflection.
 * @param {unknown} message Incoming message payload.
 * @returns {string|null} Valid UUID v4 string or null.
 */
function safeCorrelationId(message) {
  if (message !== null && typeof message === 'object' && !Array.isArray(message) &&
      typeof message.requestId === 'string' && UUID_V4.test(message.requestId)) {
    return message.requestId;
  }
  return null;
}

/**
 * Handle extension install or update by configuring panel, context menu, and default state.
 * @returns {Promise<void>} Resolves after initialization steps finish.
 */
async function handleInstalled() {
  await Promise.all([
    configurePanel(),
    ensureContextMenu(),
    ensureInitializedState(),
  ]);
}

/**
 * Handle browser startup by reasserting side panel behavior and context menu setup.
 * @returns {Promise<void>} Resolves after startup setup finishes.
 */
async function handleStartup() {
  await Promise.all([
    configurePanel(),
    ensureContextMenu(),
  ]);
}

/**
 * Queue toolbar badge and title feedback while ignoring stale outcomes superseded by newer clicks.
 * @param {number} captureSeq Sequence number assigned synchronously when the click arrived.
 * @param {string} badgeText Badge text ('' to clear, '!' on capture error).
 * @param {string} title Sanitized action title.
 * @returns {Promise<void>} Resolves after the feedback step settles.
 */
function scheduleActionFeedback(captureSeq, badgeText, title) {
  const run = feedbackTail.then(async () => {
    if (captureSeq !== latestCaptureSeq) return;
    await setActionFeedback(badgeText, title);
  });
  feedbackTail = run.catch(() => {
    console.error('AI Clipper: could not update action indicator.');
  });
  return feedbackTail;
}

/**
 * Handle context menu click events to capture selected text without auto-opening the panel.
 * @param {chrome.contextMenus.OnClickData} info Context menu click metadata.
 * @param {chrome.tabs.Tab|undefined} tab Source tab metadata.
 * @returns {Promise<void>} Resolves after persistence and latest-click badge update settle.
 */
async function handleContextMenuClick(info, tab) {
  if (info?.menuItemId !== CONTEXT_MENU_ID) return;
  const captureSeq = ++latestCaptureSeq;
  try {
    const clip = createClip(info, tab);
    await addClip(clip);
    await scheduleActionFeedback(captureSeq, '', DEFAULT_ACTION_TITLE);
  } catch (error) {
    const code = error instanceof ContractError ? error.code : ERROR_CODES.INTERNAL_ERROR;
    console.error(`AI Clipper: capture failed (${code}).`);
    await scheduleActionFeedback(captureSeq, '!', sanitizeActionTitle(error));
  }
}

/**
 * Safely deliver a response envelope when the messaging channel is still open.
 * Logs a sanitized diagnostic without retrying or duplicating mutations if delivery throws.
 * @param {(response: import('./shared/contracts.js').Response) => void} sendResponse Chrome callback.
 * @param {import('./shared/contracts.js').Response} response Contract v1 response envelope.
 * @returns {void}
 */
function deliverResponse(sendResponse, response) {
  try {
    sendResponse(response);
  } catch {
    console.error('AI Clipper: could not deliver command response.');
  }
}

/**
 * Authenticate side-panel sender and route validated mutation commands to the repository queue.
 * Uses a synchronous listener and returns literal `true` only when async response work is queued.
 * @param {unknown} message Incoming runtime message.
 * @param {chrome.runtime.MessageSender} sender Chrome message sender metadata.
 * @param {(response: import('./shared/contracts.js').Response) => void} sendResponse Response callback.
 * @returns {boolean} True when sendResponse will be called asynchronously, otherwise false.
 */
function handleRuntimeMessage(message, sender, sendResponse) {
  const runtimeId = chrome.runtime?.id;
  const expectedUrl = typeof chrome.runtime?.getURL === 'function'
    ? chrome.runtime.getURL(SIDEPANEL_PATH)
    : '';
  if (typeof runtimeId !== 'string' || !runtimeId || typeof expectedUrl !== 'string' || !expectedUrl ||
      !sender || sender.id !== runtimeId || sender.url !== expectedUrl) {
    deliverResponse(
      sendResponse,
      errorEnvelope(null, ERROR_CODES.INVALID_REQUEST, 'Unauthorized message sender.')
    );
    return false;
  }

  let validCommand;
  try {
    validCommand = validateCommand(message);
  } catch (error) {
    const code = error instanceof ContractError ? error.code : ERROR_CODES.INVALID_REQUEST;
    const safeMessage = error instanceof ContractError ? error.message : 'Invalid command.';
    deliverResponse(
      sendResponse,
      errorEnvelope(safeCorrelationId(message), code, safeMessage)
    );
    return false;
  }

  applyCommand(validCommand)
    .then((nextState) => {
      deliverResponse(sendResponse, {
        protocolVersion: PROTOCOL_VERSION,
        requestId: validCommand.requestId,
        ok: true,
        revision: nextState.revision,
      });
    })
    .catch((error) => {
      if (error instanceof ContractError) {
        deliverResponse(
          sendResponse,
          errorEnvelope(validCommand.requestId, error.code, error.message)
        );
        return;
      }
      console.error('AI Clipper: unexpected command error.');
      deliverResponse(
        sendResponse,
        errorEnvelope(validCommand.requestId, ERROR_CODES.INTERNAL_ERROR, 'Internal extension error.')
      );
    });

  return true;
}

// Register all MV3 event listeners synchronously at top level before async work.
chrome.runtime.onInstalled.addListener(handleInstalled);
chrome.runtime.onStartup.addListener(handleStartup);
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
chrome.runtime.onMessage.addListener(handleRuntimeMessage);
void configurePanel();
