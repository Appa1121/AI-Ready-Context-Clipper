import {
  COMMAND_TYPES,
  ContractError,
  ERROR_CODES,
  SCHEMA_VERSION,
  STORAGE_KEY,
  isClip,
  validateCommand,
  validateState,
} from '../shared/contracts.js';
import { createDefaultState } from '../shared/defaults.js';

/**
 * Single in-memory Promise queue serializing all storage reads, initialization, and writes.
 * @type {Promise<void>}
 */
let queueTail = Promise.resolve();

/**
 * Enqueue an async storage task so all repository operations run strictly sequentially.
 * A rejection is consumed on the internal queue chain so later operations continue,
 * while the caller receives the original rejection via the returned Promise.
 * @template T
 * @param {() => Promise<T>} operation Work to run inside the serial queue.
 * @returns {Promise<T>} Resolves or rejects with the operation outcome.
 */
function enqueue(operation) {
  const run = queueTail.then(() => operation());
  queueTail = run.catch(() => {
    // Queue continuation: caller observes the rejection via `run`.
  });
  return run;
}

/**
 * Resolve the active extension local storage area.
 * @returns {{get: (keys: string) => Promise<Record<string, unknown>>, set: (items: Record<string, unknown>) => Promise<void>}}
 * @throws {ContractError} STORAGE_ERROR when chrome.storage.local is unavailable.
 */
function getStorageArea() {
  const area = globalThis.chrome?.storage?.local;
  if (!area || typeof area.get !== 'function' || typeof area.set !== 'function') {
    throw new ContractError(ERROR_CODES.STORAGE_ERROR, 'Local storage is unavailable.');
  }
  return area;
}

/**
 * Classify a Chrome storage error without exposing raw payloads or private messages.
 * Distinguishes quota exhaustion only when supported by the error name or message.
 * @param {unknown} error Caught storage failure or runtime.lastError.
 * @returns {ContractError} Sanitized ContractError (QUOTA_EXCEEDED or STORAGE_ERROR).
 */
function mapStorageError(error) {
  if (error instanceof ContractError) return error;
  const name = typeof error?.name === 'string' ? error.name : '';
  const message = typeof error?.message === 'string' ? error.message : '';
  if (name === 'QuotaExceededError' || /quota_bytes|quotaexceeded|quota\s*(?:is\s*)?exceeded/i.test(message)) {
    return new ContractError(ERROR_CODES.QUOTA_EXCEEDED, 'Local storage quota exceeded. Existing data has been preserved.');
  }
  return new ContractError(ERROR_CODES.STORAGE_ERROR, 'Local storage operation failed. Existing data has not been modified.');
}

/**
 * Consume and convert chrome.runtime.lastError if present.
 * @returns {ContractError|null} Mapped storage error, or null when clean.
 */
function readLastError() {
  const lastError = globalThis.chrome?.runtime?.lastError;
  if (!lastError) return null;
  return mapStorageError(lastError);
}

/**
 * Read the raw appState wrapper object from chrome.storage.local.
 * @param {{get: (keys: string) => Promise<Record<string, unknown>>}} storage Local storage area.
 * @returns {Promise<Record<string, unknown>>} Raw storage response object.
 * @throws {ContractError} STORAGE_ERROR on API rejection or runtime.lastError.
 */
async function readStorageEntry(storage) {
  try {
    const result = await storage.get(STORAGE_KEY);
    const lastError = readLastError();
    if (lastError) throw lastError;
    if (!result || typeof result !== 'object') {
      throw new ContractError(ERROR_CODES.STORAGE_ERROR, 'Local storage returned an invalid response.');
    }
    return result;
  } catch (error) {
    throw mapStorageError(error);
  }
}

/**
 * Persist a validated AppState snapshot under STORAGE_KEY.
 * @param {{set: (items: Record<string, unknown>) => Promise<void>}} storage Local storage area.
 * @param {import('../shared/contracts.js').AppState} state Validated next state snapshot.
 * @returns {Promise<void>} Resolves only after storage persistence completes.
 * @throws {ContractError} QUOTA_EXCEEDED or STORAGE_ERROR when write fails.
 */
async function writeStorageEntry(storage, state) {
  try {
    await storage.set({ [STORAGE_KEY]: state });
    const lastError = readLastError();
    if (lastError) throw lastError;
  } catch (error) {
    throw mapStorageError(error);
  }
}

/**
 * Clone a single clip record so stored and returned snapshots remain isolated.
 * @param {import('../shared/contracts.js').Clip} clip Valid clip.
 * @returns {import('../shared/contracts.js').Clip} Cloned clip.
 */
function cloneClip(clip) {
  return {
    id: clip.id,
    text: clip.text,
    title: clip.title,
    url: clip.url,
    createdAt: clip.createdAt,
  };
}

/**
 * Clone a full AppState snapshot to prevent external reference mutation.
 * @param {import('../shared/contracts.js').AppState} state Valid AppState.
 * @returns {import('../shared/contracts.js').AppState} Deep-copied AppState.
 */
function cloneState(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: state.revision,
    clips: state.clips.map(cloneClip),
    settings: {
      promptPrefix: state.settings.promptPrefix,
      promptSuffix: state.settings.promptSuffix,
    },
  };
}

/**
 * Safely increment revision without losing integer precision.
 * @param {number} revision Current nonnegative safe integer revision.
 * @returns {number} Incremented safe integer revision.
 * @throws {ContractError} STORAGE_ERROR if incrementing would exceed Number.MAX_SAFE_INTEGER.
 */
