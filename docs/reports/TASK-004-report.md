# TASK-004 Report — Context capture and single-writer repository

Date: 2026-11-18 (Asia/Bangkok)

## Task ID / source base SHA / Contract version
- Task ID: `TASK-004` (Context capture and single-writer repository)
- Owner: Gemini Hydrogen (via Antigravity)
- Reviewer: Gemini Argon + GPT Astra
- Source base SHA (`main`): `0f5e7f38dba6e7399f638a5b130d63425b9aa263`
- Task spec SHA (`docs/tasks/TASK-004.md`): `0f5e7f38dba6e7399f638a5b130d63425b9aa263`
- Issue: https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/5
- Contract version: `v1`

## Files actually read / inaccessible inputs
- Read pinned inputs at `0f5e7f38dba6e7399f638a5b130d63425b9aa263`:
  - `AGENTS.md`
  - `PLAN.md`
  - `docs/CONTRACTS.md`
  - `docs/WORKFLOW.md`
  - `docs/TESTING.md`
  - `docs/adr/ADR-001-local-first-single-writer.md`
  - `docs/tasks/TASK-004.md`
  - `src/background.js`
  - `src/shared/contracts.js`
  - `src/shared/defaults.js`
  - `tests/background.test.js`
  - `scripts/check.mjs`
- Inaccessible inputs: None.

## Changed files
- `src/background.js`
- `src/background/capture.js`
- `src/background/repository.js`
- `tests/capture.test.js`
- `tests/repository.test.js`
- `tests/background.test.js`
- `docs/reports/TASK-004-report.md`

## Behavior and reasoning
1. **Pure capture (`src/background/capture.js`)**:
   - Exports `createClip(info, tab)` matching Contract v1 without mutating input text or relying on injected DOM scripts.
   - Rejects missing/non-string/whitespace-only `selectionText` with sanitized `ContractError(INVALID_REQUEST)` while preserving leading/trailing whitespace, line breaks, Unicode, and inert HTML-like strings in `clip.text`.
   - Resolves `url` strictly from `info.pageUrl` then `tab.url` (ignoring `linkUrl` and `frameUrl`), rejects internal/script viewer schemes (`chrome-extension:`, `chrome:`, `chrome-untrusted:`, `devtools:`, `edge:`, `about:`, `javascript:`, `data:`, `blob:`, `vbscript:`), preserves `http:`, `https:`, and `file:` URLs, and falls back `title` from `tab.title` → resolved `url` → `'Untitled'`.
   - Generates unique UUID v4 `id` (`crypto.randomUUID()`) and canonical UTC `createdAt` (`new Date().toISOString()`).
2. **Single-writer repository (`src/background/repository.js`)**:
   - Exports exclusively `readState()`, `addClip(clip)`, and `applyCommand(command)` per Contract v1, delegating all storage reads, initialization, and writes into one serial in-memory Promise queue (`enqueue`).
   - Queue rejects are consumed internally so subsequent queued operations continue while callers receive the original rejected Promise.
   - Missing `appState` initializes via `createDefaultState()` (`revision: 0`) on `readState()` / `applyCommand()`, and atomically at `revision: 1` on `addClip()` so a failed first write leaves storage unchanged.
   - Existing corrupt data (`STORAGE_ERROR`) and different `schemaVersion` (`UNSUPPORTED_SCHEMA`) are never reset, migrated, or overwritten.
   - Checks duplicate clip IDs (`CONFLICT`), `expectedRevision` mismatches (`CONFLICT`), missing delete targets (`NOT_FOUND`), and `Number.MAX_SAFE_INTEGER` overflow (`STORAGE_ERROR`) before writing.
   - Maps Chrome quota errors (`QuotaExceededError` / `QUOTA_BYTES quota exceeded`) to `QUOTA_EXCEEDED` and other storage/lastError failures to sanitized `STORAGE_ERROR` without trimming or deleting prior data.
3. **MV3 service worker (`src/background.js`)**:
   - Synchronously registers `runtime.onInstalled`, `runtime.onStartup`, `contextMenus.onClicked`, and `runtime.onMessage` at top level before async work; never registers `onMessageExternal`.
   - Creates `save-to-ai-clipper` (`contexts: ['selection']`) idempotently in a serialized setup chain, checking `chrome.runtime.lastError` in callbacks.
   - Captures clicks without opening the side panel, clearing the `!` badge and restoring default title on success, or showing badge `!` + sanitized tooltip on failure.
   - Authenticates `sender.id === chrome.runtime.id` (non-empty string) and `sender.url === chrome.runtime.getURL('sidepanel/sidepanel.html')` before running `validateCommand(message)` and routing valid commands to `applyCommand`. Uses a non-async `onMessage` listener returning literal `true` for async responses, and emits `requestId: null` on failure envelopes lacking a valid UUID v4 `requestId`.

