import test from 'node:test';
import assert from 'node:assert/strict';
import { ContractError, validateCommand, validateState, isClip } from '../src/shared/contracts.js';
import { createDefaultState } from '../src/shared/defaults.js';

const id = '550e8400-e29b-41d4-a716-446655440000';
const clip = () => ({ id, text: '  ไทย 😀\n<script>synthetic</script>  ', title: 'Example', url: 'https://example.com/', createdAt: '2026-11-17T09:00:00.000Z' });
const command = (type = 'DELETE_CLIP', payload = { id }) => ({ protocolVersion: 1, requestId: id, type, expectedRevision: 0, payload });
const hasCode = (code) => (error) => error instanceof ContractError && error.code === code;

test('valid commands preserve their input and allow empty prompt strings', () => {
  for (const value of [command(), command('CLEAR_CLIPS', {}), command('UPDATE_SETTINGS', { promptPrefix: '', promptSuffix: '' })]) {
    const before = structuredClone(value);
    assert.equal(validateCommand(value), value);
    assert.deepEqual(value, before);
  }
});

test('malformed envelopes, unknown protocol/commands, and unsafe revisions are rejected', () => {
  const malformed = [null, [], 'DELETE_CLIP', {},
    { ...command(), protocolVersion: 2 }, { ...command(), type: 'ADD_CLIP' },
    { ...command(), requestId: '<script>' }, { ...command(), extra: true },
    ...[-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, '0'].map((expectedRevision) => ({ ...command(), expectedRevision })),
  ];
  for (const value of malformed) assert.throws(() => validateCommand(value), hasCode('INVALID_REQUEST'));
});

test('payloads cannot mix command types or smuggle extra fields', () => {
  const malformed = [command('DELETE_CLIP', {}), command('DELETE_CLIP', { id: 'bad' }),
    command('DELETE_CLIP', { id, text: 'extra' }), command('CLEAR_CLIPS', { id }),
    command('CLEAR_CLIPS', []), command('UPDATE_SETTINGS', { promptPrefix: '' }),
    command('UPDATE_SETTINGS', { promptPrefix: 123, promptSuffix: '' }),
    command('UPDATE_SETTINGS', { promptPrefix: '', promptSuffix: '', html: '<b>' }),
  ];
  for (const value of malformed) assert.throws(() => validateCommand(value), hasCode('INVALID_REQUEST'));
});

test('fresh defaults are isolated between callers and contain valid state', () => {
  const first = createDefaultState();
  const second = createDefaultState();
  first.settings.promptPrefix = 'changed';
  first.clips.push(clip());
  assert.notEqual(first.settings.promptPrefix, second.settings.promptPrefix);
  assert.deepEqual(second.clips, []);
  assert.equal(validateState(first), first);
  assert.equal(validateState(second), second);
});

test('clip validation preserves whitespace, Unicode and inert HTML-like data', () => {
  const value = clip();
  const before = structuredClone(value);
  assert.equal(isClip(value), true);
  assert.deepEqual(value, before);
  assert.equal(isClip({ ...value, text: ' \n\t' }), false);
  assert.equal(isClip({ ...value, createdAt: '2026-02-30T09:00:00.000Z' }), false);
  assert.equal(isClip({ ...value, createdAt: 'not-a-date' }), false);
  assert.equal(isClip({ ...value, url: '' }), true);
});

test('corrupt data is rejected without mutation or reset', () => {
  const cases = [null, {}, { ...createDefaultState(), revision: -1 },
    { ...createDefaultState(), clips: [clip(), clip()] },
    { ...createDefaultState(), clips: [{ ...clip(), text: '' }] },
    { ...createDefaultState(), settings: { promptPrefix: '' } },
    { ...createDefaultState(), unknownField: true },
  ];
  for (const value of cases) {
    const before = structuredClone(value);
    assert.throws(() => validateState(value), hasCode('STORAGE_ERROR'));
    assert.deepEqual(value, before);
  }
});

test('unknown schema is distinguished from ordinary corruption', () => {
  const value = { ...createDefaultState(), schemaVersion: 2 };
  assert.throws(() => validateState(value), hasCode('UNSUPPORTED_SCHEMA'));
  assert.equal(value.schemaVersion, 2);
});
