/**
 * Single source of truth for YouTube URLs used across the app.
 * Prefer youtube.com/embed for playback — privacy-enhanced (nocookie) embeds
 * frequently force sign-in walls for anonymous viewers.
 */

const EMBED = "https://www.youtube.com/embed/";
const WATCH = "https://www.youtube.com/watch?v=";

export function youtubeEmbedUrl(videoId: string): string {
  return `${EMBED}${videoId}`;
}

/** @deprecated Use youtubeEmbedUrl — kept as alias for older imports */
export function youtubeNocookieEmbedUrl(videoId: string): string {
  return youtubeEmbedUrl(videoId);
}

export function youtubeWatchUrl(videoId: string): string {
  return `${WATCH}${videoId}`;
}

/** Same video ID works for Shorts UI; opens in vertical Shorts player */
export function youtubeShortsUrl(videoId: string): string {
  return `https://www.youtube.com/shorts/${videoId}`;
}

export function youtubeThumbnailUrl(videoId: string, size: "mq" | "hq" | "max" = "hq"): string {
  const file =
    size === "mq" ? "mqdefault.jpg" : size === "hq" ? "hqdefault.jpg" : "maxresdefault.jpg";
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}

/** Strip channel handles and boilerplate for cleaner on-site titles. */
export function cleanYoutubeTitle(raw: string): string {
  return raw
    .replace(/\s*[|•]\s*@[\w.-]+/gi, "")
    .replace(/\s*[|•]\s*@\s*/gi, " ")
    .replace(/\s*\(\s*OFFICIAL[^)]*\)\s*/gi, " ")
    .replace(/\s*OFFICIAL\s*(MUSIC\s*)?VIDEO\s*/gi, " ")
    .replace(/\s*4K\s*/gi, " ")
    .replace(/\s*[|•]\s*TMACK48\s*/gi, " ")
    .replace(/\s*[|•]\s*/g, " — ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s—–-]+|[\s—–-]+$/g, "")
    .trim();
}
