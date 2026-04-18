import { siteConfig } from "@/data/siteConfig";
import { videos as staticVideos, type Video } from "@/data/videos";
import {
  youtubeNocookieEmbedUrl,
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
 *   4. Merge live data (titles, thumbs, viewCount) onto the static catalog by videoId.
 *      Unknown videoIds coming back from a channel search are appended.
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
  url.searchParams.set("maxResults", "30");
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
      title: it.snippet?.title,
      thumbnailUrl: it.snippet?.thumbnails?.medium?.url,
      thumbnailHqUrl: it.snippet?.thumbnails?.high?.url,
      thumbnailMaxUrl:
        it.snippet?.thumbnails?.maxres?.url ?? it.snippet?.thumbnails?.high?.url,
    }));
}

function mergeWithStatic(live: Partial<Video>[]): Video[] {
  const byId = new Map<string, Video>();
  for (const v of staticVideos) byId.set(v.videoId, v);

  for (const lv of live) {
    if (!lv.videoId) continue;
    if (!isAllowedVideo(lv.videoId, lv.title)) continue;
    const existing = byId.get(lv.videoId);
    if (existing) {
      byId.set(lv.videoId, {
        ...existing,
        title: lv.title ?? existing.title,
        thumbnailUrl: lv.thumbnailUrl ?? existing.thumbnailUrl,
        thumbnailHqUrl: lv.thumbnailHqUrl ?? existing.thumbnailHqUrl,
        thumbnailMaxUrl: lv.thumbnailMaxUrl ?? existing.thumbnailMaxUrl,
      });
    } else {
      byId.set(lv.videoId, {
        id: `tmack48-${lv.videoId}`,
        videoId: lv.videoId,
        title: lv.title ?? "New Drop",
        embedUrl: youtubeNocookieEmbedUrl(lv.videoId),
        watchUrl: youtubeWatchUrl(lv.videoId),
        thumbnailUrl: lv.thumbnailUrl ?? youtubeThumbnailUrl(lv.videoId, "mq"),
        thumbnailHqUrl: lv.thumbnailHqUrl ?? youtubeThumbnailUrl(lv.videoId, "hq"),
        thumbnailMaxUrl: lv.thumbnailMaxUrl ?? youtubeThumbnailUrl(lv.videoId, "max"),
        category: "single",
        tags: ["latest"],
        featured: false,
        order: 999,
      });
    }
  }
  return Array.from(byId.values())
    .filter((v) => isAllowedVideo(v.videoId, v.title))
    .sort((a, b) => a.order - b.order);
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
    /** When true (default with autoplay), adds enablejsapi + origin for postMessage control */
    enableJsApi?: boolean;
    /** Parent origin for IFrame API (defaults to site URL or current window) */
    origin?: string;
  } = {}
): string {
  const u = new URL(youtubeNocookieEmbedUrl(videoId));
  u.searchParams.set("rel", "0");
  u.searchParams.set("modestbranding", "1");
  u.searchParams.set("playsinline", "1");

  const autoplay = Boolean(opts.autoplay);
  if (autoplay) u.searchParams.set("autoplay", "1");

  // Browsers block most autoplay with sound — default mute when autoplay unless explicitly overridden.
  const mute =
    opts.mute !== undefined ? opts.mute : autoplay ? true : false;
  if (mute) u.searchParams.set("mute", "1");

  if (opts.controls === false) u.searchParams.set("controls", "0");
  if (opts.loop) {
    u.searchParams.set("loop", "1");
    u.searchParams.set("playlist", videoId);
  }
  if (opts.start) u.searchParams.set("start", String(opts.start));

  const useJsApi = opts.enableJsApi ?? autoplay;
  if (useJsApi) {
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

/** Target origin for postMessage to nocookie YouTube embeds */
export const YOUTUBE_EMBED_MESSAGE_ORIGIN = "https://www.youtube-nocookie.com";
