# Public repository collaboration protocol

## Authority
Merged CONTRACTS defines behavior; merged task specs define scope; PLAN defines status. Issues hold discussion and blockers; PRs hold diff/review/CI evidence; ADRs preserve decisions. Chat does not silently change a Contract. Public accessibility does not grant write access or guarantee network access.

Argon schedules and reviews delivery, Astra reviews architectural boundaries, Hydrogen and Sol implement. Appa resolves scope/tradeoffs and approves merge. Antigravity alone performs Git/GitHub operations and publishes status. Appa relays between disconnected tools; no automatic cross-model messaging is assumed.

## Bootstrap
Inspect the real remote, default branch, history and uncommitted work. Clone only through Antigravity if necessary. Never substitute an invented Git history for an inaccessible remote. Create `chore/m1-foundation` and reconcile the handoff rather than overwrite existing files. Validate, open PR, wait for Appa approval, merge, then record M1 completion.

## Dispatch
1. Argon merges task/Contract updates through a coordination PR (one coordination branch per milestone).
2. Assign at most one Hydrogen and one Sol implementation; allowed files must be disjoint.
3. Record source base SHA and task-spec SHA (they may differ). Include Contract version and all inputs.
4. Use `https://github.com/Appa1121/AI-Ready-Context-Clipper/blob/<SHA>/<path>` links. Never use only “latest main”.
5. If reading fails, Antigravity provides the exact revision snapshot through Appa. Include only required source, tests, configuration and docs; exclude .git and private data.
6. Developer acknowledges Task ID, files read, SHA and scope before implementation.

Task documents cannot contain their own future commit SHA. Record the resolved spec SHA in the dispatch message/Issue after committing the spec; do not edit the spec repeatedly to chase its own hash.

## Integration
Sol returns a unified diff against the source base, or full changed files with relative paths, plus a report. Antigravity checks scope, validates the base, inspects intervening changes and applies on `feat/task-005-markdown` (or the corresponding task branch). Never blindly replace changed target files. If conflicts change semantics, ask the task owner to rebase the implementation against a fresh snapshot. Rerun repository checks after integration.

Hydrogen uses the assigned local branch/worktree via Antigravity. Keep PR review checkouts separate from active local work. No shared-file edits while the owner is implementing them. QA can report a finding to the owner instead of making a competing edit.

## Review and merge
- Conventional Commits: feat/fix/refactor/docs/chore.
- Argon reviews every PR: scope, dependencies, tests, evidence and limitations.
- Astra additionally reviews Contract/persistence/message/security-boundary changes.
- CI required; real browser evidence required where behavior depends on Chrome.
- Appa approves. Antigravity squash-merges with a conventional title.
- Do not force-push shared branches, push directly to main or auto-merge.
- Mark DONE only in a subsequent coordination update after merge; include merge SHA and next READY tasks.
- Configure branch protection via Antigravity if available; never claim it is configured without evidence.

## Status/reporting
READY requires merged dependencies, a complete spec and pinned bases. IN_REVIEW requires a PR. VERIFIED requires all defined checks. BLOCKED records the missing input, responsible person and next action. Routine conversations belong in Issues, not a new PLAN commit for every message.

Each round ends with: current SHA/branch; completed work/evidence; active owners; blockers; Appa decisions; next READY task and pinned links. Appa's daily rhythm: 10-minute review, 30–60-minute targeted browser acceptance, 10-minute handoff.

## Task dispatch template
```text
Task ID / title:
Owner / reviewer:
Source base SHA / spec SHA:
Contract version:
Pinned input URLs (or exact snapshot):
Allowed files / forbidden changes:
Merged dependencies:
Acceptance criteria / test commands:
Expected output: patch or changed files + report
```

## Implementation report template
```text
Task ID / source base SHA / Contract version:
Files actually read / inaccessible inputs:
Changed files:
Behavior and reasoning:
Commands and actual results:
Browser checks NOT RUN:
Limitations / blockers:
Integration steps / next action:
```

## Argon start prompt
Read AGENTS, PLAN, CONTRACTS, WORKFLOW and TASK-001..003. Inspect the actual remote/workspace first. Reconcile this bootstrap on chore/m1-foundation; preserve Appa's work. Publish tasks/Issues and the foundation PR through Antigravity. Do not start M2 until M1 merges. Prepare TASK-005 with resolved source/spec SHAs; never instruct Sol to push or open a PR. Report evidence and blockers without fabricating browser checks or Git metadata.

## Astra review prompt
Review only the supplied revision, Contract, ADR, task spec and diff. Check responsibilities, public interfaces, single writer, lifecycle, validation, data preservation, permissions, XSS and disjoint task ownership. Return APPROVE / CHANGES_REQUIRED / NEEDS_INFORMATION. Findings include file/section, issue, impact, minimum correction and verification. State unread inputs. Do not approve implementation from a spec-only review.

## Hydrogen/Sol implementation prompt
Read the pinned inputs and acknowledge scope. Implement only allowed files, with JSDoc/error handling and acceptance tests. Do not silently change schema/interfaces/permissions/dependencies. Return patch/files and the implementation report. Sol does not write GitHub or PLAN. Hydrogen uses its assigned local branch through Antigravity. Neither merges before Appa approval.
