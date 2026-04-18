interface Env {
  SITE_URL?: string;
}

export interface StoryPayload {
  edition: number;
  title: string;
  excerpt: string;
  body: string;
  videoUrl: string;
  mediaCredit: string;
  publishedAt: string;
  canonicalPath: string;
  canonicalUrl: string;
}

const HOUR_MS = 3600000;
/** First hour bucket for edition numbering (UTC). */
const START_HOUR_BUCKET = Math.floor(Date.UTC(2025, 0, 1, 0, 0, 0) / HOUR_MS);

/** Free-to-use stock clips (Pixabay-style CDN — replace with your own CDN if preferred). */
const VIDEO_POOL: { url: string; credit: string }[] = [
  {
    url: "https://cdn.pixabay.com/video/2021/08/26/84669-733630574_large.mp4",
    credit: "Stock footage via Pixabay license",
  },
  {
    url: "https://cdn.pixabay.com/video/2022/03/18/112602-693665689_large.mp4",
    credit: "Stock footage via Pixabay license",
  },
  {
    url: "https://cdn.pixabay.com/video/2021/04/21/71656-696688039_large.mp4",
    credit: "Stock footage via Pixabay license",
  },
  {
    url: "https://cdn.pixabay.com/video/2022/01/18/106339-669259556_large.mp4",
    credit: "Stock footage via Pixabay license",
  },
];

const HOOKS = [
  "Cinematic grind log",
  "Midnight studio voltage",
  "Royalty-in-motion briefing",
  "Street-to-stage transmission",
  "Luxury flash universe feed",
  "Anthem engineering desk",
  "Visual empire dispatch",
  "Playlist warfare chronicle",
];

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function currentEdition(): number {
  const bucket = Math.floor(Date.now() / HOUR_MS);
  return Math.max(0, bucket - START_HOUR_BUCKET);
}

function buildStory(edition: number, baseUrl: string): StoryPayload {
  const rng = mulberry32(edition * 7919 + 104729);
  const hook = HOOKS[Math.floor(rng() * HOOKS.length)];
  const clip = VIDEO_POOL[Math.floor(rng() * VIDEO_POOL.length)];
  const hourStart = new Date((START_HOUR_BUCKET + edition) * HOUR_MS);

  const title = `${hook} · TMACK48 Hour #${edition}`;
  const excerpt = `Official hourly movement feed — luxury visuals, street precision, and the TMACK48 universe in motion. Edition ${edition}.`;

  const body = [
    `Edition ${edition} opens on the TMACK48 timeline at ${hourStart.toUTCString()}. This dispatch is generated for the hour and stays indexed for the archive — newest hour always leads the Stories front.`,
    `The movement is cinematic: gold-grade hooks, platinum polish, and diamond clarity in every frame. Whether you catch the drop on YouTube or ride the wave here, you are inside the official artist universe.`,
    `Clip note: featured stock visuals rotate on a copyright-friendly pool (clearly credited). Swap sources in \`functions/api/stories.ts\` any time — keep everything rights-safe and on-brand.`,
    `No claiming this feed as financial or legal advice — it is editorial atmosphere matching TMACK48 branding. For bookings or business, use the Contact page.`,
  ].join("\n\n");

  const path = `/stories/${edition}`;
  const origin = baseUrl.replace(/\/$/, "");

  return {
    edition,
    title,
    excerpt,
    body,
    videoUrl: clip.url,
    mediaCredit: clip.credit,
    publishedAt: hourStart.toISOString(),
    canonicalPath: path,
    canonicalUrl: `${origin}${path}`,
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const editionParam = url.searchParams.get("edition");
  const base =
    env.SITE_URL ?? url.origin ?? "https://tmack48.com";

  if (editionParam !== null && editionParam !== "") {
    const edition = Number.parseInt(editionParam, 10);
    if (!Number.isFinite(edition) || edition < 0) {
      return json({ error: "Invalid edition" }, 400);
    }
    const latest = currentEdition();
    if (edition > latest) {
      return json({ error: "Edition not yet published" }, 404);
    }
    return json({ story: buildStory(edition, base) }, 200, cacheHeaders());
  }

  const latest = currentEdition();
  const depth = 168;
  const stories: StoryPayload[] = [];
  const floor = Math.max(0, latest - depth + 1);
  for (let e = latest; e >= floor; e--) {
    stories.push(buildStory(e, base));
  }

  return json(
    {
      latestEdition: latest,
      generatedHourUtc: new Date(Math.floor(Date.now() / HOUR_MS) * HOUR_MS).toISOString(),
      stories,
    },
    200,
    cacheHeaders()
  );
};

function cacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=60, s-maxage=120",
    "Access-Control-Allow-Origin": "*",
  };
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extra,
    },
  });
}
