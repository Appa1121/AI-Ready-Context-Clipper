import { ContractError, ERROR_CODES, isClip } from '../shared/contracts.js';

const REJECTED_URL_PROTOCOLS = new Set([
  'chrome-extension:',
  'chrome:',
  'chrome-untrusted:',
  'devtools:',
  'edge:',
  'about:',
  'javascript:',
  'data:',
  'blob:',
  'vbscript:',
]);

/**
 * Check whether a candidate document URL is usable under Contract v1.
 * Rejects blank values, malformed URLs, and internal/script viewer schemes.
 * @param {unknown} candidate Raw URL candidate from click info or tab metadata.
 * @returns {string} Preserved usable URL, or an empty string if unusable.
 */
function pickUsableUrl(candidate) {
  if (typeof candidate !== 'string') return '';
  const trimmed = candidate.trim();
  if (!trimmed) return '';
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return '';
  }
  if (REJECTED_URL_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
    return '';
  }
  return trimmed;
}

/**
 * Resolve top-level document URL using info.pageUrl first, then tab.url.
 * Never uses linkUrl or frameUrl.
 * @param {{pageUrl?: unknown}} info Context-menu click info.
 * @param {{url?: unknown}|undefined} tab Active tab metadata.
 * @returns {string} Usable source URL, or empty string when unavailable.
 */
function resolveSourceUrl(info, tab) {
  const fromPage = pickUsableUrl(info?.pageUrl);
  if (fromPage) return fromPage;
  return pickUsableUrl(tab?.url);
}

/**
 * Resolve source title using tab.title, then resolved source URL, then 'Untitled'.
 * @param {{title?: unknown}|undefined} tab Active tab metadata.
 * @param {string} sourceUrl Resolved source URL.
 * @returns {string} Non-blank clip title.
 */
function resolveSourceTitle(tab, sourceUrl) {
  if (typeof tab?.title === 'string' && tab.title.trim()) {
    return tab.title;
  }
  if (sourceUrl) return sourceUrl;
  return 'Untitled';
}

/**
 * Convert a context-menu selection click event and tab metadata into a Contract v1 Clip.
 * Preserves original selection whitespace and line breaks without trimming stored text.
 * @param {{selectionText?: unknown, pageUrl?: unknown}|null|undefined} info Context menu OnClickData.
 * @param {{title?: unknown, url?: unknown}|null|undefined} tab Chrome Tabs.Tab metadata.
 * @returns {import('../shared/contracts.js').Clip} Validated v1 Clip record.
 * @throws {ContractError} INVALID_REQUEST when selectionText is missing or blank, or INTERNAL_ERROR if assembly fails validation.
 */
export function createClip(info, tab) {
  if (!info || typeof info !== 'object' || typeof info.selectionText !== 'string' || !info.selectionText.trim()) {
    throw new ContractError(ERROR_CODES.INVALID_REQUEST, 'Selection text is required.');
  }

  const url = resolveSourceUrl(info, tab ?? undefined);
  const title = resolveSourceTitle(tab ?? undefined, url);
  const clip = {
    id: crypto.randomUUID(),
    text: info.selectionText,
    title,
    url,
    createdAt: new Date().toISOString(),
  };

  if (!isClip(clip)) {
    throw new ContractError(ERROR_CODES.INTERNAL_ERROR, 'Could not construct a valid clip.');
  }
  return clip;
}
