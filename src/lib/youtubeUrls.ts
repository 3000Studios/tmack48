/**
 * Single source of truth for YouTube URLs used across the app.
 * Video IDs must match real uploads on @TMACK48SONGS (channel UCoshH9Hn9nCEC0z8BS6WdIQ).
 */

const NOCOOKIE_EMBED = "https://www.youtube-nocookie.com/embed/";
const WATCH = "https://www.youtube.com/watch?v=";

export function youtubeNocookieEmbedUrl(videoId: string): string {
  return `${NOCOOKIE_EMBED}${videoId}`;
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
