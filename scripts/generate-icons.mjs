// Generates PWA PNG icons from the favicon SVG (most launchers/stores require PNG).
// Maskable icon gets extra padding + solid background so it survives circular masks.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "favicon.svg"));
const out = (name) => join(root, "public", name);
const BG = "#050505";

async function render(size, file, pad = 0) {
  const inner = Math.round(size * (1 - pad * 2));
  const logo = await sharp(svg, { density: 384 }).resize(inner, inner, { fit: "contain" }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(out(file));
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(512, "icon-maskable-512.png", 0.12);
await render(180, "apple-touch-icon.png", 0.08);

console.log("PWA icons written: icon-192, icon-512, icon-maskable-512, apple-touch-icon");
