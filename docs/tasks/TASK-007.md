# TASK-007: Panel client, controller and clipboard

## Dispatch metadata
- Milestone: M3
- Owner: Hydrogen
- Reviewer: Argon + Astra
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: M2 merged; renderer/controller interface and DOM hooks approved and merged into TASK-007/008
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
src/sidepanel/client.js; src/sidepanel/sidepanel.js; src/sidepanel/clipboard.js; tests/client.test.js; docs/reports/TASK-007-report.md

## Work
Implement snapshot subscription before initial get, revision filtering, unsubscribe and late-read suppression. Send exact protocol envelope once, validate response correlation and refresh after transport uncertainty. Controller handles load/empty/ready/error, pending buttons, delete/clear confirmation, detail/copy callbacks. Clipboard called within user activation with textarea fallback.

## Acceptance criteria
Two panels consistent; stale initial read ignored; invalid snapshots disable actions; unsubscribe suppresses pending callbacks; no mutation retry; clear cancel is inert; focused copy/fallback usable; no direct writes to storage.

## Verification
node scripts/check.mjs; node --test; client ordering/cleanup/error tests; real UI checks in TASK-009

## Boundaries / readiness blockers
READY is forbidden until Argon publishes concrete renderer exports, callback signatures and DOM hooks with TASK-008. No parallel changes to HTML/CSS/render.js.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

