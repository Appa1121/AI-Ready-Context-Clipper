# TASK-012: Architecture and security boundary review

## Dispatch metadata
- Milestone: M4
- Owner: GPT Astra + Gemini Argon
- Reviewer: Appa
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-010 candidate and TASK-011 report
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
No source edits; report published to docs/reports/TASK-012-report.md

## Work
Review single writer, lifecycle, sender/protocol validation, revision races, unknown-schema preservation, source metadata, safe render/export, permissions and no hidden network behavior. Reconcile Sol findings; triage severity and ownership.

## Acceptance criteria
Return APPROVE / CHANGES_REQUIRED / NEEDS_INFORMATION with revision and specific evidence. Block release on data loss/security/core defects. Record unresolved product tradeoffs for Appa.

## Verification
Review pinned diff/full required inputs; node checks if available; browser evidence is separate

## Boundaries / readiness blockers
Do not approve runtime implementation from Contract text alone. No silent contract amendment.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

