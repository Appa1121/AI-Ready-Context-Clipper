# TASK-009: Panel integration and multi-window acceptance

## Dispatch metadata
- Milestone: M3
- Owner: Argon + Hydrogen
- Reviewer: Appa
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-007 and TASK-008 integrated
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
docs/reports/TASK-009-report.md; docs/TESTING.md

## Work
Verify renderer/client wiring on same candidate SHA. Exercise loading/errors, detail, copy/fallback, delete/clear confirmation, keyboard, zoom and two windows. Force add-vs-clear/delete conflict with synthetic data.

## Acceptance criteria
No lost update or automatic destructive retry; no HTML execution/unsafe navigation; source details intact; no stale read overriding state; clear preserves settings; real clipboard behavior documented.

## Verification
node scripts/check.mjs; node --test; docs/TESTING.md M3 checklist

## Boundaries / readiness blockers
QA report scope only. Integration fixes get a separately assigned allowed-file scope before changing source.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

