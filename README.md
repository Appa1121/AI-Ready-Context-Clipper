# AI-Ready Context Clipper

A local-first Chrome Manifest V3 extension, built with Vanilla JavaScript, HTML and CSS.

**Current delivery: M1 foundation preview.** The side panel opens and shows an honest empty state. Capture, storage, copying, deletion, template editing and export are **not implemented yet**. Their specifications and handoffs are included; disabled controls do not simulate success.

## Install the preview
1. Use Chrome Desktop 116 or newer.
2. Open `chrome://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select this project's **src/** directory (not the repository root).
4. Pin AI-Ready Context Clipper from the Extensions menu and click its toolbar icon.
5. The side panel should open. Close and reopen it, and check the extension Errors section and panel console.

No icon files are referenced until actual assets exist. Do not select the root as an unpacked extension.

## Development checks
Node.js 22+ (CI uses 24), no external packages or install step required:

```sh
node scripts/check.mjs
node --test
```

If npm is available, `npm run check` and `npm test` are equivalent. Static checks and Node tests do not replace Chrome, PDF, clipboard or worker-lifecycle tests. See [TESTING](docs/TESTING.md).

## Public-repo collaboration
Repository: https://github.com/Appa1121/AI-Ready-Context-Clipper

- Appa approves product decisions and merges.
- Gemini Argon leads delivery; GPT Astra leads architecture/contracts.
- Gemini Hydrogen and GPT-6.1 Sol implement bounded tasks.
- Antigravity alone writes Git/GitHub and publishes PLAN.
- Read [AGENTS](AGENTS.md), [PLAN](PLAN.md), [CONTRACTS](docs/CONTRACTS.md), [WORKFLOW](docs/WORKFLOW.md) and the assigned task before work.
- New chats receive repo URL, Task ID, source/spec commit SHAs and pinned links. Inaccessible public files require a snapshot of the same SHA, not guessed contents.

This folder was prepared as a local handoff, not a remote checkout. Antigravity must reconcile it on a feature branch before publishing. See [bootstrap report](docs/reports/BOOTSTRAP-report.md).

## MVP roadmap
M1 foundation → M2 clipping/storage and formatter → M3 panel CRUD → M4 prompt workflow → M5 hardening/release candidate. M1 merge is a dependency gate, not a claim that all five milestones have shipped.

## Privacy and limitations
The preview makes no network requests and stores no clips. Planned MVP storage is `chrome.storage.local`, without sync, server, telemetry, API keys or automatic AI submission. Storage is not encrypted; copied text enters the system clipboard. Uninstalling the extension can remove its local data. This MVP has no backup/restore feature.

Only `sidePanel`, `contextMenus`, `storage`, `activeTab` are requested. PDF capture will use the context-menu selection supplied by Chrome; selectable HTTPS/local PDFs require real testing. No OCR or promise of support for every viewer/restricted browser page. File URL access settings may affect local-file behavior.

Web Store publication, branding icons, OCR, cloud sync and AI API integration are outside the initial MVP. See [SECURITY](SECURITY.md) before reporting sensitive issues.
