import test from 'node:test';
import assert from 'node:assert/strict';
import { ContractError, STORAGE_KEY } from '../src/shared/contracts.js';
import { DEFAULT_SETTINGS } from '../src/shared/defaults.js';

const hasCode = (code) => (error) => error instanceof ContractError && error.code === code;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let instanceCounter = 0;
async function loadFreshRepository(storageArea) {
  globalThis.chrome = {
    storage: { local: storageArea },
    runtime: { lastError: null },
  };
  instanceCounter += 1;
  return import(`../src/background/repository.js?instance=${instanceCounter}`);
}

function createMockStorage(initialData = undefined) {
  const store = new Map();
  if (initialData !== undefined) {
    store.set(STORAGE_KEY, structuredClone(initialData));
  }
  let delayMs = 0;
  let nextSetError = null;
  let nextGetError = null;
  let setCalls = 0;
  let getCalls = 0;

  return {
    setDelay(ms) { delayMs = ms; },
    failNextSet(err) { nextSetError = err; },
    failNextGet(err) { nextGetError = err; },
    getStats() { return { setCalls, getCalls }; },
    peek() { return store.has(STORAGE_KEY) ? structuredClone(store.get(STORAGE_KEY)) : undefined; },
    async get(key) {
      getCalls += 1;
      if (delayMs) await sleep(delayMs);
      if (nextGetError) {
        const err = nextGetError;
        nextGetError = null;
        throw err;
      }
      if (key !== STORAGE_KEY || !store.has(STORAGE_KEY)) return {};
      return { [STORAGE_KEY]: structuredClone(store.get(STORAGE_KEY)) };
    },
    async set(items) {
      setCalls += 1;
      if (delayMs) await sleep(delayMs);
      if (nextSetError) {
        const err = nextSetError;
        nextSetError = null;
        throw err;
      }
      if (Object.hasOwn(items, STORAGE_KEY)) {
        store.set(STORAGE_KEY, structuredClone(items[STORAGE_KEY]));
      }
    },
  };
}

const makeClip = (id, text = 'Synthetic snippet') => ({
  id,
  text,
  title: 'Synthetic Doc',
  url: 'https://example.com/doc',
  createdAt: '2026-11-18T10:00:00.000Z',
});

const makeCmd = (requestId, type, expectedRevision, payload) => ({
  protocolVersion: 1,
  requestId,
  type,
  expectedRevision,
  payload,
});

const UUID_1 = '550e8400-e29b-41d4-a716-446655440001';
const UUID_2 = '550e8400-e29b-41d4-a716-446655440002';
const UUID_3 = '550e8400-e29b-41d4-a716-446655440003';
const UUID_4 = '550e8400-e29b-41d4-a716-446655440004';

test('readState initializes missing appState once even under concurrent calls', async () => {
  const storage = createMockStorage();
  storage.setDelay(10);
  const repo = await loadFreshRepository(storage);

  const [first, second] = await Promise.all([repo.readState(), repo.readState()]);
  assert.equal(first.revision, 0);
  assert.equal(second.revision, 0);
  assert.deepEqual(first.clips, []);
  assert.deepEqual(first.settings, DEFAULT_SETTINGS);
  assert.equal(storage.getStats().setCalls, 1);
});

test('concurrent addClip calls serialize without losing any clip and preserve duplicate text', async () => {
  const storage = createMockStorage();
  storage.setDelay(10);
  const repo = await loadFreshRepository(storage);

  const clipA = makeClip(UUID_1, '  Same text\nline 2  ');
  const clipB = makeClip(UUID_2, '  Same text\nline 2  ');
  const clipC = makeClip(UUID_3, 'Third snippet');

  const results = await Promise.all([repo.addClip(clipA), repo.addClip(clipB), repo.addClip(clipC)]);
  assert.deepEqual(results.map((r) => r.revision), [1, 2, 3]);

  const stored = storage.peek();
  assert.equal(stored.revision, 3);
  assert.deepEqual(stored.clips.map((c) => c.id), [UUID_1, UUID_2, UUID_3]);
  assert.equal(stored.clips[0].text, '  Same text\nline 2  ');
  assert.equal(stored.clips[1].text, '  Same text\nline 2  ');
});

test('addClip rejects duplicate IDs and invalid clips without writing storage', async () => {
  const storage = createMockStorage();
  const repo = await loadFreshRepository(storage);
  await repo.addClip(makeClip(UUID_1, 'First'));
  const before = storage.peek();

  await assert.rejects(() => repo.addClip(makeClip(UUID_1, 'Duplicate ID')), hasCode('CONFLICT'));
  await assert.rejects(() => repo.addClip({ id: 'bad', text: 'x', title: 't', url: '', createdAt: 'bad' }), hasCode('INVALID_REQUEST'));
  assert.deepEqual(storage.peek(), before);
});

