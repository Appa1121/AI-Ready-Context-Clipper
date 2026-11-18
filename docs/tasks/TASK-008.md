# TASK-008: Safe panel rendering and responsive layout

## Dispatch metadata
- Milestone: M3
- Owner: GPT-6.1 Sol
- Reviewer: Argon
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: M2 merged; renderer/controller interface and DOM hooks approved and merged into TASK-007/008
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
src/sidepanel/sidepanel.html; src/sidepanel/sidepanel.css; src/sidepanel/render.js

## Work
Implement agreed renderer/controller contract: loading/empty/ready/error, newest-first list, preview/full detail, metadata, copy/delete/clear controls, disabled pending state, confirmation/fallback surfaces as agreed. Safe text DOM, HTTP(S)-only source links, keyboard access and narrow-panel overflow handling.

## Acceptance criteria
HTML/script-like snippets inert; URL scheme filtering; long text wraps; keyboard and focus visible; aria-live announces status without exposing unnecessary content; no storage/Chrome API or controller ownership overlap.

## Verification
node scripts/check.mjs; node --test; provide UI verification checklist; real acceptance by TASK-009

## Boundaries / readiness blockers
BLOCKED from READY until UI exports/callbacks/DOM hooks are concretely specified and merged. Do not invent interface or edit client/controller/clipboard/PLAN. Return implementation report outside allowed files.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

