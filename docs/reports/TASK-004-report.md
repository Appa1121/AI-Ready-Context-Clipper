# TASK-004 Report — Context capture and single-writer repository

Date: 2026-11-18 (Asia/Bangkok)

## Task ID / source base SHA / Contract version
- Task ID: `TASK-004` (Context capture and single-writer repository)
- Owner: Gemini Hydrogen (via Antigravity)
- Reviewer: Gemini Argon + GPT Astra
- Source base SHA (`main`): `0f5e7f38dba6e7399f638a5b130d63425b9aa263`
- Task spec SHA (`docs/tasks/TASK-004.md`): `0f5e7f38dba6e7399f638a5b130d63425b9aa263`
- Issue: https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/5
- Pull Request: https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/7
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
- Also read GPT-6.2 Astra's review findings on PR #7 (`3525975d03a2b98492ed1750af6deb7a0ad66a3b`).
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
   - Resolves `url` strictly from `info.pageUrl` then `tab.url` (ignoring `linkUrl` and `frameUrl`), rejects internal `chrome-extension:` viewer URLs and malformed/blank URLs, and preserves valid document URLs (including `https:`, `http:`, `file:`, and `blob:`) as inert metadata. Falls back `title` from `tab.title` → resolved `url` → `'Untitled'`.
   - Generates unique UUID v4 `id` (`crypto.randomUUID()`) and canonical UTC `createdAt` (`new Date().toISOString()`).
2. **Single-writer repository (`src/background/repository.js`)**:
   - Exports exclusively `readState()`, `addClip(clip)`, and `applyCommand(command)` per Contract v1, delegating all storage reads, initialization, and writes into one serial in-memory Promise queue (`enqueue`).
   - Queue rejections are consumed internally so subsequent queued operations continue while callers receive the original rejected Promise.
   - **Argon Contract v1 confirmation on absent-state initialization**:
     - `readState()` (and `onInstalled`) initializes missing `appState` at `revision: 0`.
     - `applyCommand(command)` evaluates all preconditions (`expectedRevision`, `DELETE_CLIP` target lookup, safe revision increment) **before** performing any storage write, so `CONFLICT` and `NOT_FOUND` on absent storage execute **zero writes** (`setCalls === 0`). Accepted commands on absent storage (e.g., `expectedRevision === 0`) write `revision: 1` atomically in a single `storage.local.set`.
     - `addClip(clip)` on absent storage uses `createDefaultState()` (`revision: 0`) as its in-queue base and writes `revision: 1` atomically in a single `storage.local.set`. Under Contract v1's rule that storage/quota failures must preserve prior state, atomic single-write commit ensures a failed first capture never mutates absent storage to `revision: 0`.
   - Deep-clones validated commands (`snapshotCommand`) before enqueueing so caller mutations after dispatch cannot alter queued operations.
   - Preserves existing corrupt (`STORAGE_ERROR`) or different `schemaVersion` (`UNSUPPORTED_SCHEMA`) data untouched. Maps Chrome quota errors (`QuotaExceededError` / `QUOTA_BYTES quota exceeded`) to `QUOTA_EXCEEDED` and other storage/lastError failures to sanitized `STORAGE_ERROR`.
3. **MV3 service worker (`src/background.js`)**:
   - Synchronously registers `runtime.onInstalled`, `runtime.onStartup`, `contextMenus.onClicked`, and `runtime.onMessage` at top level before async work; never registers `onMessageExternal`.
   - Creates `save-to-ai-clipper` (`contexts: ['selection']`) idempotently in a serialized setup chain checking `chrome.runtime.lastError`.
   - Assigns a monotonic `latestCaptureSeq` at click entry and serializes badge/title updates via `feedbackTail`, dropping stale feedback from delayed earlier captures superseded by a newer click.
   - Authenticates non-empty `sender.id === chrome.runtime.id` and `sender.url === chrome.runtime.getURL('sidepanel/sidepanel.html')` before `validateCommand(message)` and `applyCommand`. Emits a fixed sanitized diagnostic (`'AI Clipper: could not deliver command response.'`) without retrying or duplicating mutations if `sendResponse` throws.

