# TMACK48 — production deployment (Cloudflare only)

## Single source of truth

- **One repository** hosts this site (this repo).
- **One production branch:** `main` (rename local `master` → `main` if needed, set as default in GitHub, delete stale branches).
- **One public URL:** custom domain **`https://tmack48.com`** (configure in Cloudflare Pages → Custom domains). Do not treat `*.pages.dev` preview hosts as “live” in user-facing messaging.

## How releases ship

1. **Git integration (recommended):** Connect this repo to **Cloudflare Pages**. Every **push** to **`main`** triggers a **production** build and deploy to the custom domain. No GitHub Actions required (and we do not use paid GitHub Actions for deploy).
2. **CLI (manual / agent):** From repo root, production deploy is:

   ```bash
   npm run build && npx wrangler pages deploy dist --project-name=tmack48 --branch=main --commit-dirty=true
   ```

   Or `npm run deploy` (same, with `branch=main`).

## Do not use for production

- **Preview / non-main deploys** to alternate hosts — avoid; they are not the live branded site.
- **GitHub Actions workflows** for deployment — not used; Cloudflare Pages build + Wrangler are the pipeline.

## Secrets

Non-public keys (e.g. `YOUTUBE_API_KEY`) live in **Cloudflare Pages → Settings → Environment variables** or `wrangler pages secret put …`. Local agents may read **`%USERPROFILE%\.config\env\global.env`** — never commit secrets.

## Wrangler

See root **`wrangler.toml`** (`pages_build_output_dir = "dist"`). Functions live in **`functions/`**.
