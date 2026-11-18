import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY } from '../src/shared/contracts.js';

const EXTENSION_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const SIDEPANEL_URL = `chrome-extension://${EXTENSION_ID}/sidepanel/sidepanel.html`;
const UUID_1 = '550e8400-e29b-41d4-a716-446655440001';

let workerSeq = 0;

function createMockChrome(options = {}) {
  const order = [];
  const listeners = {};
  const menus = [];
  const badgeCalls = [];
  const titleCalls = [];
  const consoleErrors = [];
  const store = new Map();
  if (options.initialState !== undefined) {
    store.set(STORAGE_KEY, structuredClone(options.initialState));
  }

  let failPanel = options.failPanel ?? null;
  let failMenuLastError = options.failMenuLastError ?? null;
  let failStorageSet = options.failStorageSet ?? null;
  let sidePanelOpened = false;

  const chrome = {
    runtime: {
      id: EXTENSION_ID,
      lastError: null,
      getURL: (p) => `chrome-extension://${EXTENSION_ID}/${p}`,
      onInstalled: {
        addListener: (fn) => {
          order.push('onInstalled');
          listeners.onInstalled = fn;
        },
      },
      onStartup: {
        addListener: (fn) => {
          order.push('onStartup');
          listeners.onStartup = fn;
        },
      },
      onMessage: {
        addListener: (fn) => {
          order.push('onMessage');
          listeners.onMessage = fn;
        },
      },
    },
    sidePanel: {
      setPanelBehavior: async (cfg) => {
        order.push('configurePanel');
        assert.equal(cfg.openPanelOnActionClick, true);
        if (failPanel) throw failPanel;
      },
      open: async () => {
        sidePanelOpened = true;
      },
    },
    contextMenus: {
      onClicked: {
        addListener: (fn) => {
          order.push('contextMenus.onClicked');
          listeners.onContextMenuClicked = fn;
        },
      },
      removeAll: (cb) => {
        menus.length = 0;
        chrome.runtime.lastError = null;
        cb?.();
      },
      create: (props, cb) => {
        if (failMenuLastError) {
          chrome.runtime.lastError = { message: failMenuLastError };
          cb?.();
          chrome.runtime.lastError = null;
          return;
        }
        menus.push(props);
        chrome.runtime.lastError = null;
        cb?.();
      },
    },
    action: {
      setBadgeText: async (details) => {
        badgeCalls.push(details.text);
      },
      setTitle: async (details) => {
        titleCalls.push(details.title);
      },
    },
    storage: {
      local: {
        async get(key) {
          if (key !== STORAGE_KEY || !store.has(STORAGE_KEY)) return {};
          return { [STORAGE_KEY]: structuredClone(store.get(STORAGE_KEY)) };
        },
        async set(items) {
          if (failStorageSet) {
            const err = failStorageSet;
            failStorageSet = null;
            throw err;
          }
          if (Object.hasOwn(items, STORAGE_KEY)) {
            store.set(STORAGE_KEY, structuredClone(items[STORAGE_KEY]));
          }
        },
      },
    },
  };

  return {
    chrome,
    order,
    listeners,
    menus,
    badgeCalls,
    titleCalls,
    consoleErrors,
    wasSidePanelOpened: () => sidePanelOpened,
    peekState: () => (store.has(STORAGE_KEY) ? structuredClone(store.get(STORAGE_KEY)) : undefined),
    setNextStorageError: (err) => { failStorageSet = err; },
  };
}

async function bootWorker(options = {}) {
  const env = createMockChrome(options);
  const originalError = console.error;
  console.error = (...args) => env.consoleErrors.push(args.join(' '));
  globalThis.chrome = env.chrome;
  workerSeq += 1;
  try {
    await import(`../src/background.js?worker=${workerSeq}`);
    await new Promise((r) => setTimeout(r, 10));
  } finally {
    console.error = originalError;
  }
  return {
    ...env,
    async withCapturedConsole(fn) {
      const orig = console.error;
      console.error = (...args) => env.consoleErrors.push(args.join(' '));
      globalThis.chrome = env.chrome;
      try {
        return await fn();
      } finally {
        console.error = orig;
      }
    },
  };
}