## Remediation summary for Astra PR #7 findings (reviewed on `3525975`)
- **P2 · Rejected commands writing storage**: Moved all precondition checks in `applyCommand` before `writeStorageEntry`; added zero-write assertions (`setCalls === 0`) for `CONFLICT` and `NOT_FOUND` on absent storage and failed first `addClip`.
- **P2 · Overlapping capture stale badge/title**: Added `latestCaptureSeq` + `feedbackTail` serialization in `src/background.js`; added deferred-storage overlap regression test in `tests/background.test.js`.
- **P2 · `blob:` document provenance dropped**: Removed unagreed extra protocol exclusions in `src/background/capture.js`, rejecting strictly `chrome-extension:` (plus blank/unparseable URLs); added synthetic `blob:` PDF test coverage in `tests/capture.test.js`.
- **P3 · Queued command mutability after validation**: Added `snapshotCommand` copy before `enqueue` in `src/background/repository.js`; added in-flight mutation test in `tests/repository.test.js`.
- **P3 · Silent `deliverResponse` catch**: Added sanitized diagnostic log in `src/background.js`; added throwing-callback regression test verifying single log and single mutation in `tests/background.test.js`.

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
✔ overlapping captures preserve toolbar feedback for the most recent click
✔ failed sendResponse callback logs one sanitized diagnostic without retrying mutation
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
✔ rejected commands and failed first capture on absent storage perform zero net writes
✔ queued command snapshot resists caller mutation while an earlier operation is in flight
ℹ tests 28 | pass 28 | fail 0 | skipped 0
```

## Real Chrome verification scope (pre-PR smoke check)
- **OS / Chrome**: `Microsoft Windows NT 10.0.26300.0` / `Google Chrome 157.0.8103.80` (isolated temporary profile)
- **Verified in real Chrome**:
  - Unpacked load of `src/` succeeded (`state: "ENABLED"`, `manifestErrors: []`, `runtimeErrors: []`, `consoleErrorCount: 0`).
  - `onInstalled` persisted initialized `appState` at `revision: 0` in `chrome.storage.local` and registered context menu `'save-to-ai-clipper'` (`chrome.contextMenus.update` succeeded).
  - `chrome.runtime.sendMessage` from `sidepanel.html` committed `UPDATE_SETTINGS` (`ok: true, revision: 1`), rejected stale `expectedRevision: 0` (`CONFLICT`), rejected malformed command without valid UUID (`requestId: null`, `INVALID_REQUEST`), and rejected non-sidepanel URL `sidepanel.html?spoof=1` (`requestId: null`, `INVALID_REQUEST`).

## Browser checks NOT RUN (belonging to TASK-006)
- Manual right-click capture on real HTTPS HTML pages, HTTPS selectable PDFs, local `file://` PDFs (with/without file-access setting), and cross-origin `<iframe>` parent metadata.
- Closing worker DevTools, allowing MV3 worker idle termination / browser restart, and verifying rapid right-click saves in the live browser UI.
- Note: Per `AGENTS.md`, Node mock tests and automated CDP messaging checks do not establish real browser PDF/context-menu acceptance (`TASK-006`).

## Limitations / blockers
- The writer queue is in-memory only; an abrupt browser crash before `chrome.storage.local.set` resolves can lose unpersisted in-flight work (consistent with Contract v1 and ADR-001).
- Side panel UI rendering (`TASK-007` / `TASK-008`) is not yet implemented, so captured clips are verified via storage/tests until M3 (or DevTools storage inspection in `TASK-006`).

## Integration steps / next action
- Push updated `TASK-004` commit on `feat/task-004-capture-repository` (PR #7), verify CI passes, and submit for Astra/Argon re-review and Appa merge approval.
- Interactive capture/PDF QA runs in `TASK-006` once both `TASK-004` (PR #7) and `TASK-005` (PR #9) are merged into `main`.
