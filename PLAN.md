# Project board — M1 merged & M2 dispatch (`main`: `0f5e7f3`)

Repository: https://github.com/Appa1121/AI-Ready-Context-Clipper

## Current checkpoint — 2026-11-18 (Asia/Bangkok)
- **M1 merged into `main`**: [PR #4](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/4) squash-merged at `0f5e7f38dba6e7399f638a5b130d63425b9aa263` (`feat: establish M1 foundation scaffold, contract v1, and task workflow (#4)`) after verifying PR HEAD `6b64711dff93cd51563989fb7d0efe381f8d3b02`, GitHub Actions CI `success`, and Appa's manual Chrome toolbar acceptance (`open`, `close`, `reopen`, `tab switch`).
- `main` CI run [44342377826](https://github.com/Appa1121/AI-Ready-Context-Clipper/actions/runs/44342377826) passed on `0f5e7f38dba6e7399f638a5b130d63425b9aa263`.
- M1 Issues [#1](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/1), [#2](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/2), and [#3](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/3) closed with merged SHA `0f5e7f38dba6e7399f638a5b130d63425b9aa263`.
- **M2 parallel dispatch (disjoint allowed files, Contract v1 pinned at `0f5e7f38dba6e7399f638a5b130d63425b9aa263`)**:
  - `TASK-004` (Hydrogen): Issue [#5](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/5), [PR #7](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/7) on `feat/task-004-capture-repository` (`3525975`) → `IN_REVIEW`.
  - `TASK-005` (Sol): Issue [#6](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/6), pinned to `0f5e7f38dba6e7399f638a5b130d63425b9aa263` → `READY`.
- M3 tasks (`TASK-007`, `TASK-008`) remain `BACKLOG` until M2 merges and Argon publishes concrete renderer/controller interfaces and DOM hooks.

Statuses: BACKLOG → READY → IN_PROGRESS → IN_REVIEW → VERIFIED → DONE; BLOCKED records missing input and its owner. IN_REVIEW requires a PR; VERIFIED requires all task checks; DONE requires merge.

| ID | Title | Owner | Reviewer | Status | Dependencies | Allowed files | Source SHA | Spec SHA | Issue | PR | Evidence | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TASK-001 | Remote/bootstrap | Argon + Antigravity | Appa | DONE | None | See task | `5e0945f` | `86cfaab` | [#1](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/1) | [#4](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/4) | Merged `0f5e7f3`; `docs/reports/TASK-001-report.md` | Complete |
| TASK-002 | Contracts/workflow | Astra; Antigravity publication | Argon + Appa | DONE | 001 | See task | `5e0945f` | `86cfaab` | [#2](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/2) | [#4](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/4) | Merged `0f5e7f3`; `docs/reports/TASK-002-report.md` | Complete |
| TASK-003 | M1 scaffold | Hydrogen; Argon + Appa | Argon + Appa | DONE | 002 | See task | `5e0945f` | `86cfaab` | [#3](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/3) | [#4](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/4) | Merged `0f5e7f3`; CI + Chrome 157 + Appa toolbar PASS | Complete |
| TASK-004 | Capture/repository | Hydrogen | Argon + Astra | IN_REVIEW | M1 merged (`0f5e7f3`) | See task | `0f5e7f3` | `0f5e7f3` | [#5](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/5) | [#7](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/7) | `docs/reports/TASK-004-report.md`; 24/24 Node tests + Chrome 157 smoke | Argon + Astra review PR #7; QA in TASK-006 |
| TASK-005 | Markdown formatter | Sol | Argon | READY | M1 merged (`0f5e7f3`) | See task | `0f5e7f3` | `0f5e7f3` | [#6](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/6) | — | — | Sol returns patch/files + report to Appa |
| TASK-006 | Capture/PDF QA | Appa + Argon | Astra | BACKLOG | 004,005 | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Test real Chrome HTML/PDF/restart after 004/005 |
| TASK-007 | UI client/controller | Hydrogen | Argon + Astra | BACKLOG | M2 merged; UI contract locked | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Pin task 007/008 shared contract |
| TASK-008 | UI rendering | Sol | Argon | BACKLOG | M2 merged; UI contract locked | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Dispatch disjoint UI files |
| TASK-009 | UI integration QA | Argon + Hydrogen | Appa | BACKLOG | 007,008 | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Test concurrent windows |
| TASK-010 | Prompt workflow | Hydrogen | Argon | BACKLOG | M3 merged | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Implement settings/export |
| TASK-011 | Cross-file review | Sol | Argon | BACKLOG | 010 candidate | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Read-only pinned review |
| TASK-012 | Architecture review | Astra + Argon | Appa | BACKLOG | 010,011 | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Review boundary evidence |
| TASK-013 | Defect fixes | Hydrogen / Sol disjoint tasks | Argon | BACKLOG | M4 findings triaged | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Assign explicit defect scopes |
| TASK-014 | Browser acceptance | Appa + Argon | Appa | BACKLOG | 013 | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Test exact candidate commit |
| TASK-015 | Release candidate | Argon + Antigravity | Appa | BACKLOG | 014 | See task | UNASSIGNED | `0f5e7f3` | — | — | — | Approved merge then v0.1.0 tag |

## Gates
M1: Contract accepted, scaffold loads, action opens panel, no runtime errors, validators pass, foundation merged. (Satisfied at `0f5e7f3`.)
M2: closed-panel capture, concurrent writes, restart persistence, real selectable PDF tests, formatter tests.
M3: CRUD/copy, keyboard/overflow, two-window sync, conflict handling, safe DOM.
M4: persisted wrapper, Markdown export/fallback, fixed AI links, architecture review.
M5: CI and actual Chrome acceptance on release commit, no data-loss/security/core blockers, Appa approval. Web Store submission is separate.

## Next action
1. Relay pinned `TASK-005` dispatch prompt (`0f5e7f38dba6e7399f638a5b130d63425b9aa263`, Issue [#6](https://github.com/Appa1121/AI-Ready-Context-Clipper/issues/6)) to GPT-6.1 Sol.
2. Review [PR #7](https://github.com/Appa1121/AI-Ready-Context-Clipper/pull/7) (`TASK-004`) with Argon + Astra and complete M2 Chrome/PDF acceptance (`TASK-006`) after `TASK-004` and `TASK-005` integration.
3. Appa approves this coordination PR to publish updated `PLAN.md` onto `main`.