function nextRevision(revision) {
  if (!Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER) {
    throw new ContractError(ERROR_CODES.STORAGE_ERROR, 'State revision limit reached. Data has not been modified.');
  }
  return revision + 1;
}

/**
 * Read current storage state inside the queue; validate existing data without resetting it,
 * or indicate absence when STORAGE_KEY is not present.
 * @param {{get: (keys: string) => Promise<Record<string, unknown>>}} storage Local storage area.
 * @returns {Promise<{exists: boolean, state: import('../shared/contracts.js').AppState}>}
 * @throws {ContractError} UNSUPPORTED_SCHEMA or STORAGE_ERROR when stored data is invalid.
 */
async function readValidatedOrDefault(storage) {
  const entry = await readStorageEntry(storage);
  if (!Object.hasOwn(entry, STORAGE_KEY) || entry[STORAGE_KEY] === undefined) {
    return { exists: false, state: createDefaultState() };
  }
  return { exists: true, state: validateState(entry[STORAGE_KEY]) };
}

/**
 * Read and validate stored state, initializing missing appState at revision 0 inside the queue.
 * Existing corrupt or unsupported-schema data is never overwritten or reset.
 * @returns {Promise<import('../shared/contracts.js').AppState>} Validated AppState snapshot.
 * @throws {ContractError} STORAGE_ERROR or UNSUPPORTED_SCHEMA on read/validation/write failure.
 */
export async function readState() {
  return enqueue(async () => {
    const storage = getStorageArea();
    const { exists, state } = await readValidatedOrDefault(storage);
    if (!exists) {
      await writeStorageEntry(storage, state);
    }
    return cloneState(state);
  });
}

/**
 * Validate a clip and append it to the latest persisted state inside the serial queue.
 * Allows duplicate clip text with distinct IDs, rejects duplicate IDs without writing,
 * and initializes missing state atomically with the new clip at revision 1.
 * @param {import('../shared/contracts.js').Clip} clip Candidate clip created by capture.
 * @returns {Promise<import('../shared/contracts.js').AppState>} Persisted AppState after commit.
 * @throws {ContractError} INVALID_REQUEST, CONFLICT, QUOTA_EXCEEDED, STORAGE_ERROR, or UNSUPPORTED_SCHEMA.
 */
export async function addClip(clip) {
  if (!isClip(clip)) {
    throw new ContractError(ERROR_CODES.INVALID_REQUEST, 'Invalid clip.');
  }
  const snapshotClip = cloneClip(clip);

  return enqueue(async () => {
    const storage = getStorageArea();
    const { state } = await readValidatedOrDefault(storage);

    if (state.clips.some((existing) => existing.id === snapshotClip.id)) {
      throw new ContractError(ERROR_CODES.CONFLICT, 'Clip ID already exists.');
    }

    const next = {
      schemaVersion: SCHEMA_VERSION,
      revision: nextRevision(state.revision),
      clips: [...state.clips.map(cloneClip), snapshotClip],
      settings: {
        promptPrefix: state.settings.promptPrefix,
        promptSuffix: state.settings.promptSuffix,
      },
    };
    validateState(next);
    await writeStorageEntry(storage, next);
    return cloneState(next);
  });
}

/**
 * Apply an authenticated UI mutation command against the latest stored state inside the serial queue.
 * Enforces expectedRevision equality and preserves prior state on validation, conflict, or storage error.
 * @param {import('../shared/contracts.js').Command} command Validated or raw UI command envelope.
 * @returns {Promise<import('../shared/contracts.js').AppState>} Persisted AppState after commit.
 * @throws {ContractError} INVALID_REQUEST, CONFLICT, NOT_FOUND, QUOTA_EXCEEDED, STORAGE_ERROR, or UNSUPPORTED_SCHEMA.
 */
export async function applyCommand(command) {
  const validCommand = validateCommand(command);

  return enqueue(async () => {
    const storage = getStorageArea();
    const { exists, state } = await readValidatedOrDefault(storage);
    if (!exists) {
      await writeStorageEntry(storage, state);
    }

    if (validCommand.expectedRevision !== state.revision) {
      throw new ContractError(ERROR_CODES.CONFLICT, 'State revision mismatch. Reload and try again.');
    }

    let nextClips = state.clips.map(cloneClip);
    let nextSettings = {
      promptPrefix: state.settings.promptPrefix,
      promptSuffix: state.settings.promptSuffix,
    };

    switch (validCommand.type) {
      case COMMAND_TYPES.DELETE_CLIP: {
        const targetIndex = nextClips.findIndex((item) => item.id === validCommand.payload.id);
        if (targetIndex === -1) {
          throw new ContractError(ERROR_CODES.NOT_FOUND, 'Clip not found.');
        }
        nextClips = nextClips.filter((_, index) => index !== targetIndex);
        break;
      }
      case COMMAND_TYPES.CLEAR_CLIPS: {
        nextClips = [];
        break;
      }
      case COMMAND_TYPES.UPDATE_SETTINGS: {
        nextSettings = {
          promptPrefix: validCommand.payload.promptPrefix,
          promptSuffix: validCommand.payload.promptSuffix,
        };
        break;
      }
      default: {
        throw new ContractError(ERROR_CODES.INVALID_REQUEST, 'Invalid command.');
      }
    }

    const next = {
      schemaVersion: SCHEMA_VERSION,
      revision: nextRevision(state.revision),
      clips: nextClips,
      settings: nextSettings,
    };
    validateState(next);
    await writeStorageEntry(storage, next);
    return cloneState(next);
  });
}
