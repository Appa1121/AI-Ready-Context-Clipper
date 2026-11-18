import test from 'node:test';
import assert from 'node:assert/strict';
import { createClip } from '../src/background/capture.js';
import { ContractError, isClip } from '../src/shared/contracts.js';

const hasCode = (code) => (error) => error instanceof ContractError && error.code === code;

test('createClip preserves whitespace, newlines, Thai, emoji, and HTML-like strings as data', () => {
  const selectionText = '  บรรทัดแรก 😀\n\t<script>alert("xss")</script>  ';
  const clip = createClip(
    {
      selectionText,
      pageUrl: 'https://example.com/article?id=1',
      frameUrl: 'https://ads.example.com/frame',
      linkUrl: 'https://link.example.com/target',
    },
    {
      title: 'Example Article',
      url: 'https://example.com/article?id=1',
    }
  );

  assert.equal(isClip(clip), true);
  assert.equal(clip.text, selectionText);
  assert.equal(clip.title, 'Example Article');
  assert.equal(clip.url, 'https://example.com/article?id=1');
  assert.match(clip.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(new Date(Date.parse(clip.createdAt)).toISOString(), clip.createdAt);
});

test('createClip generates unique IDs for duplicate selection text', () => {
  const first = createClip({ selectionText: 'Repeated snippet', pageUrl: 'https://example.com/1' }, { title: 'Doc' });
  const second = createClip({ selectionText: 'Repeated snippet', pageUrl: 'https://example.com/1' }, { title: 'Doc' });
  assert.notEqual(first.id, second.id);
  assert.equal(first.text, second.text);
});

test('createClip rejects missing or blank selection with sanitized INVALID_REQUEST', () => {
  const badInputs = [undefined, null, {}, { selectionText: '' }, { selectionText: '   \n\t  ' }, { selectionText: 42 }];
  for (const info of badInputs) {
    assert.throws(() => createClip(info, { title: 'Private Title', url: 'https://private.example/secret' }), (err) => {
      assert.equal(hasCode('INVALID_REQUEST')(err), true);
      assert.equal(err.message.includes('Private Title'), false);
      assert.equal(err.message.includes('secret'), false);
      return true;
    });
  }
});

test('createClip rejects internal chrome-extension viewer URLs and falls back to usable tab URL', () => {
  const fromHttpsPdf = createClip(
    {
      selectionText: 'Selectable PDF text',
      pageUrl: 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html',
      frameUrl: 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/pdf.html',
    },
    {
      title: 'Research Paper.pdf',
      url: 'https://example.com/papers/research.pdf',
    }
  );
  assert.equal(fromHttpsPdf.url, 'https://example.com/papers/research.pdf');
  assert.equal(fromHttpsPdf.title, 'Research Paper.pdf');

  const fromLocalPdf = createClip(
    {
      selectionText: 'Local PDF paragraph',
      pageUrl: 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html',
    },
    {
      title: '',
      url: 'file:///C:/synthetic/local-sample.pdf',
    }
  );
  assert.equal(fromLocalPdf.url, 'file:///C:/synthetic/local-sample.pdf');
  assert.equal(fromLocalPdf.title, 'file:///C:/synthetic/local-sample.pdf');
  const fromBlobPdfFallback = createClip(
    {
      selectionText: 'Blob PDF paragraph',
      pageUrl: 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html',
    },
    {
      title: 'Generated Report.pdf',
      url: 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000',
    }
  );
  assert.equal(fromBlobPdfFallback.url, 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000');
  assert.equal(fromBlobPdfFallback.title, 'Generated Report.pdf');

  const fromMatchingBlob = createClip(
    {
      selectionText: 'Blob PDF direct',
      pageUrl: 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000',
    },
    {
      title: '',
      url: 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000',
    }
  );
  assert.equal(fromMatchingBlob.url, 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000');
  assert.equal(fromMatchingBlob.title, 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000');
});

test('createClip ignores linkUrl/frameUrl, handles unusable URLs, and falls back title to URL or Untitled', () => {
  const iframeClip = createClip(
    {
      selectionText: 'Inside iframe',
      frameUrl: 'https://child-iframe.example/widget',
      linkUrl: 'https://hovered-link.example/out',
      pageUrl: 'https://parent-page.example/main',
    },
    {
      title: '   ',
      url: 'https://parent-page.example/main',
    }
  );
  assert.equal(iframeClip.url, 'https://parent-page.example/main');
  assert.equal(iframeClip.title, 'https://parent-page.example/main');

  const untitledClip = createClip(
    {
      selectionText: 'Only selection',
      pageUrl: 'chrome-extension://internal/viewer.html',
      linkUrl: 'https://should-never-be-used.example',
      frameUrl: 'https://should-never-be-used.example/frame',
    },
    {
      title: '   ',
      url: 'not-a-valid-url',
    }
  );
  assert.equal(untitledClip.url, '');
  assert.equal(untitledClip.title, 'Untitled');
});
