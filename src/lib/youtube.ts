import { siteConfig } from "@/data/siteConfig";
import { videos as staticVideos, type Video } from "@/data/videos";
import {
  cleanYoutubeTitle,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtubeUrls";

export interface LiveStats {
  subscribers?: string;
  views?: string;
  videoCount?: string;
  source: "api" | "fallback";
}

const PROXY_ENDPOINT = "/api/youtube";
const BLOCKED_VIDEO_IDS = new Set(["6u1QtgViGfg"]);
const BLOCKED_TITLE_PATTERNS = [/dirty\s+south/i];

/**
 * Strategy:
 *   1. Always render static fallback first (so the site works offline / no key).
 *   2. Try the Cloudflare Pages Function proxy (/api/youtube) — uses server-side key.
 *   3. If that fails AND a VITE_YOUTUBE_API_KEY is present in the browser, try direct.
 *   4. Merge live data onto the static catalog; unknown IDs append as newest.
 */
export async function fetchLiveVideos(): Promise<Video[]> {
  try {
    const res = await fetch(`${PROXY_ENDPOINT}/videos`, { credentials: "omit" });
    if (res.ok) {
      const data = (await res.json()) as { videos?: Partial<Video>[] };
      if (Array.isArray(data.videos) && data.videos.length) {
        return mergeWithStatic(data.videos);
      }
    }
  } catch {
    /* network error, fall through */
  }

  if (siteConfig.youtubeApiKey) {
    try {
      const direct = await fetchDirectFromYouTube(siteConfig.youtubeApiKey);
      if (direct.length) return mergeWithStatic(direct);
    } catch {
      /* ignore — static list is fine */
    }
  }

  return staticVideos;
}

export async function fetchLiveStats(): Promise<LiveStats> {
  try {
    const res = await fetch(`${PROXY_ENDPOINT}/stats`, { credentials: "omit" });
    if (res.ok) {
      const data = (await res.json()) as LiveStats;
      if (data && (data.subscribers || data.views || data.videoCount)) {
        return { ...data, source: "api" };
      }
    }
  } catch {
    /* ignore */
  }
  return { source: "fallback" };
}

async function fetchDirectFromYouTube(apiKey: string): Promise<Partial<Video>[]> {
  const channelId = siteConfig.channel.id;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("type", "video");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        thumbnails?: { high?: { url?: string }; maxres?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  };
  return (data.items ?? [])
    .filter((it) => it.id?.videoId)
    .map((it) => ({
      videoId: it.id!.videoId!,
      title: it.snippet?.title ? cleanYoutubeTitle(it.snippet.title) : undefined,
      thumbnailUrl: it.snippet?.thumbnails?.medium?.url,
      thumbnailHqUrl: it.snippet?.thumbnails?.high?.url,
      thumbnailMaxUrl:
        it.snippet?.thumbnails?.maxres?.url ?? it.snippet?.thumbnails?.high?.url,
    }));
}

function mergeWithStatic(live: Partial<Video>[]): Video[] {
  const staticById = new Map(staticVideos.map((v) => [v.videoId, v]));
  const ordered: Video[] = [];
  const seen = new Set<string>();

  // Live order first (newest from API / channel)
  live.forEach((lv, i) => {
    if (!lv.videoId || !isAllowedVideo(lv.videoId, lv.title)) return;
    if (seen.has(lv.videoId)) return;
    seen.add(lv.videoId);
    const existing = staticById.get(lv.videoId);
    const title = lv.title ? cleanYoutubeTitle(lv.title) : existing?.title ?? "New Drop";
    if (existing) {
      ordered.push({
        ...existing,
        title,
        thumbnailUrl: lv.thumbnailUrl ?? existing.thumbnailUrl,
        thumbnailHqUrl: lv.thumbnailHqUrl ?? existing.thumbnailHqUrl,
        thumbnailMaxUrl: lv.thumbnailMaxUrl ?? existing.thumbnailMaxUrl,
        order: i + 1,
      });
    } else {
      ordered.push({
        id: `tmack48-${lv.videoId}`,
        videoId: lv.videoId,
        title,
        embedUrl: youtubeEmbedUrl(lv.videoId),
        watchUrl: youtubeWatchUrl(lv.videoId),
        thumbnailUrl: lv.thumbnailUrl ?? youtubeThumbnailUrl(lv.videoId, "mq"),
        thumbnailHqUrl: lv.thumbnailHqUrl ?? youtubeThumbnailUrl(lv.videoId, "hq"),
        thumbnailMaxUrl: lv.thumbnailMaxUrl ?? youtubeThumbnailUrl(lv.videoId, "max"),
        category: "single",
        tags: ["latest"],
        featured: i < 6,
        order: i + 1,
      });
    }
  });

  // Append any static-only entries not returned live
  for (const v of staticVideos) {
    if (seen.has(v.videoId) || !isAllowedVideo(v.videoId, v.title)) continue;
    seen.add(v.videoId);
    ordered.push({ ...v, order: ordered.length + 1 });
  }

  return ordered;
}

function isAllowedVideo(videoId: string, title?: string): boolean {
  if (BLOCKED_VIDEO_IDS.has(videoId)) return false;
  if (title && BLOCKED_TITLE_PATTERNS.some((p) => p.test(title))) return false;
  return true;
}

export function buildEmbedUrl(
  videoId: string,
  opts: {
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    controls?: boolean;
    start?: number;
    /** Enable IFrame API only when postMessage control is required */
    enableJsApi?: boolean;
    origin?: string;
  } = {}
): string {
  const u = new URL(youtubeEmbedUrl(videoId));
  // Keep related videos on-channel; avoid extras that can trip consent walls
  u.searchParams.set("rel", "0");
  u.searchParams.set("modestbranding", "1");
  u.searchParams.set("playsinline", "1");
  u.searchParams.set("iv_load_policy", "3");
  u.searchParams.set("fs", "1");

  const autoplay = Boolean(opts.autoplay);
  if (autoplay) u.searchParams.set("autoplay", "1");

  // Autoplay requires mute in modern browsers
  const mute = opts.mute !== undefined ? opts.mute : autoplay ? true : false;
  u.searchParams.set("mute", mute ? "1" : "0");

  if (opts.controls === false) u.searchParams.set("controls", "0");
  else u.searchParams.set("controls", "1");

  if (opts.loop) {
    u.searchParams.set("loop", "1");
    u.searchParams.set("playlist", videoId);
  }
  if (opts.start) u.searchParams.set("start", String(opts.start));

  // Only attach JS API when explicitly needed — origin mismatches worsen auth walls
  if (opts.enableJsApi) {
    u.searchParams.set("enablejsapi", "1");
    const origin =
      opts.origin ??
      (typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : siteConfig.url);
    u.searchParams.set("origin", origin);
  }

  return u.toString();
}

/** Target origin for postMessage to YouTube embeds */
export const YOUTUBE_EMBED_MESSAGE_ORIGIN = "https://www.youtube.com";
