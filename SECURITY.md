# Security and public-repository hygiene

Do not include real clip text, prompts, browsing history, tokens, credentials, browser profiles or private screenshots in public Issues, PRs, logs or fixtures. Reproduce using synthetic data.

For a suspected vulnerability, use GitHub's **Report a vulnerability** option if the repository owner has enabled private vulnerability reporting. Otherwise contact Appa through an already-established private channel. If neither is available, open only a minimal request for a private reporting channel, without exploit details or sensitive data. No private reporting endpoint is assumed to exist.

Appa/Antigravity must verify and enable private reporting if desired. This bootstrap does not configure GitHub security settings.

Security invariants: local-only storage; four declared permissions; no HTML interpretation of page data; authenticated and validated messages; single storage writer; no silent data resets; no remote code; no automatic AI submission. Review findings must identify the affected revision and a synthetic reproduction.
