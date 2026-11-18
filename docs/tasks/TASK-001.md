# TASK-001: Remote and bootstrap reconciliation

## Dispatch metadata
- Milestone: M1
- Owner: Argon + Antigravity
- Reviewer: Appa
- Source base SHA: 5e0945f55e54bc6c38c2f581121f0f99380a03d2
- Task spec SHA: Recorded in docs/reports/TASK-001-report.md and PLAN.md after spec commit.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: None
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
Repository Git metadata through Antigravity; PLAN.md; docs/tasks/TASK-001.md; docs/reports/TASK-001-report.md

## Work
Inspect remote/default branch/history and local uncommitted files. Preserve Appa's work. Reconcile the local handoff onto chore/m1-foundation. Create milestone/task Issues and link the actual specs; record source SHA and later resolved spec SHA. Do not overwrite an existing repository or synthesize history if remote is inaccessible.

## Acceptance criteria
Remote/default branch verified; branch based on known commit; real source SHA/Issue links recorded; no secrets or unrelated changes; Foundation publication can proceed.

## Verification
Read-only Git inspection; node scripts/check.mjs; node --test after reconciliation

## Boundaries / readiness blockers
Remote inaccessible or identity/ownership uncertain: report blocker. Only Antigravity performs Git operations.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

