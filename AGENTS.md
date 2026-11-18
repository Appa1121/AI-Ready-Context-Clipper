# Agent rules — AI-Ready Context Clipper

## Read and acknowledge before work
Read this file, `PLAN.md`, `docs/CONTRACTS.md`, `docs/WORKFLOW.md`, and the assigned task spec. State task ID, source base SHA, spec SHA, Contract version, allowed files, and files actually read. Never claim inaccessible files were reviewed.

## Team and authority
- Appa owns product scope, permission decisions, browser acceptance, and final merge approval.
- Gemini Argon owns delivery, scheduling, file ownership, integration review, and PLAN content.
- GPT Astra owns architecture, interfaces, persistence, message boundaries, and security review.
- Gemini Hydrogen implements local Chrome API and integration tasks through Antigravity.
- GPT-6.1 Sol implements bounded modules from a pinned revision or exact snapshot.
- Antigravity alone performs clone/branch/commit/push, Issue/PR writes, merge, tags, and PLAN publication.
- These are human-selected roles, not automatically connected agents. Appa relays across tools.

## Scope and implementation
1. Work only in task-allowed files. Contract, permission, dependency, or exported interface changes require a proposal before implementation.
2. Use Vanilla ES Modules, HTML and CSS. No bundler, framework, runtime dependency, backend, API key, telemetry, remote executable code, Content Script, or host permissions.
3. Permissions are exactly `sidePanel`, `contextMenus`, `storage`, `activeTab`.
4. JSDoc covers exported functions, important internal functions and event handlers, including input, output, async behavior and failure behavior.
5. Handle API rejections and callback `runtime.lastError`. No silent/empty catches. Use sanitized errors; never log clip text, prompts, private URLs or raw message payloads.
6. Never use `innerHTML`, `eval`, inline script/event handlers, or Markdown-to-HTML rendering for page data. Use `textContent` / `textarea.value`.
7. Only `src/background/repository.js` may write extension storage. All its mutations, including initialization, share one serial queue.
8. Use synthetic fixtures only. No browser profiles, credentials, .env contents, private clips or sensitive screenshots in the public repo.

## Coordination and Git
- At most two active implementation tasks: one Hydrogen and one Sol. No overlapping allowed files (including shared helpers/configs).
- Every actual repository change uses a feature branch, Conventional Commit (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`), and PR.
- No direct main writes, shared-branch force pushes, automatic merge, or release before Appa approval.
- Antigravity publishes PLAN. Sol returns patch/files + report; it does not edit PLAN or GitHub status.
- Pin source and spec SHAs. After a target file changes, revalidate against the new base; do not blindly overwrite it with returned files.
- Merged Contract governs behavior; merged task spec governs scope; PLAN governs status. Chat/Issue proposals do not silently amend them.
- When leads disagree, Argon records alternatives in one Issue and Appa decides.

## Verification and handoff
Run `node scripts/check.mjs` and `node --test` plus task-specific checks. Report exact results and NOT RUN checks. Mock tests cannot establish Chrome/PDF behavior. Browser evidence includes OS, Chrome version, revision, steps, actual outcome and limitations. Never mark DONE before merge.

## Bootstrap delivery boundary
This initial folder is a **local handoff candidate**, not a verified remote checkout. Its bootstrap documents and M1 files were prepared at Appa's explicit request. No SHA, Issue, PR, approval or merge is implied. Antigravity must reconcile these files against the remote on a real feature branch, then publish PLAN and replace unassigned metadata. Do not proceed to M2 until the M1 gate is satisfied.
