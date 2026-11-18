# TASK-014: Release candidate browser acceptance

## Dispatch metadata
- Milestone: M5
- Owner: Appa + Argon
- Reviewer: Appa
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-013 required fixes integrated
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
docs/reports/TASK-014-report.md; docs/TESTING.md

## Work
Run full applicable Chrome matrix on exact candidate revision. Record OS/version/time, synthetic fixtures, actual results and limitations. Inspect src package for private/development files. Check CI on same commit.

## Acceptance criteria
All core cases pass; no unresolved data-loss/security/core blocker; CI actually passed on tested commit; Appa records acceptance; tests NOT RUN prevent release readiness where required.

## Verification
node scripts/check.mjs; node --test; docs/TESTING.md full matrix

## Boundaries / readiness blockers
No tests against real stored personal clips. Node tests cannot substitute for Chrome/PDF/clipboard/lifecycle checks.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

