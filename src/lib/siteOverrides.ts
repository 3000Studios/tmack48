import { useEffect, useState } from "react";
import type { Video } from "@/data/videos";
import {
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtubeUrls";

/**
 * Live site overrides — the admin control center's website editor writes
 * these to /api/site-config (KV-backed); every public page fetches them
 * on load and applies them immediately, so an admin edit is live on the
 * public site on the next page load with no deploy. Everything degrades
 * to the built-in defaults when the endpoint is empty or unreachable.
 */
export interface CustomSection {
  id: string;
  heading: string;
  body: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  position: "after-hero" | "mid-page" | "before-footer";
}

export interface ExtraNavLink {
  label: string;
  url: string;
}

export interface ExtraVideo {
  videoId: string;
  title: string;
}

export interface SiteOverrides {
  heroHeading?: string;
  heroSubtext?: string;
  bannerEnabled?: boolean;
  bannerTitle?: string;
  bannerText?: string;
  heroVideoId?: string;
  hiddenVideoIds: string[];
  featuredIds: string[];
  extraVideos: ExtraVideo[];
  sections: CustomSection[];
  navLinks: ExtraNavLink[];
  shopUrl?: string;
  shopLabel?: string;
  paypalUrl?: string;
  updatedAt?: number;
}

export const EMPTY_OVERRIDES: SiteOverrides = {
  hiddenVideoIds: [],
  featuredIds: [],
  extraVideos: [],
  sections: [],
  navLinks: [],
};

const CACHE_KEY = "tmack48_site_overrides_v1";

let current: SiteOverrides | null = null;
let loadPromise: Promise<SiteOverrides> | null = null;
const listeners = new Set<(o: SiteOverrides) => void>();

function notify() {
  if (!current) return;
  listeners.forEach((fn) => fn(current as SiteOverrides));
}

function normalize(raw: unknown): SiteOverrides {
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<SiteOverrides>;
  return {
    heroHeading: typeof o.heroHeading === "string" ? o.heroHeading : undefined,
    heroSubtext: typeof o.heroSubtext === "string" ? o.heroSubtext : undefined,
    bannerEnabled: typeof o.bannerEnabled === "boolean" ? o.bannerEnabled : undefined,
    bannerTitle: typeof o.bannerTitle === "string" ? o.bannerTitle : undefined,
    bannerText: typeof o.bannerText === "string" ? o.bannerText : undefined,
    heroVideoId: typeof o.heroVideoId === "string" ? o.heroVideoId : undefined,
    hiddenVideoIds: Array.isArray(o.hiddenVideoIds) ? o.hiddenVideoIds : [],
    featuredIds: Array.isArray(o.featuredIds) ? o.featuredIds : [],
    extraVideos: Array.isArray(o.extraVideos) ? o.extraVideos : [],
    sections: Array.isArray(o.sections) ? o.sections : [],
    navLinks: Array.isArray(o.navLinks) ? o.navLinks : [],
    shopUrl: typeof o.shopUrl === "string" ? o.shopUrl : undefined,
    shopLabel: typeof o.shopLabel === "string" ? o.shopLabel : undefined,
    paypalUrl: typeof o.paypalUrl === "string" ? o.paypalUrl : undefined,
    updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : undefined,
  };
}

export function ensureOverridesLoaded(): Promise<SiteOverrides> {
  if (typeof window === "undefined") return Promise.resolve(EMPTY_OVERRIDES);
  if (current) return Promise.resolve(current);
  if (loadPromise) return loadPromise;
  // Paint fast from the last known config, refresh in the background.
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (cached) {
      current = normalize(JSON.parse(cached));
      notify();
    }
  } catch {
    // ignore
  }
  loadPromise = (async () => {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 3500);
      const res = await fetch("/api/site-config", { signal: ctrl.signal });
      window.clearTimeout(t);
      if (res.ok) {
        const fresh = normalize(await res.json());
        current = fresh;
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        } catch {
          // ignore
        }
        notify();
        return fresh;
      }
    } catch {
      // endpoint unreachable — defaults stay in force
    }
    current = current ?? EMPTY_OVERRIDES;
    return current;
  })();
  return loadPromise;
}

export function useSiteOverrides(): SiteOverrides {
  const [ov, setOv] = useState<SiteOverrides>(() => current ?? EMPTY_OVERRIDES);
  useEffect(() => {
    let alive = true;
    listeners.add(setOv);
    ensureOverridesLoaded().then((o) => {
      if (alive) setOv(o);
    });
    return () => {
      alive = false;
      listeners.delete(setOv);
    };
  }, []);
  return ov;
}

/** Admin save — POSTs the full override set; on success the local copy updates too. */
export async function saveOverrides(
  passcode: string,
  ov: SiteOverrides
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Passcode": passcode },
      body: JSON.stringify(ov),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; config?: unknown };
    if (!res.ok || !data.ok) return { ok: false, error: data.error || `Save failed (${res.status}).` };
    current = normalize(data.config ?? ov);
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
    notify();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the site storage. Check your connection and try again." };
  }
}

function extraVideoToVideo(e: ExtraVideo, order: number): Video {
  return {
    id: `taylormade-${e.videoId}`,
    videoId: e.videoId,
    title: e.title,
    embedUrl: youtubeEmbedUrl(e.videoId),
    watchUrl: youtubeWatchUrl(e.videoId),
    thumbnailUrl: youtubeThumbnailUrl(e.videoId, "mq"),
    thumbnailHqUrl: youtubeThumbnailUrl(e.videoId, "hq"),
    thumbnailMaxUrl: youtubeThumbnailUrl(e.videoId, "hq"),
    category: "official",
    tags: ["added-in-admin"],
    featured: false,
    order,
    blurb: "Added from the admin control center.",
  };
}

/**
 * Apply overrides to a video list: added videos join the catalog, hidden
 * videos disappear everywhere, and an admin-chosen featured order (when
 * set) decides which videos are "top" and in what order.
 */
export function applyOverridesToVideos(videos: Video[], ov: SiteOverrides): Video[] {
  let list = [...videos];
  const known = new Set(list.map((v) => v.videoId));
  ov.extraVideos.forEach((e, i) => {
    if (!known.has(e.videoId)) {
      list.unshift(extraVideoToVideo(e, 1000 + i));
      known.add(e.videoId);
    }
  });
  if (ov.hiddenVideoIds.length) {
    const hidden = new Set(ov.hiddenVideoIds);
    list = list.filter((v) => !hidden.has(v.videoId));
  }
  if (ov.featuredIds.length) {
    const rank = new Map(ov.featuredIds.map((id, i) => [id, i]));
    list = list
      .map((v) => ({ ...v, featured: rank.has(v.videoId) }))
      .sort((a, b) => {
        const ra = rank.get(a.videoId);
        const rb = rank.get(b.videoId);
        if (ra !== undefined && rb !== undefined) return ra - rb;
        if (ra !== undefined) return -1;
        if (rb !== undefined) return 1;
        return 0;
      });
  }
  return list;
}

/** Pull a YouTube video id out of a pasted link or bare id. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    s.match(/shorts\/([A-Za-z0-9_-]{11})/) ||
    s.match(/embed\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
