import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve(process.cwd(), "dist/index.html");
const html = readFileSync(indexPath, "utf8");

const patched = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/,
  '<script data-cfasync="false" type="module" crossorigin src="$1"></script>'
);

if (patched !== html) {
  writeFileSync(indexPath, patched, "utf8");
  console.log("Patched dist/index.html with data-cfasync=false for module entry script.");
} else {
  console.log("No module entry script found to patch.");
}
