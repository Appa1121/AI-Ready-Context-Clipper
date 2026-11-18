# TASK-002: Contract v1 and team workflow

## Dispatch metadata
- Milestone: M1
- Owner: Astra (design), Antigravity (publication)
- Reviewer: Argon + Appa
- Source base SHA: 5e0945f55e54bc6c38c2f581121f0f99380a03d2
- Task spec SHA: Recorded in docs/reports/TASK-002-report.md and PLAN.md after spec commit.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-001
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
AGENTS.md; docs/CONTRACTS.md; docs/WORKFLOW.md; docs/adr/ADR-001-local-first-single-writer.md; SECURITY.md; docs/tasks/*.md; docs/reports/TASK-002-report.md

## Work
Review storage/message schemas and public signatures, queue semantics, sender validation, safe DOM/Markdown, immutable revision rules, error mapping, and public-repo hygiene. Publish task scopes and clarify readiness gates. Preserve role ownership and commit-pinned handoffs.

## Acceptance criteria
Astra architecture review recorded; Argon checks disjoint scopes; Appa accepts material scope; no inferred approvals or fabricated SHAs; Contract and ADR published through foundation PR.

## Verification
Document/interface consistency review; node scripts/check.mjs; node --test

## Boundaries / readiness blockers
No implementation beyond the M1 shared contract/default helpers assigned to TASK-003; later runtime modules remain gated.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

