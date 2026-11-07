// Site editor config — the admin control center's website editor reads and
// writes the live site's overrides here (hero words, featured/hidden videos,
// added videos, custom sections, extra menu tabs, shop link). Stored in the
// SITE_KV namespace; the public site fetches this on load and applies the
// overrides immediately — an edit in admin is live on the public page on
// the next page load, no deploy needed. Degrades gracefully (empty config,
// writes refused) when the SITE_KV binding is absent.
interface Env {
  SITE_KV?: KVNamespace;
  ADMIN_PASSCODE?: string;
}

const KEY = "site_config_v1";
const MAX_BODY = 60_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Passcode",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

function cleanStr(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.replace(/[<>]/g, "").trim().slice(0, max);
  return s ? s : undefined;
}

function cleanUrl(v: unknown): string | undefined {
  const s = cleanStr(v, 500);
  if (!s) return undefined;
  return /^https?:\/\//i.test(s) || s.startsWith("/") ? s : undefined;
}

function cleanIdList(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item === "string" && /^[A-Za-z0-9_-]{6,20}$/.test(item) && !out.includes(item)) {
      out.push(item);
      if (out.length >= max) break;
    }
  }
  return out;
}

/** Keep only known keys, with caps — the stored config can never grow teeth. */
function sanitizeConfig(input: unknown): Record<string, unknown> {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  const heroHeading = cleanStr(src.heroHeading, 80);
  if (heroHeading) out.heroHeading = heroHeading;
  const heroSubtext = cleanStr(src.heroSubtext, 400);
  if (heroSubtext) out.heroSubtext = heroSubtext;
  if (typeof src.bannerEnabled === "boolean") out.bannerEnabled = src.bannerEnabled;
  const bannerTitle = cleanStr(src.bannerTitle, 120);
  if (bannerTitle) out.bannerTitle = bannerTitle;
  const bannerText = cleanStr(src.bannerText, 300);
  if (bannerText) out.bannerText = bannerText;
  const heroVideoId = cleanStr(src.heroVideoId, 20);
  if (heroVideoId && /^[A-Za-z0-9_-]{6,20}$/.test(heroVideoId)) out.heroVideoId = heroVideoId;

  out.hiddenVideoIds = cleanIdList(src.hiddenVideoIds, 200);
  out.featuredIds = cleanIdList(src.featuredIds, 50);

  out.extraVideos = (Array.isArray(src.extraVideos) ? src.extraVideos : [])
    .slice(0, 50)
    .map((e) => {
      const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
      const videoId = cleanStr(o.videoId, 20);
      const title = cleanStr(o.title, 140);
      return videoId && title && /^[A-Za-z0-9_-]{6,20}$/.test(videoId) ? { videoId, title } : null;
    })
    .filter(Boolean);

  out.sections = (Array.isArray(src.sections) ? src.sections : [])
    .slice(0, 20)
    .map((s) => {
      const o = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
      const heading = cleanStr(o.heading, 120);
      if (!heading) return null;
      const position = ["after-hero", "mid-page", "before-footer"].includes(String(o.position))
        ? String(o.position)
        : "mid-page";
      return {
        id: cleanStr(o.id, 40) || `sec-${Math.random().toString(36).slice(2, 9)}`,
        heading,
        body: cleanStr(o.body, 1200) || "",
        imageUrl: cleanUrl(o.imageUrl),
        linkUrl: cleanUrl(o.linkUrl),
        linkLabel: cleanStr(o.linkLabel, 60),
        position,
      };
    })
    .filter(Boolean);

  out.navLinks = (Array.isArray(src.navLinks) ? src.navLinks : [])
    .slice(0, 12)
    .map((l) => {
      const o = (l && typeof l === "object" ? l : {}) as Record<string, unknown>;
      const label = cleanStr(o.label, 40);
      const url = cleanUrl(o.url);
      return label && url ? { label, url } : null;
    })
    .filter(Boolean);

  const shopUrl = cleanUrl(src.shopUrl);
  if (shopUrl) out.shopUrl = shopUrl;
  const shopLabel = cleanStr(src.shopLabel, 40);
  if (shopLabel) out.shopLabel = shopLabel;
  const paypalUrl = cleanUrl(src.paypalUrl);
  if (paypalUrl) out.paypalUrl = paypalUrl;

  out.updatedAt = Date.now();
  return out;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.SITE_KV) return json({});
  const raw = await env.SITE_KV.get(KEY);
  if (!raw) return json({});
  try {
    return new Response(raw, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=30",
        ...corsHeaders,
      },
    });
  } catch {
    return json({});
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const passcode = env.ADMIN_PASSCODE || "3000";
  if (request.headers.get("x-admin-passcode") !== passcode) {
    return json({ ok: false, error: "Wrong passcode." }, 401);
  }
  if (!env.SITE_KV) {
    return json({ ok: false, error: "Site storage is not connected yet." }, 501);
  }
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ ok: false, error: "Config too large." }, 413);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "Invalid JSON." }, 400);
  }
  const clean = sanitizeConfig(parsed);
  await env.SITE_KV.put(KEY, JSON.stringify(clean));
  return json({ ok: true, config: clean });
};