test('worker registers all listeners synchronously before configuration and never registers onMessageExternal', async () => {
  const env = await bootWorker();
  assert.deepEqual(env.order.slice(0, 5), [
    'onInstalled',
    'onStartup',
    'contextMenus.onClicked',
    'onMessage',
    'configurePanel',
  ]);
  assert.equal('onMessageExternal' in env.chrome.runtime, false);
});

test('onInstalled creates save-to-ai-clipper menu idempotently and initializes missing storage without resetting existing data', async () => {
  const env = await bootWorker();
  await env.withCapturedConsole(async () => {
    await env.listeners.onInstalled();
    await env.listeners.onInstalled();
  });

  assert.equal(env.menus.length, 1);
  assert.deepEqual(env.menus[0], {
    id: 'save-to-ai-clipper',
    title: 'Save to AI Clipper',
    contexts: ['selection'],
  });
  assert.equal(env.peekState()?.revision, 0);
  assert.deepEqual(env.peekState()?.clips, []);
});

test('configuration and menu errors are handled safely without leaking raw API errors', async () => {
  const env = await bootWorker({
    failPanel: new Error('SENSITIVE_PANEL_ERR'),
    failMenuLastError: 'SENSITIVE_MENU_ERR',
  });
  await env.withCapturedConsole(async () => {
    await env.listeners.onInstalled();
  });
  assert.ok(env.consoleErrors.length >= 2);
  assert.ok(env.consoleErrors.every((msg) => !msg.includes('SENSITIVE_PANEL_ERR') && !msg.includes('SENSITIVE_MENU_ERR')));
});

test('context menu click saves selection without opening panel, sets error badge on failure, and clears badge on recovery', async () => {
  const env = await bootWorker();
  await env.withCapturedConsole(async () => {
    await env.listeners.onInstalled();

    // Unrelated menu ID does nothing
    await env.listeners.onContextMenuClicked({ menuItemId: 'other-menu', selectionText: 'ignored' }, { url: 'https://example.com' });
    assert.equal(env.peekState().revision, 0);

    // Blank selection sets '!' badge without logging clip text/url
    await env.listeners.onContextMenuClicked(
      { menuItemId: 'save-to-ai-clipper', selectionText: '   ', pageUrl: 'https://private.example/secret-url' },
      { title: 'Secret Page', url: 'https://private.example/secret-url' }
    );
    assert.equal(env.badgeCalls.at(-1), '!');
    assert.equal(env.titleCalls.at(-1).includes('secret-url'), false);
    assert.equal(env.consoleErrors.every((msg) => !msg.includes('secret-url') && !msg.includes('Secret Page')), true);

    // Storage failure sets '!' badge
    env.setNextStorageError(new Error('QUOTA_BYTES quota exceeded'));
    await env.listeners.onContextMenuClicked(
      { menuItemId: 'save-to-ai-clipper', selectionText: '  Clip body\nline 2  ', pageUrl: 'https://example.com/a' },
      { title: 'Article A', url: 'https://example.com/a' }
    );
    assert.equal(env.badgeCalls.at(-1), '!');
    assert.match(env.titleCalls.at(-1), /quota/i);
    assert.equal(env.peekState().clips.length, 0);

    // Successful save clears badge and never opens side panel
    await env.listeners.onContextMenuClicked(
      { menuItemId: 'save-to-ai-clipper', selectionText: '  Clip body\nline 2  ', pageUrl: 'https://example.com/a' },
      { title: 'Article A', url: 'https://example.com/a' }
    );
    assert.equal(env.badgeCalls.at(-1), '');
    assert.equal(env.titleCalls.at(-1), 'Open AI-Ready Context Clipper');
    assert.equal(env.wasSidePanelOpened(), false);
    assert.equal(env.peekState().revision, 1);
    assert.equal(env.peekState().clips[0].text, '  Clip body\nline 2  ');
  });
});

