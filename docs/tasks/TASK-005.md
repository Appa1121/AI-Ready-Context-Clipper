# TASK-005: Pure Markdown formatter

## Dispatch metadata
- Milestone: M2
- Owner: GPT-6.1 Sol
- Reviewer: Argon
- Source base SHA: UNASSIGNED — Antigravity resolves before dispatch.
- Task spec SHA: UNASSIGNED — record the committed spec SHA in the dispatch/Issue.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: M1 merged
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
src/export/markdown.js; tests/markdown.test.js

## Work
Export buildMarkdownPrompt(clips, settings): string. Valid Contract-v1 inputs; pure and input-preserving. Empty clips return empty string. Prefix then numbered sources (title, URL or unavailable label, timestamp, fenced original text) then suffix. Escape metadata including HTML-significant characters/line breaks. Fence length > longest backtick run, minimum three.

## Acceptance criteria
Stable insertion order; empty prefix/suffix supported; Thai/emoji/newlines/backticks handled; HTML/Markdown metadata cannot break the wrapper structure; frozen inputs remain unchanged; no DOM/Chrome/network dependency.

## Verification
node scripts/check.mjs; node --test tests/markdown.test.js; node --test

## Boundaries / readiness blockers
Do not edit PLAN, manifest, defaults, contracts, UI or package files. Return patch/files + report in message; Antigravity publishes report. Exact source/spec SHAs required before dispatch.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

