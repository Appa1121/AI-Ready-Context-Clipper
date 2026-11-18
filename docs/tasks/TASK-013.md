# TASK-013: Bounded defect remediation

## Dispatch metadata
- Milestone: M5
- Owner: Hydrogen / Sol in disjoint child tasks
- Reviewer: Argon; Astra for boundary changes
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-011/012 findings triaged
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
To be enumerated per defect in a merged child spec before READY; no blanket source access

## Work
Argon creates per-defect task specs with reproduction, affected files, owner, tests and source SHA. At most one active Hydrogen and one active Sol task; no overlapping files. Fix root causes and add regression tests where meaningful.

## Acceptance criteria
Assigned defect reproduced then fixed; appropriate regression tests pass; no Contract drift or unrelated changes; updated candidate SHA and evidence supplied.

## Verification
node scripts/check.mjs; node --test; targeted reproduction and required Chrome recheck

## Boundaries / readiness blockers
Parent is not dispatchable until concrete defects/scopes exist. No speculative fixes or unbounded refactoring.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

