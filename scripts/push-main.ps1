# Pushes `main` using GitHub CLI credentials. Clears corrupted one-char GH_* tokens that break HTTPS auth in some shells.
$ErrorActionPreference = "Stop"
Remove-Item Env:GH_TOKEN, Env:GITHUB_TOKEN, Env:GH_PAT, Env:GH_BOT_TOKEN -ErrorAction SilentlyContinue
Set-Location (Split-Path -Parent $PSScriptRoot)
git -c credential.helper="!gh auth git-credential" push -u origin main
