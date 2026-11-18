# TASK-004: Context capture and single-writer repository

## Dispatch metadata
- Milestone: M2
- Owner: Hydrogen
- Reviewer: Argon + Astra
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: M1 merged
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
src/background.js; src/background/capture.js; src/background/repository.js; tests/capture.test.js; tests/repository.test.js; tests/background.test.js; docs/reports/TASK-004-report.md

## Work
Add idempotent selection menu and authenticated command routing. Implement pure capture and queued initialization/add/delete/clear/settings. Read state inside queue, preserve corrupt/unknown data, enforce expectedRevision, await storage writes, continue queue after failure. Badge failures and clear on successful capture.

## Acceptance criteria
Closed-panel save; text/metadata preserved; duplicates get unique IDs; concurrent adds retained; stale clear/delete/settings rejected; storage failure leaves prior data intact; worker restart reads persisted state; no UI writer.

## Verification
node scripts/check.mjs; node --test; add mock storage race/rejection/unknown-schema cases; real capture checked by TASK-006

## Boundaries / readiness blockers
Do not alter shared contracts or formatter. Surface required changes as proposal. Queue is not crash-durable.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