test('runtime.onMessage authenticates sender, avoids reflecting bad requestIds, and routes valid async commands', async () => {
  const env = await bootWorker();
  await env.withCapturedConsole(async () => {
    await env.listeners.onInstalled();
    await env.listeners.onContextMenuClicked(
      { menuItemId: 'save-to-ai-clipper', selectionText: 'Saved text', pageUrl: 'https://example.com' },
      { title: 'Example', url: 'https://example.com' }
    );
    const clipId = env.peekState().clips[0].id;

    // 1. Reject unauthorized sender (wrong URL)
    let resp1 = null;
    const async1 = env.listeners.onMessage(
      { protocolVersion: 1, requestId: UUID_1, type: 'CLEAR_CLIPS', expectedRevision: 1, payload: {} },
      { id: EXTENSION_ID, url: `chrome-extension://${EXTENSION_ID}/popup.html` },
      (r) => { resp1 = r; }
    );
    assert.equal(async1, false);
    assert.deepEqual(resp1, {
      protocolVersion: 1,
      requestId: null,
      ok: false,
      error: { code: 'INVALID_REQUEST', message: 'Unauthorized message sender.' },
    });

    // 2. Reject wrong sender.id
    let resp2 = null;
    const async2 = env.listeners.onMessage(
      { protocolVersion: 1, requestId: UUID_1, type: 'CLEAR_CLIPS', expectedRevision: 1, payload: {} },
      { id: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', url: SIDEPANEL_URL },
      (r) => { resp2 = r; }
    );
    assert.equal(async2, false);
    assert.equal(resp2.ok, false);
    assert.equal(resp2.requestId, null);

    // 3. Malformed message without valid UUID returns requestId: null
    let resp3 = null;
    const async3 = env.listeners.onMessage(
      { requestId: '<script>xss</script>', type: 'ADD_CLIP' },
      { id: EXTENSION_ID, url: SIDEPANEL_URL },
      (r) => { resp3 = r; }
    );
    assert.equal(async3, false);
    assert.equal(resp3.ok, false);
    assert.equal(resp3.requestId, null);
    assert.equal(resp3.error.code, 'INVALID_REQUEST');

    // 4. Malformed command WITH valid UUID preserves UUID correlation
    let resp4 = null;
    const async4 = env.listeners.onMessage(
      { protocolVersion: 2, requestId: UUID_1, type: 'CLEAR_CLIPS', expectedRevision: 1, payload: {} },
      { id: EXTENSION_ID, url: SIDEPANEL_URL },
      (r) => { resp4 = r; }
    );
    assert.equal(async4, false);
    assert.equal(resp4.requestId, UUID_1);
    assert.equal(resp4.error.code, 'INVALID_REQUEST');

    // 5. Valid command returns literal true and resolves async response envelope
    const resp5 = await new Promise((resolve) => {
      const keepOpen = env.listeners.onMessage(
        { protocolVersion: 1, requestId: UUID_1, type: 'DELETE_CLIP', expectedRevision: 1, payload: { id: clipId } },
        { id: EXTENSION_ID, url: SIDEPANEL_URL },
        resolve
      );
      assert.equal(keepOpen, true);
    });
    assert.deepEqual(resp5, {
      protocolVersion: 1,
      requestId: UUID_1,
      ok: true,
      revision: 2,
    });
    assert.equal(env.peekState().clips.length, 0);

    // 6. Stale revision returns CONFLICT asynchronously
    const resp6 = await new Promise((resolve) => {
      const keepOpen = env.listeners.onMessage(
        { protocolVersion: 1, requestId: UUID_1, type: 'CLEAR_CLIPS', expectedRevision: 1, payload: {} },
        { id: EXTENSION_ID, url: SIDEPANEL_URL },
        resolve
      );
      assert.equal(keepOpen, true);
    });
    assert.equal(resp6.ok, false);
    assert.equal(resp6.requestId, UUID_1);
    assert.equal(resp6.error.code, 'CONFLICT');
  });
});
