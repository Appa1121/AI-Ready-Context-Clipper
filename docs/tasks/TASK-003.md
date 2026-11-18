# TASK-003: M1 scaffold and checks

## Dispatch metadata
- Milestone: M1
- Owner: Hydrogen (assigned); Codex local candidate for integration
- Reviewer: Argon
- Source base SHA: 5e0945f55e54bc6c38c2f581121f0f99380a03d2
- Task spec SHA: Recorded in docs/reports/TASK-003-report.md and PLAN.md after spec commit.
- Contract: v1 (must be merged before dependent implementation).
- Status: See PLAN.md; this document alone does not grant READY status.
- Dependencies: TASK-002
- Required inputs: AGENTS.md, PLAN.md, docs/CONTRACTS.md, docs/WORKFLOW.md, this spec, allowed existing source/tests and relevant dependency reports.
- Pinned URL format: https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>
- Remote unavailable: use an exact snapshot of the same resolved source/spec revisions through Appa.

## Allowed scope
src/manifest.json; src/background.js; src/shared/contracts.js; src/shared/defaults.js; src/sidepanel/sidepanel.html; src/sidepanel/sidepanel.css; src/sidepanel/sidepanel.js; package.json; .gitignore; scripts/check.mjs; tests/contracts.test.js; tests/background.test.js; .github/workflows/ci.yml; .github/pull_request_template.md; README.md; docs/TESTING.md; docs/reports/TASK-003-report.md

## Work
Implement only a loadable foundation: module worker configures action opening global panel, top-level event registration, honest preview/empty state with disabled controls, external JS/CSS, four permissions. Shared validators/defaults follow Contract. Set dependency-free Node checks and CI.

## Acceptance criteria
Load src/ successfully; toolbar opens/closes/reopens panel; no runtime errors/missing assets; validators reject bad messages/data; defaults independent; no capture/storage/clipboard implementation; Foundation merge gate remains explicit.

## Verification
node scripts/check.mjs; node --test; docs/TESTING.md M1 browser acceptance

## Boundaries / readiness blockers
No context menu creation, repository, formatter, CRUD, export, network or fake successful state. Browser results must be actual.

## Expected handoff
Task ID, source/spec SHAs, Contract version, files actually read, changed files, implementation summary, patch/full files, exact commands/results, NOT RUN checks, limitations and integration steps. Sol returns the report through Appa; Antigravity publishes it and performs Git operations. No automatic retry, publication, PR or merge by other agents.

