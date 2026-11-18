# TASK-006: Capture and PDF integration acceptance

## Dispatch metadata
- Milestone: M2
- Owner: Appa + Argon
- Reviewer: Astra
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-004 and TASK-005 integrated
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
docs/reports/TASK-006-report.md; docs/TESTING.md

## Work
Test real selectable HTTPS HTML/PDF, file PDF, iframe metadata, leading whitespace, Unicode, rapid captures and duplicate text. Record file-access settings, Chrome/OS and candidate SHA. Close worker DevTools before lifecycle tests. Check storage failure with isolated synthetic fixture, not real clips.

## Acceptance criteria
Closed-panel saves visible after reopening; restart persistence; real PDF selection captured with document URL or documented limitation; no data loss during rapid saves; formatter checks passed after integration.

## Verification
node scripts/check.mjs; node --test; docs/TESTING.md M2 cases

## Boundaries / readiness blockers
Read-only QA of source. Report defects to owning branch; do not edit worker/repository while implementation is active.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

