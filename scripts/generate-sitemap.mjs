// Generates public/sitemap.xml from the route map + dynamic content (tracks, posts).
// Single source of truth: static routes listed here, dynamic slugs derived from the
// same titles the app uses (slugify mirrors src/lib/slug.ts).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = (process.env.VITE_SITE_URL || "https://tmack48.com").replace(/\/$/, "");

// Mirror of src/lib/slug.ts
function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const STATIC = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/videos", changefreq: "weekly", priority: "0.9" },
  { loc: "/music", changefreq: "weekly", priority: "0.9" },
  { loc: "/shorts", changefreq: "weekly", priority: "0.85" },
  { loc: "/gallery", changefreq: "weekly", priority: "0.85" },
  { loc: "/news", changefreq: "daily", priority: "0.88" },
  { loc: "/tour", changefreq: "weekly", priority: "0.8" },
  { loc: "/request", changefreq: "monthly", priority: "0.7" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/press", changefreq: "weekly", priority: "0.84" },
  { loc: "/stories", changefreq: "hourly", priority: "0.92" },
  { loc: "/merch", changefreq: "weekly", priority: "0.82" },
  { loc: "/support", changefreq: "monthly", priority: "0.78" },
  { loc: "/contact", changefreq: "monthly", priority: "0.78" },
  { loc: "/links", changefreq: "monthly", priority: "0.65" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.45" },
  { loc: "/terms", changefreq: "yearly", priority: "0.45" },
];

// --- Tracks: titles of non-short catalog entries from src/data/videos.ts ---
function trackRoutes() {
  const src = readFileSync(join(root, "src", "data", "videos.ts"), "utf8");
  const seed = src.slice(src.indexOf("const SEED"), src.indexOf("];", src.indexOf("const SEED")));
  const objects = seed.split(/\}\s*,/).filter((b) => b.includes("title:"));
  const routes = [];
  for (const obj of objects) {
    const title = obj.match(/title:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    const category = obj.match(/category:\s*"(\w+)"/)?.[1];
    if (!title || category === "short") continue;
    routes.push({
      loc: `/music/${slugify(title.replace(/\\"/g, '"'))}`,
      changefreq: "monthly",
      priority: "0.7",
    });
  }
  return routes;
}

// --- Posts: titles from src/data/posts.ts ---
function postRoutes() {
  const src = readFileSync(join(root, "src", "data", "posts.ts"), "utf8");
  const raw = src.slice(src.indexOf("const RAW"), src.indexOf("];", src.indexOf("const RAW")));
  const titles = [...raw.matchAll(/title:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  return titles.map((t) => ({
    loc: `/news/${slugify(t)}`,
    changefreq: "monthly",
    priority: "0.72",
  }));
}

const all = [...STATIC, ...trackRoutes(), ...postRoutes()];
const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) =>
      `  <url><loc>${SITE}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml written: ${all.length} URLs`);
