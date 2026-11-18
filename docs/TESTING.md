# Verification and acceptance

## Automated
Run `node scripts/check.mjs` then `node --test` (Node 22+, CI 24). No npm install is needed. Static checks inspect JS syntax, manifest permissions/referenced files, local HTML/CSS assets, and banned executable patterns. These checks are guardrails, not a complete security audit or a Chrome emulator.

M1 tests cover strict envelope/payload validation, corruption/unsupported schemas, immutable defaults and worker panel setup including handled rejection. Later milestones add capture, repository concurrency/failure, client ordering/cleanup and formatter behavior tests.

## Evidence template
```text
Task / PR:
Source and tested commit SHA (or local uncommitted candidate):
OS / Chrome version:
Date/time and timezone:
Steps:
Expected / actual outcome:
PASS / FAIL / NOT RUN:
Synthetic fixture used:
Limitations / blocker / owner:
```

Use synthetic data and cropped non-sensitive screenshots. Do not claim CI has passed because equivalent commands passed locally. Do not claim PDF or worker behavior from Node mocks.

## M1 browser acceptance (all initially NOT RUN)
- Load unpacked from src/ on Chrome 116+; no missing-file/manifest errors.
- Pin and click action; global side panel opens without a popup.
- Close/reopen; navigate tabs; expected panel remains available.
- Foundation notice honestly says saving is not implemented. Copy/Clear remain disabled.
- No runtime errors in extension or panel console.
- Narrow panel, zoom 200%, light/dark modes: no horizontal overflow or clipped text.
- Keyboard focus is visible; headings and live status are available to assistive technology.
- Verify exactly four permissions, no external requests and no storage writes.

## M2 capture/storage
- Save synthetic text from HTTPS HTML while panel closed; reopen and inspect metadata.
- Blank/whitespace rejected; Thai, emoji, multiline, leading whitespace preserved.
- Duplicate text saved as distinct IDs; rapid saves do not lose entries.
- HTTPS PDF with selectable text; repeat using local file PDF and record file-access setting.
- Check source URL/title are document metadata, not internal viewer/selected link URLs.
- iframe uses parent page metadata. No OCR claim for scanned PDFs.
- Close worker DevTools, let worker stop, save again; repeat after browser restart.
- Mock storage rejection/quota: previous state unchanged, caller gets error, later queued write works.
- Simulate corrupt/unknown schema using isolated fixtures; never overwrite it.

## M3 concurrency/UI
- Loading/empty/ready/error; full detail text; long words/URLs; keyboard navigation.
- Two Chrome windows/panels update consistently after a capture/delete.
- Add racing with clear/delete: conflict surfaces; no silent loss of newly added data.
- Clear confirmation cancellation changes nothing; confirmed clear retains settings.
- Copy one yields exact clip.text; denied clipboard reveals selectable fallback.
- Synthetic <script>, HTML tags and javascript: URL remain inert; only HTTP(S) navigates.
- Unsubscribe prevents callbacks after teardown; late initial reads cannot replace newer revisions.

## M4 prompt workflow
- Prefix/suffix persist after restart; empty strings permitted.
- Unrelated captures don't erase unsaved editor input; concurrent settings edit surfaces conflict.
- Export numbering/order, Thai/emoji/newlines, metadata escapes and embedded backticks.
- Export corresponds to displayed snapshot; empty list disables export.
- ChatGPT/Gemini open fixed URLs without clip text, query prompts, paste or submission.

## M5 release
- Repeat relevant above checks on the exact release candidate SHA.
- Reload extension and restart Chrome; permissions unchanged.
- Inspect src/ package contents: no private fixtures, secrets or development files.
- CI passed on the tested commit; no data-loss/security/core-workflow blockers.
- Appa approval recorded, Antigravity merges and tags v0.1.0. Web Store submission is separate.

No destructive storage testing on Appa's real extension data. Use a separate test profile or injected mock storage.
