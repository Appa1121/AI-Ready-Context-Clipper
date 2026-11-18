import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMarkdownPrompt } from '../src/export/markdown.js';

const noWrapper = Object.freeze({ promptPrefix: '', promptSuffix: '' });
const clip = Object.freeze({
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'แหล่งข้อมูล 😀',
  url: 'https://example.invalid/source',
  createdAt: '2026-11-17T09:00:00.000Z',
  text: '  ข้อความ 😀\nบรรทัดที่สอง  ',
});

test('an empty clip array returns an empty prompt even with wrapper text', () => {
  const settings = Object.freeze({ promptPrefix: 'Prefix', promptSuffix: 'Suffix' });
  assert.equal(buildMarkdownPrompt(Object.freeze([]), settings), '');
});

test('numbered sources keep insertion order and preserve frozen inputs', () => {
  const second = Object.freeze({
    ...clip,
    id: '3a48235f-0f41-4d61-8003-6eed42b57b1d',
    title: 'Second clip',
    url: '',
    createdAt: '2026-11-16T09:00:00.000Z',
  });
  const clips = Object.freeze([clip, second]);
  const settings = Object.freeze({ promptPrefix: '  ก่อน 😀\r\n', promptSuffix: '\nหลัง  ' });
  const original = structuredClone({ clips, settings });

  assert.equal(buildMarkdownPrompt(clips, settings), [
    settings.promptPrefix,
    '## Source 1: ` แหล่งข้อมูล 😀 `',
    'URL: ` https://example.invalid/source `',
    'Captured (UTC): ` 2026-11-17T09:00:00.000Z `',
    '```\n  ข้อความ 😀\nบรรทัดที่สอง  \n```',
    '## Source 2: ` Second clip `',
    'URL: Unavailable',
    'Captured (UTC): ` 2026-11-16T09:00:00.000Z `',
    '```\n  ข้อความ 😀\nบรรทัดที่สอง  \n```',
    settings.promptSuffix,
  ].join('\n\n'));
  assert.deepEqual({ clips, settings }, original);
});

test('each prompt wrapper can be omitted independently', () => {
  const clips = [clip];
  const core = buildMarkdownPrompt(clips, noWrapper);
  assert.ok(core.startsWith('## Source 1: '));
  assert.ok(core.endsWith('\n```'));
  assert.equal(buildMarkdownPrompt(clips, { ...noWrapper, promptPrefix: ' Prefix\r' }), ` Prefix\r\r\n\n${core}`);
  assert.equal(buildMarkdownPrompt(clips, { ...noWrapper, promptSuffix: ' Suffix ' }), `${core}\n\n Suffix `);
  assert.equal(buildMarkdownPrompt(clips, { ...noWrapper, promptPrefix: ' ' }), ` \n\n${core}`);
});

test('the chosen fence exceeds backtick runs and preserves the original line endings', () => {
  const body = '  ```inline\r\n`````\n~~~\r## Body heading\nท้าย😀  ';
  const fence = '``````';
  for (const ending of ['', '\n', '\r\n', '\r']) {
    const text = body + ending;
    const prompt = buildMarkdownPrompt([{ ...clip, text }], noWrapper);
    const separator = ending === '\r' ? '\r\n' : '\n';
    assert.equal(prompt.slice(prompt.indexOf(`\n\n${fence}`) + 2), `${fence}\n${text}${separator}${fence}`);
  }
});

test('hostile metadata stays within single-line code spans', () => {
  const title = '`[x](https://example.invalid) **bold** <script>&lt;\\`\r\n## Fake\r# Heading\n---\u2028```';
  const url = '<javascript:synthetic()> www.example.invalid user@example.invalid\u0085```\u2029{{value}} :emoji: \\';
  const prompt = buildMarkdownPrompt([{ ...clip, title, url }], noWrapper);
  assert.deepEqual(prompt.split('\n\n').slice(0, 3), [
    '## Source 1: ```` `[x](https://example.invalid) **bold** <script>&lt;\\` ## Fake # Heading --- ``` ````',
    'URL: ```` <javascript:synthetic()> www.example.invalid user@example.invalid ``` {{value}} :emoji: \\ ````',
    'Captured (UTC): ` 2026-11-17T09:00:00.000Z `',
  ]);
});

test('nonempty whitespace-only URL data is rendered as literal metadata', () => {
  const prompt = buildMarkdownPrompt([{ ...clip, url: ' \r\n ' }], noWrapper);
  assert.equal(prompt.split('\n\n')[1], 'URL: `   `');
});
