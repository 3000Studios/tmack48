// Rasterizes the branded OG source SVG into PNG/JPG that social platforms can render.
// Facebook, X/Twitter, iMessage, LinkedIn, Discord etc. do NOT render SVG share images,
// so we ship a 1200x630 PNG (and JPG) generated from public/og-image.svg.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "public", "og-image.svg");
const svg = readFileSync(src);

const base = sharp(svg, { density: 200 }).resize(1200, 630, { fit: "cover" });

await base.clone().png({ quality: 90 }).toFile(join(root, "public", "og-image.png"));
await base.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(join(root, "public", "og-image.jpg"));

// Square variant for messaging apps / some social cards.
const square = sharp(svg, { density: 200 }).resize(1200, 1200, { fit: "cover" });
await square.clone().png({ quality: 90 }).toFile(join(root, "public", "og-image-square.png"));

console.log("OG images written: og-image.png, og-image.jpg, og-image-square.png");
