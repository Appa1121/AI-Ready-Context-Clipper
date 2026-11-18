# TASK-011: Cross-file read-only implementation review

## Dispatch metadata
- Milestone: M4
- Owner: GPT-6.1 Sol
- Reviewer: Argon
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-010 candidate pinned
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
No source edits; report returned to Antigravity for docs/reports/TASK-011-report.md

## Work
Read exact snapshot and compare manifest, worker, repository, shared types, client, UI and formatter. Identify concrete correctness, privacy, XSS and integration defects, not generic style preferences.

## Acceptance criteria
Findings list severity, revision, file/line, trigger, impact, minimal fix and reproduction/test. Distinguish tested failures from inference and unread inputs. No source modifications.

## Verification
node scripts/check.mjs; node --test if executable snapshot available; otherwise explicitly NOT RUN

## Boundaries / readiness blockers
Do not claim full review if files inaccessible. Public snapshot or pinned repo files required.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

