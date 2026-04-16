export type VideoCategory =
  | "official"
  | "single"
  | "anthem"
  | "street"
  | "classic"
  | "featured"
  | "short";

export interface Video {
  id: string;
  videoId: string;
  title: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string;
  thumbnailHqUrl: string;
  thumbnailMaxUrl: string;
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  order: number;
  blurb?: string;
}

const YT_EMBED = "https://www.youtube-nocookie.com/embed/";
const YT_WATCH = "https://www.youtube.com/watch?v=";
const YT_THUMB = (id: string, size: "hq" | "mq" | "max" = "hq") =>
  `https://i.ytimg.com/vi/${id}/${size}default.jpg`;

interface SeedEntry {
  videoId: string;
  title: string;
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  blurb?: string;
}

/** Catalog synced from TMACK48SONGS channel RSS (newest → oldest). IDs are real YouTube uploads. */
const SEED: SeedEntry[] = [
  {
    videoId: "B1fVGpWTYso",
    title: "What the F#%k Are You Looking At",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "High-voltage release energy — cinematic and unapologetic.",
  },
  {
    videoId: "Axcil4Q5UJ4",
    title: "I'm Gonna Bitchslap",
    category: "anthem",
    tags: ["anthem"],
    featured: false,
    blurb: "Street-law swagger with a hook that hits like a warning shot.",
  },
  {
    videoId: "NOeRahYORa4",
    title: "I Don't Know Anymore",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "Raw honesty and mood — the sweet hits different after the sour.",
  },
  {
    videoId: "oHvmmMADMxg",
    title: "That's Whats Up",
    category: "official",
    tags: ["official", "music video", "pimpin"],
    featured: true,
    blurb: "Smooth, rolling TMACK48 flavor built for late-night speakers.",
  },
  {
    videoId: "qCKDTxhVyYk",
    title: "Meet Me in the Sky",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "A fan-favorite lift-off — big melody, bigger atmosphere.",
  },
  {
    videoId: "a4aVcTKhLu0",
    title: "ABCDE",
    category: "short",
    tags: ["short", "vertical"],
    featured: false,
    blurb: "Where the fire started — early Suno-era TMACK48 energy.",
  },
  {
    videoId: "gMPmHxNlF-w",
    title: "A Pimps Message",
    category: "anthem",
    tags: ["anthem", "pimpin"],
    featured: false,
    blurb: "Purple-coded bounce — keep it loose, keep it pimpin.",
  },
  {
    videoId: "oNH4I2tdF6s",
    title: "All This Pimp Knows",
    category: "street",
    tags: ["street", "pimpin"],
    featured: false,
    blurb: "Coast-to-coast bars with that unmistakable TMACK48 cadence.",
  },
  {
    videoId: "QtzEo6_5_hU",
    title: "Bitchslap",
    category: "street",
    tags: ["street"],
    featured: false,
    blurb: "Alternate cut energy — same attitude, different angle.",
  },
  {
    videoId: "HXDL59GD4hQ",
    title: "Oh Baby",
    category: "single",
    tags: ["single", "love song"],
    featured: false,
    blurb: "A love-letter groove — warm, melodic, personal.",
  },
  {
    videoId: "rAO-QAsKslo",
    title: "A B C D E pt.2",
    category: "single",
    tags: ["single", "sequel"],
    featured: false,
    blurb: "The sequel to ABCDE — evolution of the spark that started it all.",
  },
  {
    videoId: "Xqo59OuWh5Y",
    title: "Where the Hell Are We My Friend",
    category: "single",
    tags: ["single"],
    featured: false,
    blurb: "Big-room energy — built to knock your socks off.",
  },
  {
    videoId: "MlP5UVFFilk",
    title: "Shawty What's Your Name",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "The perfect visual for the perfect shawty — smooth and undeniable.",
  },
  {
    videoId: "BPWAgTMx0kQ",
    title: "Music, Drugs, Love",
    category: "anthem",
    tags: ["anthem"],
    featured: false,
    blurb: "Coast-to-coast pimp poetry — purple, poetic, premium.",
  },
  {
    videoId: "6u1QtgViGfg",
    title: "The Dirty Dirty South",
    category: "official",
    tags: ["official", "music video", "anthem"],
    featured: true,
    blurb: "Georgia-sized anthem energy for everyone repping the South.",
  },
];

export const videos: Video[] = SEED.map((v, i) => ({
  id: `tmack48-${v.videoId}`,
  videoId: v.videoId,
  title: v.title,
  embedUrl: `${YT_EMBED}${v.videoId}`,
  watchUrl: `${YT_WATCH}${v.videoId}`,
  thumbnailUrl: YT_THUMB(v.videoId, "mq"),
  thumbnailHqUrl: YT_THUMB(v.videoId, "hq"),
  thumbnailMaxUrl: YT_THUMB(v.videoId, "max"),
  category: v.category,
  tags: v.tags,
  featured: v.featured,
  order: i + 1,
  blurb: v.blurb,
}));

export const featuredVideos = videos.filter((v) => v.featured);

export const videoCategories: { id: VideoCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "official", label: "Official" },
  { id: "short", label: "Shorts" },
  { id: "anthem", label: "Anthems" },
  { id: "single", label: "Singles" },
  { id: "street", label: "Street" },
  { id: "classic", label: "Classics" },
];

export function getVideoById(id: string): Video | undefined {
  return videos.find((v) => v.videoId === id || v.id === id);
}

export function getRandomFeatured(): Video {
  const pool = featuredVideos.length ? featuredVideos : videos;
  return pool[Math.floor(Math.random() * pool.length)];
}
