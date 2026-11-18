# Project board — M1 foundation candidate (`chore/m1-foundation`)

Repository: https://github.com/Appa1121/AI-Ready-Context-Clipper

## Current checkpoint — 2026-11-18 (Asia/Bangkok)
- Local Git repository initialized on `main` with Appa-authorized zero-file root commit `5e0945f55e54bc6c38c2f581121f0f99380a03d2` (`chore: initialize repository root`, 0 files).
- Branch `chore/m1-foundation` created from `5e0945f55e54bc6c38c2f581121f0f99380a03d2`.
- M1 scaffold, Contract v1, and 15 task specs committed in `86cfaaba8b3c6d86e3d8875a93161647c53ca20a` (39 bootstrap files); M1 task reports added (42 tracked files total).
- Automated checks (`node scripts/check.mjs`, `node --test`) and real Chrome `157.0.8103.80` verification passed on `86cfaaba8b3c6d86e3d8875a93161647c53ca20a`; manual top-chrome toolbar click and GitHub Actions CI await remote push/PR.
- No M2+ task is READY until M1 merges into `main` with Appa's approval.

Statuses: BACKLOG → READY → IN_PROGRESS → IN_REVIEW → VERIFIED → DONE; BLOCKED records missing input and its owner. IN_REVIEW requires a PR; VERIFIED requires all task checks; DONE requires merge.

| ID | Title | Owner | Reviewer | Status | Dependencies | Allowed files | Source SHA | Spec SHA | Issue | PR | Evidence | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TASK-001 | Remote/bootstrap | Argon + Antigravity | Appa | IN_PROGRESS | None | See task | `5e0945f` | `86cfaab` | Pending push | Pending push | `docs/reports/TASK-001-report.md` | Authenticate `Appa1121` push & open Draft PR |
| TASK-002 | Contracts/workflow | Astra; Antigravity publication | Argon + Appa | IN_PROGRESS | 001 | See task | `5e0945f` | `86cfaab` | Pending push | Pending push | `docs/reports/TASK-002-report.md` | Publish in M1 Draft PR for Appa review |
| TASK-003 | M1 scaffold | Hydrogen; local candidate verified by Argon | Argon + Appa | IN_PROGRESS | 002 | See task | `5e0945f` | `86cfaab` | Pending push | Pending push | `docs/reports/TASK-003-report.md` | Push `chore/m1-foundation`, run CI, Appa toolbar check |
| TASK-004 | Capture/repository | Hydrogen | Argon + Astra | BACKLOG | M1 merged | See task | UNASSIGNED | `86cfaab` | — | — | — | Pin merged M1 SHA |
| TASK-005 | Markdown formatter | Sol | Argon | BACKLOG | M1 merged | See task | UNASSIGNED | `86cfaab` | — | — | — | Send pinned handoff |
| TASK-006 | Capture/PDF QA | Appa + Argon | Astra | BACKLOG | 004,005 | See task | UNASSIGNED | `86cfaab` | — | — | — | Test actual Chrome |
| TASK-007 | UI client/controller | Hydrogen | Argon + Astra | BACKLOG | M2 merged; UI contract locked | See task | UNASSIGNED | `86cfaab` | — | — | — | Pin task 007/008 shared contract |
| TASK-008 | UI rendering | Sol | Argon | BACKLOG | M2 merged; UI contract locked | See task | UNASSIGNED | `86cfaab` | — | — | — | Dispatch disjoint UI files |
| TASK-009 | UI integration QA | Argon + Hydrogen | Appa | BACKLOG | 007,008 | See task | UNASSIGNED | `86cfaab` | — | — | — | Test concurrent windows |
| TASK-010 | Prompt workflow | Hydrogen | Argon | BACKLOG | M3 merged | See task | UNASSIGNED | `86cfaab` | — | — | — | Implement settings/export |
| TASK-011 | Cross-file review | Sol | Argon | BACKLOG | 010 candidate | See task | UNASSIGNED | `86cfaab` | — | — | — | Read-only pinned review |
| TASK-012 | Architecture review | Astra + Argon | Appa | BACKLOG | 010,011 | See task | UNASSIGNED | `86cfaab` | — | — | — | Review boundary evidence |
| TASK-013 | Defect fixes | Hydrogen / Sol disjoint tasks | Argon | BACKLOG | M4 findings triaged | See task | UNASSIGNED | `86cfaab` | — | — | — | Assign explicit defect scopes |
| TASK-014 | Browser acceptance | Appa + Argon | Appa | BACKLOG | 013 | See task | UNASSIGNED | `86cfaab` | — | — | — | Test exact candidate commit |
| TASK-015 | Release candidate | Argon + Antigravity | Appa | BACKLOG | 014 | See task | UNASSIGNED | `86cfaab` | — | — | — | Approved merge then v0.1.0 tag |

## Gates
M1: Contract accepted, scaffold loads, action opens panel, no runtime errors, validators pass, foundation merged.
M2: closed-panel capture, concurrent writes, restart persistence, real selectable PDF tests, formatter tests.
M3: CRUD/copy, keyboard/overflow, two-window sync, conflict handling, safe DOM.
M4: persisted wrapper, Markdown export/fallback, fixed AI links, architecture review.
M5: CI and actual Chrome acceptance on release commit, no data-loss/security/core blockers, Appa approval. Web Store submission is separate.

## Next action
Push `main` (`5e0945f55e54bc6c38c2f581121f0f99380a03d2`) and `chore/m1-foundation` to `origin` under `Appa1121`, open the M1 Draft PR and Issues, update `PLAN.md` to `IN_REVIEW` with actual PR/Issue URLs, and await Appa's manual toolbar check and PR approval.