test('applyCommand handles DELETE_CLIP, CLEAR_CLIPS, UPDATE_SETTINGS, NOT_FOUND, and CONFLICT races', async () => {
  const storage = createMockStorage();
  const repo = await loadFreshRepository(storage);
  await repo.addClip(makeClip(UUID_1, 'One'));
  await repo.addClip(makeClip(UUID_2, 'Two'));

  // Update settings at revision 2 -> 3 (including empty strings)
  const afterSettings = await repo.applyCommand(
    makeCmd(UUID_4, 'UPDATE_SETTINGS', 2, { promptPrefix: '', promptSuffix: 'Custom suffix' })
  );
  assert.equal(afterSettings.revision, 3);
  assert.deepEqual(afterSettings.settings, { promptPrefix: '', promptSuffix: 'Custom suffix' });
  assert.equal(afterSettings.clips.length, 2);

  // Missing clip ID -> NOT_FOUND, no write
  await assert.rejects(
    () => repo.applyCommand(makeCmd(UUID_4, 'DELETE_CLIP', 3, { id: UUID_3 })),
    hasCode('NOT_FOUND')
  );
  assert.equal(storage.peek().revision, 3);

  // Delete UUID_1 at revision 3 -> 4
  const afterDelete = await repo.applyCommand(
    makeCmd(UUID_4, 'DELETE_CLIP', 3, { id: UUID_1 })
  );
  assert.equal(afterDelete.revision, 4);
  assert.deepEqual(afterDelete.clips.map((c) => c.id), [UUID_2]);

  // Simulate add racing against stale CLEAR_CLIPS (expectedRevision 4)
  await repo.addClip(makeClip(UUID_3, 'Newly added'));
  await assert.rejects(
    () => repo.applyCommand(makeCmd(UUID_4, 'CLEAR_CLIPS', 4, {})),
    hasCode('CONFLICT')
  );
  assert.equal(storage.peek().revision, 5);
  assert.deepEqual(storage.peek().clips.map((c) => c.id), [UUID_2, UUID_3]);

  // Valid CLEAR_CLIPS at revision 5 -> 6 keeps custom settings
  const afterClear = await repo.applyCommand(makeCmd(UUID_4, 'CLEAR_CLIPS', 5, {}));
  assert.equal(afterClear.revision, 6);
  assert.deepEqual(afterClear.clips, []);
  assert.deepEqual(afterClear.settings, { promptPrefix: '', promptSuffix: 'Custom suffix' });
});

test('storage rejection and quota exhaustion preserve prior data and allow subsequent queued writes', async () => {
  const storage = createMockStorage();
  const repo = await loadFreshRepository(storage);
  await repo.addClip(makeClip(UUID_1, 'Keep me intact'));
  const snapshotBeforeFailure = storage.peek();

  const quotaErr = new Error('QUOTA_BYTES quota exceeded');
  storage.failNextSet(quotaErr);
  await assert.rejects(() => repo.addClip(makeClip(UUID_2, 'Too big')), hasCode('QUOTA_EXCEEDED'));
  assert.deepEqual(storage.peek(), snapshotBeforeFailure);

  storage.failNextSet(new Error('Disk I/O failed with PRIVATE_TOKEN_123'));
  await assert.rejects(() => repo.applyCommand(makeCmd(UUID_4, 'CLEAR_CLIPS', 1, {})), (err) => {
    assert.equal(hasCode('STORAGE_ERROR')(err), true);
    assert.equal(err.message.includes('PRIVATE_TOKEN_123'), false);
    return true;
  });
  assert.deepEqual(storage.peek(), snapshotBeforeFailure);

  // Queue continues smoothly after rejections
  const recovered = await repo.addClip(makeClip(UUID_3, 'After recovery'));
  assert.equal(recovered.revision, 2);
  assert.deepEqual(recovered.clips.map((c) => c.id), [UUID_1, UUID_3]);
});

