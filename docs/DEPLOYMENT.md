# TMACK48 — production deployment (Cloudflare only)

## Single source of truth

- **One repository** hosts this site (this repo).
- **One production branch:** **`main`** (GitHub default branch is **`main`**; production deploys must target this branch only).
- **One public URL:** custom domain **`https://tmack48.com`** (configure in Cloudflare Pages → Custom domains). Do not treat `*.pages.dev` preview hosts as “live” in user-facing messaging.

### Git push / HTTPS auth (agents & local dev)

If `git push` fails with “could not read Username” or “Invalid username or token”, the shell may have **broken one-character `GH_TOKEN` / `GITHUB_TOKEN` / `GH_PAT` env vars** (common in IDE sessions). Remove them for the push, then use GitHub CLI credentials:

```powershell
Remove-Item Env:GH_TOKEN,Env:GITHUB_TOKEN,Env:GH_PAT,Env:GH_BOT_TOKEN -ErrorAction SilentlyContinue
git -c credential.helper="!gh auth git-credential" push -u origin main
```

Or run **`scripts/push-main.ps1`** from the repo root (same cleanup + push).

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
