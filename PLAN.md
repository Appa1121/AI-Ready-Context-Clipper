# Project board — draft for Antigravity publication

Repository: https://github.com/Appa1121/AI-Ready-Context-Clipper

## Current checkpoint — 2026-11-17 (Asia/Bangkok)
- Local bootstrap candidate only; no Git checkout in this workspace at preparation time.
- Remote contents could not be fetched. Source SHA, spec SHA, HEAD, branch, Issue and PR: **UNASSIGNED**.
- Contract v1 and M1 scaffold are prepared for review, not merged or released.
- Antigravity owns reconciliation/publication; Appa owns browser acceptance and merge approval.
- No M2+ task is READY. No independent work is dispatched by this document.

Statuses: BACKLOG → READY → IN_PROGRESS → IN_REVIEW → VERIFIED → DONE; BLOCKED records missing input and its owner. IN_REVIEW requires a PR; VERIFIED requires all task checks; DONE requires merge. This local handoff is not a PR.

| ID | Title | Owner | Reviewer | Status | Dependencies | Allowed files | Source SHA | Issue | PR | Evidence | Next action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TASK-001 | Remote/bootstrap | Argon + Antigravity | Appa | BLOCKED | None | See task | UNASSIGNED | — | — | Local inspection; no checkout | Antigravity inspect remote/create branch |
| TASK-002 | Contracts/workflow | Astra; Antigravity publication | Argon + Appa | BLOCKED | 001 | See task | UNASSIGNED | — | — | Draft documents present | Review/reconcile and publish |
| TASK-003 | M1 scaffold | Hydrogen; local candidate prepared by Codex | Argon | BLOCKED | 002 | See task | UNASSIGNED | — | — | See bootstrap report | Run browser checks; M1 PR |
| TASK-004 | Capture/repository | Hydrogen | Argon + Astra | BACKLOG | M1 merged | See task | UNASSIGNED | — | — | — | Pin merged M1 SHA |
| TASK-005 | Markdown formatter | Sol | Argon | BACKLOG | M1 merged | See task | UNASSIGNED | — | — | — | Send pinned handoff |
| TASK-006 | Capture/PDF QA | Appa + Argon | Astra | BACKLOG | 004,005 | See task | UNASSIGNED | — | — | — | Test actual Chrome |
| TASK-007 | UI client/controller | Hydrogen | Argon + Astra | BACKLOG | M2 merged; UI contract locked | See task | UNASSIGNED | — | — | — | Pin task 007/008 shared contract |
| TASK-008 | UI rendering | Sol | Argon | BACKLOG | M2 merged; UI contract locked | See task | UNASSIGNED | — | — | — | Dispatch disjoint UI files |
| TASK-009 | UI integration QA | Argon + Hydrogen | Appa | BACKLOG | 007,008 | See task | UNASSIGNED | — | — | — | Test concurrent windows |
| TASK-010 | Prompt workflow | Hydrogen | Argon | BACKLOG | M3 merged | See task | UNASSIGNED | — | — | — | Implement settings/export |
| TASK-011 | Cross-file review | Sol | Argon | BACKLOG | 010 candidate | See task | UNASSIGNED | — | — | — | Read-only pinned review |
| TASK-012 | Architecture review | Astra + Argon | Appa | BACKLOG | 010,011 | See task | UNASSIGNED | — | — | — | Review boundary evidence |
| TASK-013 | Defect fixes | Hydrogen / Sol disjoint tasks | Argon | BACKLOG | M4 findings triaged | See task | UNASSIGNED | — | — | — | Assign explicit defect scopes |
| TASK-014 | Browser acceptance | Appa + Argon | Appa | BACKLOG | 013 | See task | UNASSIGNED | — | — | — | Test exact candidate commit |
| TASK-015 | Release candidate | Argon + Antigravity | Appa | BACKLOG | 014 | See task | UNASSIGNED | — | — | — | Approved merge then v0.1.0 tag |

## Gates
M1: Contract accepted, scaffold loads, action opens panel, no runtime errors, validators pass, foundation merged.
M2: closed-panel capture, concurrent writes, restart persistence, real selectable PDF tests, formatter tests.
M3: CRUD/copy, keyboard/overflow, two-window sync, conflict handling, safe DOM.
M4: persisted wrapper, Markdown export/fallback, fixed AI links, architecture review.
M5: CI and actual Chrome acceptance on release commit, no data-loss/security/core blockers, Appa approval. Web Store submission is separate.

## Next action
Antigravity reads `docs/reports/BOOTSTRAP-report.md`, verifies the remote, creates `chore/m1-foundation`, reconciles changes, records real SHAs and opens the foundation PR. Do not invent a Git history or mark work merged to unblock later milestones.
