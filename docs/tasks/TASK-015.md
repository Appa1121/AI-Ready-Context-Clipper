# TASK-015: Documentation and approved v0.1.0 release

## Dispatch metadata
- Milestone: M5
- Owner: Argon + Antigravity
- Reviewer: Appa
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-014 accepted
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
README.md; SECURITY.md; docs/TESTING.md; docs/reports/TASK-015-report.md; PLAN.md via coordination; release notes/tag through Antigravity

## Work
Document actual shipped behavior and limitations, installation and privacy. Verify package src only and release evidence. Open final PR and obtain Appa approval. Antigravity merges then creates v0.1.0 tag on verified commit; update DONE after merge.

## Acceptance criteria
No claims beyond shipped behavior; source/tag matches evidence; Appa approval and CI referenced; PLAN records actual merge SHA; no Web Store submission performed.

## Verification
node scripts/check.mjs; node --test; verify candidate acceptance and package contents

## Boundaries / readiness blockers
Do not tag/merge without Appa approval. Web Store, OCR, cloud sync, backup and AI API integration are out of scope.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

