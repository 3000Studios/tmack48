/**
 * Cloudflare Pages deploy with backoff for API 429 rate limits.
 * Does NOT set CLOUDFLARE_API_TOKEN — Wrangler uses `wrangler login` OAuth from ~/.wrangler/.
 * For CI, set CLOUDFLARE_API_TOKEN to a real Cloudflare API token (not GitHub / OAuth paste).
 */
import { execSync } from "node:child_process";

const PROJECT = "tmack48";
const BRANCH = "main";
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "d6ec056b27a57bcf807a46b2e3379d60";

const delaysSec = [0, 45, 90, 120, 180, 240, 300];

async function main() {
  const env = { ...process.env };
  // Force Wrangler to use `wrangler login` OAuth (stored in ~/.wrangler/). Mixing in a GitHub or wrong token as
  // CLOUDFLARE_API_TOKEN causes auth error 10000. For CI, run `wrangler pages deploy` with a real CF API token instead.
  delete env.CLOUDFLARE_API_TOKEN;
  env.CLOUDFLARE_ACCOUNT_ID = ACCOUNT_ID;

  for (let i = 0; i < delaysSec.length; i++) {
    const wait = delaysSec[i];
    if (wait > 0) {
      console.log(`\n⏳ Waiting ${wait}s before attempt ${i + 1}/${delaysSec.length}…\n`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    } else {
      console.log(`\n📤 Deploy attempt ${i + 1}/${delaysSec.length}…\n`);
    }

    try {
      execSync(
        `npx wrangler pages deploy dist --project-name=${PROJECT} --branch=${BRANCH} --commit-dirty=true`,
        { stdio: "inherit", env, cwd: process.cwd(), shell: true }
      );
      console.log("\n✅ Deploy finished successfully.\n");
      process.exit(0);
    } catch {
      console.error(`\n⚠️ Attempt ${i + 1} failed.\n`);
    }
  }

  console.error(
    "\n❌ All deploy attempts failed. Check `wrangler login`, or connect GitHub to Cloudflare Pages for auto-deploy.\n"
  );
  process.exit(1);
}

main();
