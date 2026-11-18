/**
 * Find a backtick delimiter longer than every run in the given text.
 * @param {string} text Content to delimit.
 * @param {number} minimum Minimum delimiter length.
 * @returns {string} Backtick delimiter.
 */
function backtickDelimiter(text, minimum) {
  let length = minimum;
  for (const run of text.matchAll(/`+/g)) {
    length = Math.max(length, run[0].length + 1);
  }
  return '`'.repeat(length);
}

/**
 * Escape metadata in a Markdown code span, which also prevents automatic links.
 * @param {string} value Source metadata.
 * @returns {string} A single-line code span with line breaks represented as spaces.
 */
function formatMetadata(value) {
  const line = value.replace(/\r\n|[\r\n\u0085\u2028\u2029]/g, ' ');
  const delimiter = backtickDelimiter(line, 1);
  // Markdown removes one space on either side of a padded span unless it is all spaces.
  const padding = /^ +$/.test(line) ? '' : ' ';
  return `${delimiter}${padding}${line}${padding}${delimiter}`;
}

/**
 * Format a prompt synchronously from valid Contract v1 inputs without modifying them.
 * @param {ReadonlyArray<Readonly<import('../shared/contracts.js').Clip>>} clips Clips in insertion order.
 * @param {Readonly<import('../shared/contracts.js').Settings>} settings Prefix and suffix strings.
 * @returns {string} The Markdown prompt, or an empty string when there are no clips.
 */
export function buildMarkdownPrompt(clips, settings) {
  if (clips.length === 0) return '';

  const sections = clips.map(({ title, url, createdAt, text }, index) => {
    const fence = backtickDelimiter(text, 3);
    // A standalone LF here would combine with a terminal CR from the body.
    const closingBreak = text.endsWith('\r') ? '\r\n' : '\n';

    return [
      `## Source ${index + 1}: ${formatMetadata(title)}`,
      url === '' ? 'URL: Unavailable' : `URL: ${formatMetadata(url)}`,
      `Captured (UTC): ${formatMetadata(createdAt)}`,
      `${fence}\n${text}${closingBreak}${fence}`,
    ].join('\n\n');
  });

  const { promptPrefix, promptSuffix } = settings;
  const prefix = promptPrefix + (promptPrefix.endsWith('\r') ? '\r\n\n' : '\n\n');
  const suffix = `\n\n${promptSuffix}`;
  return (promptPrefix ? prefix : '') + sections.join('\n\n') + (promptSuffix ? suffix : '');
}
