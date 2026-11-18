import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src');
const failures = [];

/** @param {string} directory Absolute directory. @returns {Promise<string[]>} Recursive file list. */
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(full) : [full];
  }));
  return groups.flat();
}

/** @param {boolean} condition Invariant. @param {string} message Diagnostic. @returns {void} */
function check(condition, message) {
  if (!condition) failures.push(message);
}

/** @param {string} base Asset directory. @param {string} reference Local asset. @returns {Promise<void>} */
async function checkAsset(base, reference) {
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(reference)) {
    failures.push(`Remote asset prohibited: ${reference}`);
    return;
  }
  const full = path.resolve(base, reference);
  const relative = path.relative(source, full);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    failures.push(`Asset escapes src: ${reference}`);
    return;
  }
  try { await access(full); } catch { failures.push(`Missing asset: ${reference}`); }
}

const manifest = JSON.parse(await readFile(path.join(source, 'manifest.json'), 'utf8'));
const permissions = ['activeTab', 'contextMenus', 'sidePanel', 'storage'];
check(JSON.stringify([...manifest.permissions].sort()) === JSON.stringify(permissions), 'Permissions differ from Contract v1.');
check(manifest.manifest_version === 3 && manifest.minimum_chrome_version === '116', 'MV3/Chrome baseline mismatch.');
check(manifest.background?.type === 'module', 'Worker must use ES modules.');
check(Boolean(manifest.action) && !manifest.action.default_popup, 'Action must open side panel without popup.');
for (const forbidden of ['host_permissions', 'optional_host_permissions', 'optional_permissions', 'content_scripts', 'externally_connectable', 'update_url']) {
  check(!(forbidden in manifest), `Forbidden manifest key: ${forbidden}`);
}
await checkAsset(source, manifest.background.service_worker);
await checkAsset(source, manifest.side_panel.default_path);
for (const icon of Object.values(manifest.icons ?? {})) await checkAsset(source, icon);

const sourceFiles = await filesIn(source);
const allCode = [...sourceFiles, ...await filesIn(path.join(root, 'tests')), ...await filesIn(path.join(root, 'scripts'))];
for (const file of allCode.filter((name) => /\.(m?js)$/.test(name))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  check(result.status === 0, `Syntax: ${path.relative(root, file)} ${result.stderr || result.error?.message || ''}`);
}
for (const file of sourceFiles) {
  const text = await readFile(file, 'utf8');
  const label = path.relative(root, file);
  check(!/\binnerHTML\b|\beval\s*\(|new\s+Function\s*\(/.test(text), `Unsafe execution/rendering: ${label}`);
  if (file.endsWith('.html')) {
    check(!/\son[a-z]+\s*=/i.test(text), `Inline event handler: ${label}`);
    for (const script of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      check(/\bsrc\s*=/.test(script[1]) && !script[2].trim(), `Inline script: ${label}`);
    }
    for (const attribute of text.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (!attribute[1].startsWith('#')) await checkAsset(path.dirname(file), attribute[1]);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Static checks passed (${allCode.filter((file) => /\.(m?js)$/.test(file)).length} JavaScript files; manifest and local HTML assets checked).`);
}
