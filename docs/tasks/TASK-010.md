# TASK-010: Prompt editor, export and AI shortcuts

## Dispatch metadata
- Milestone: M4
- Owner: Hydrogen
- Reviewer: Argon
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: M3 merged; TASK-005 formatter integrated
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
src/sidepanel/sidepanel.html; src/sidepanel/sidepanel.css; src/sidepanel/sidepanel.js; src/sidepanel/render.js; src/sidepanel/clipboard.js; docs/reports/TASK-010-report.md

## Work
Add two textarea fields for prefix/suffix with explicit Save. Preserve dirty edits during unrelated captures, show conflicts instead of overwriting remote settings. Export from currently rendered valid snapshot, call clipboard within click, offer fallback. Open only fixed ChatGPT/Gemini URLs.

## Acceptance criteria
Wrapper persists after reopening/restart; empty strings valid; dirty edits not erased; concurrent settings edit gives conflict; empty clips disable export; no auto-paste/send/query prompt; formatter source unchanged.

## Verification
node scripts/check.mjs; node --test; docs/TESTING.md M4 cases

## Boundaries / readiness blockers
No template language, remote APIs or permission changes. Coordinate interface extensions via Argon/Astra before implementation if existing UI contract is insufficient.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

