import { videos, type Video } from "@/data/videos";
import { slugify } from "@/lib/slug";

/**
 * Track / lyrics pages are derived from the real video catalog so there is a single
 * source of truth and zero fabricated data.
 *
 * `lyrics` is intentionally EMPTY by default — these pages render a "lyrics coming soon"
 * state until real, authorized lyrics are added here. Do NOT invent lyrics; paste the
 * artist's real words keyed by videoId in LYRICS below.
 */
export interface Track extends Video {
  slug: string;
  /** Real lyrics, one entry per line/stanza. Empty = not yet published. */
  lyrics: string[];
}

/** Real lyrics keyed by YouTube videoId. Fill these in over time — leave blank otherwise. */
const LYRICS: Record<string, string[]> = {
  // "B1fVGpWTYso": ["First line of the real verse", "Second line", ...],
};

/** Music tracks = every catalog entry that is a full song (excludes Shorts). */
export const tracks: Track[] = videos
  .filter((v) => v.category !== "short")
  .map((v) => ({
    ...v,
    slug: slugify(v.title),
    lyrics: LYRICS[v.videoId] ?? [],
  }));

export function getTrackBySlug(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

export function relatedTracks(slug: string, count = 3): Track[] {
  const current = getTrackBySlug(slug);
  if (!current) return tracks.slice(0, count);
  return tracks
    .filter((t) => t.slug !== slug)
    .sort((a, b) => {
      const aShared = a.tags.filter((tag) => current.tags.includes(tag)).length;
      const bShared = b.tags.filter((tag) => current.tags.includes(tag)).length;
      return bShared - aShared;
    })
    .slice(0, count);
}
