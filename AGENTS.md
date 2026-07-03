# AGENTS.md — 3000Studios Project Rules

Project: tmack48.com
Firebase app: tmack48-com
Deployment target: Cloudflare DNS Only
Primary gap from audit: Needs full scaffolding setup

Rules:
- Do not expose secrets.
- Read variable names only from C:\Users\Servi\.config\env\global.env.
- Never commit .env files, API keys, service accounts, tokens, cookies, or private keys.
- Cloudflare is the public deployment platform.
- Firebase is used for Auth/Firestore only where useful.
- Firebase Storage is not enabled on Spark; use Cloudflare/static asset fallback until approved.
- Run lint/typecheck/build/security scans before final changes.
- Keep UI mobile-first, accessible, fast, SEO-ready, and AdSense-review-ready.
- Do not deploy production without approval.