## Commands and actual results

```text
> node scripts/check.mjs
Static checks passed (11 JavaScript files; manifest and local HTML assets checked).

> node --test
✔ worker registers all listeners synchronously before configuration and never registers onMessageExternal
✔ onInstalled creates save-to-ai-clipper menu idempotently and initializes missing storage without resetting existing data
✔ configuration and menu errors are handled safely without leaking raw API errors
✔ context menu click saves selection without opening panel, sets error badge on failure, and clears badge on recovery
✔ runtime.onMessage authenticates sender, avoids reflecting bad requestIds, and routes valid async commands
✔ createClip preserves whitespace, newlines, Thai, emoji, and HTML-like strings as data
✔ createClip generates unique IDs for duplicate selection text
✔ createClip rejects missing or blank selection with sanitized INVALID_REQUEST
✔ createClip rejects internal chrome-extension viewer URLs and falls back to usable tab URL
✔ createClip ignores linkUrl/frameUrl, handles unusable URLs, and falls back title to URL or Untitled
✔ valid commands preserve their input and allow empty prompt strings
✔ malformed envelopes, unknown protocol/commands, and unsafe revisions are rejected
✔ payloads cannot mix command types or smuggle extra fields
✔ fresh defaults are isolated between callers and contain valid state
✔ clip validation preserves whitespace, Unicode and inert HTML-like data
✔ corrupt data is rejected without mutation or reset
✔ unknown schema is distinguished from ordinary corruption
✔ readState initializes missing appState once even under concurrent calls
✔ concurrent addClip calls serialize without losing any clip and preserve duplicate text
✔ addClip rejects duplicate IDs and invalid clips without writing storage
✔ applyCommand handles DELETE_CLIP, CLEAR_CLIPS, UPDATE_SETTINGS, NOT_FOUND, and CONFLICT races
✔ storage rejection and quota exhaustion preserve prior data and allow subsequent queued writes
✔ corrupt data, unsupported schema, and revision overflow are never overwritten or reset
✔ worker restart simulation reads persisted state from storage and continues revisions cleanly
ℹ tests 24 | pass 24 | fail 0 | skipped 0
```

## Real Chrome verification scope (pre-PR smoke check)
- **OS / Chrome**: `Microsoft Windows NT 10.0.26300.0` / `Google Chrome 157.0.8103.80` (isolated temporary profile)
- **Verified in real Chrome**:
  - Unpacked load of `src/` succeeded (`state: "ENABLED"`, `manifestErrors: []`, `runtimeErrors: []`, `consoleErrorCount: 0`).
  - `onInstalled` persisted initialized `appState` at `revision: 0` in `chrome.storage.local` and created context menu `'save-to-ai-clipper'` (`chrome.contextMenus.update` succeeded).
  - `chrome.runtime.sendMessage` from `sidepanel.html` committed `UPDATE_SETTINGS` (`ok: true`, `revision: 1`), rejected stale `expectedRevision: 0` (`CONFLICT`), rejected malformed command without valid UUID (`requestId: null`, `INVALID_REQUEST`), and rejected non-sidepanel URL `sidepanel.html?spoof=1` (`requestId: null`, `INVALID_REQUEST`).

## Browser checks NOT RUN (belonging to TASK-006)
- Manual right-click capture on real HTTPS HTML pages, HTTPS selectable PDFs, local `file://` PDFs (with/without file-access setting), and cross-origin `<iframe>` parent metadata.
- Closing worker DevTools, allowing MV3 worker idle termination / browser restart, and verifying rapid right-click saves in the live browser UI.
- Note: Per `AGENTS.md`, Node mock tests and automated CDP messaging checks do not establish real browser PDF/context-menu acceptance (`TASK-006`).

## Limitations / blockers
- The writer queue is in-memory only; an abrupt browser crash before `chrome.storage.local.set` resolves can lose unpersisted in-flight work (consistent with Contract v1 and ADR-001).
- Side panel UI rendering (`TASK-007` / `TASK-008`) is not yet implemented, so captured clips are verified via storage/tests until M3 (or DevTools storage inspection in `TASK-006`).

## Integration steps / next action
- Commit `TASK-004` changes on `feat/task-004-capture-repository`, push, and open PR against `main` (`0f5e7f38dba6e7399f638a5b130d63425b9aa263`) for Argon + Astra review and CI verification.