test('corrupt data, unsupported schema, and revision overflow are never overwritten or reset', async () => {
  const corruptCases = [
    null,
    {},
    { schemaVersion: 1, revision: 0, clips: [], settings: { promptPrefix: 'x', promptSuffix: 'y' }, extra: true },
    { schemaVersion: 1, revision: 0, clips: [makeClip(UUID_1), makeClip(UUID_1)], settings: DEFAULT_SETTINGS },
  ];

  for (const corrupt of corruptCases) {
    const storage = createMockStorage(corrupt);
    const repo = await loadFreshRepository(storage);
    await assert.rejects(() => repo.readState(), hasCode('STORAGE_ERROR'));
    await assert.rejects(() => repo.addClip(makeClip(UUID_2)), hasCode('STORAGE_ERROR'));
    await assert.rejects(() => repo.applyCommand(makeCmd(UUID_4, 'CLEAR_CLIPS', 0, {})), hasCode('STORAGE_ERROR'));
    assert.equal(storage.getStats().setCalls, 0);
    assert.deepEqual(storage.peek(), corrupt);
  }

  const futureSchema = { schemaVersion: 2, revision: 9, clips: [], settings: DEFAULT_SETTINGS };
  const futureStorage = createMockStorage(futureSchema);
  const futureRepo = await loadFreshRepository(futureStorage);
  await assert.rejects(() => futureRepo.readState(), hasCode('UNSUPPORTED_SCHEMA'));
  await assert.rejects(() => futureRepo.addClip(makeClip(UUID_2)), hasCode('UNSUPPORTED_SCHEMA'));
  assert.equal(futureStorage.getStats().setCalls, 0);
  assert.deepEqual(futureStorage.peek(), futureSchema);

  const maxRevState = { schemaVersion: 1, revision: Number.MAX_SAFE_INTEGER, clips: [], settings: DEFAULT_SETTINGS };
  const maxStorage = createMockStorage(maxRevState);
  const maxRepo = await loadFreshRepository(maxStorage);
  await assert.rejects(() => maxRepo.addClip(makeClip(UUID_2)), hasCode('STORAGE_ERROR'));
  assert.equal(maxStorage.getStats().setCalls, 0);
});

test('worker restart simulation reads persisted state from storage and continues revisions cleanly', async () => {
  const storage = createMockStorage();
  const repoBeforeRestart = await loadFreshRepository(storage);
  await repoBeforeRestart.addClip(makeClip(UUID_1, 'Persisted before shutdown'));

  // Simulate MV3 service worker restart by loading a fresh module instance over the same storage
  const repoAfterRestart = await loadFreshRepository(storage);
  const restored = await repoAfterRestart.readState();
  assert.equal(restored.revision, 1);
  assert.equal(restored.clips.length, 1);
  assert.equal(restored.clips[0].text, 'Persisted before shutdown');

  const updated = await repoAfterRestart.addClip(makeClip(UUID_2, 'Added after restart'));
  assert.equal(updated.revision, 2);
  assert.deepEqual(updated.clips.map((c) => c.id), [UUID_1, UUID_2]);
});

test('rejected commands and failed first capture on absent storage perform zero net writes', async () => {
  const storage = createMockStorage();
  const repo = await loadFreshRepository(storage);

  // CONFLICT on absent storage must not initialize or write storage
  await assert.rejects(
    () => repo.applyCommand(makeCmd(UUID_4, 'CLEAR_CLIPS', 1, {})),
    hasCode('CONFLICT')
  );
  assert.equal(storage.getStats().setCalls, 0);
  assert.equal(storage.peek(), undefined);

  // NOT_FOUND on absent storage (expectedRevision 0) must not initialize or write storage
  await assert.rejects(
    () => repo.applyCommand(makeCmd(UUID_4, 'DELETE_CLIP', 0, { id: UUID_1 })),
    hasCode('NOT_FOUND')
  );
  assert.equal(storage.getStats().setCalls, 0);
  assert.equal(storage.peek(), undefined);

  // Failed first capture on absent storage leaves storage absent
  storage.failNextSet(new Error('QUOTA_BYTES quota exceeded'));
  await assert.rejects(() => repo.addClip(makeClip(UUID_1, 'Too big')), hasCode('QUOTA_EXCEEDED'));
  assert.equal(storage.peek(), undefined);
});

test('queued command snapshot resists caller mutation while an earlier operation is in flight', async () => {
  const storage = createMockStorage();
  storage.setDelay(15);
  const repo = await loadFreshRepository(storage);

  const pendingAdd = repo.addClip(makeClip(UUID_1, 'First clip'));
  const mutableCmd = makeCmd(UUID_4, 'UPDATE_SETTINGS', 1, {
    promptPrefix: 'Committed Prefix',
    promptSuffix: 'Committed Suffix',
  });
  const pendingCmd = repo.applyCommand(mutableCmd);

  // Mutate caller command object immediately after dispatching while queue is still busy
  mutableCmd.expectedRevision = 999;
  mutableCmd.payload.promptPrefix = 'TAMPERED_PREFIX';
  mutableCmd.payload.promptSuffix = 'TAMPERED_SUFFIX';

  await pendingAdd;
  const result = await pendingCmd;
  assert.equal(result.revision, 2);
  assert.deepEqual(result.settings, {
    promptPrefix: 'Committed Prefix',
    promptSuffix: 'Committed Suffix',
  });
});
