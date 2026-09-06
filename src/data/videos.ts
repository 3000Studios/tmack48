import {
  youtubeEmbedUrl,
  youtubeShortsUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtubeUrls";

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

interface SeedEntry {
  videoId: string;
  title: string;
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  blurb?: string;
}

/**
 * Catalog synced from @TMACK48SONGS (channel page + shorts, 2026-08-11).
 * Newest long-form first, then recent Shorts. IDs verified via oEmbed.
 */
const SEED: SeedEntry[] = [
  // —— Latest official / long-form ——
  {
    videoId: "Q5y3mrm2T2E",
    title: "SONNY'S GOT A FAT LIP 2",
    category: "official",
    tags: ["official", "music video", "4k", "latest"],
    featured: true,
    blurb: "The sequel hits harder — cinematic 4K energy from the TMACK48 universe.",
  },
  {
    videoId: "PVeMJC5P9oI",
    title: "I GO DOWN, DOWN, DOWN",
    category: "official",
    tags: ["official", "music video", "latest"],
    featured: true,
    blurb: "Hypnotic hook, heavy bounce — built for late-night speakers.",
  },
  {
    videoId: "ybEYEVj6lL4",
    title: "THAT'S A BET PIMP",
    category: "official",
    tags: ["official", "music video", "pimpin", "4k"],
    featured: true,
    blurb: "Smooth confidence in 4K — a signature TMACK48 flex.",
  },
  {
    videoId: "3HeOnAxQdo4",
    title: "THE WORLD TODAY (Remastered)",
    category: "official",
    tags: ["official", "music video", "remaster"],
    featured: true,
    blurb: "Remastered statement piece — polished, present, undeniable.",
  },
  {
    videoId: "W7IilpibcfY",
    title: "ZIGZAG ONNA ZIGGY",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "Zigzag energy — sharp visuals, sharper cadence.",
  },
  {
    videoId: "11YAgrYgEFY",
    title: "YO'BOY PIMPTAY",
    category: "anthem",
    tags: ["anthem", "official", "pimpin"],
    featured: true,
    blurb: "Anthem mode activated — big personality, bigger pocket.",
  },
  {
    videoId: "17gORJT9cDA",
    title: "OH GOD WHY OH WHY",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Emotional voltage with that TMACK48 cinematic edge.",
  },
  {
    videoId: "DWWYa4LS1-Y",
    title: "WOOWEE GOO",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "Sticky hook, flashy presentation — pure movement fuel.",
  },
  {
    videoId: "ajuPCRRmAHI",
    title: "HITNIP (LET IT DRIP DRIP)",
    category: "street",
    tags: ["street", "official", "mr.bignutts"],
    featured: false,
    blurb: "TMACK48 w/ Mr.BIGNUTTS — drip on drip.",
  },
  {
    videoId: "-AfNPwNeq78",
    title: "MOTHER F#%KING",
    category: "street",
    tags: ["street", "official"],
    featured: false,
    blurb: "Unfiltered attitude — no soft edges.",
  },
  {
    videoId: "_WPewXdmwrw",
    title: "WOOWEE GOO — Visualization",
    category: "single",
    tags: ["visualization", "single"],
    featured: false,
    blurb: "Visualizer cut — loop it, live in it.",
  },
  {
    videoId: "o_piGPpM928",
    title: "MUSIC, DRUGS, LOVE REMIX",
    category: "anthem",
    tags: ["anthem", "remix", "official"],
    featured: true,
    blurb: "The remix treatment — purple, poetic, premium.",
  },
  {
    videoId: "YT2pv-LEUUI",
    title: "SONNY'S GOT A FAT LIP",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "The original Fat Lip drop — where the story started.",
  },
  {
    videoId: "yON42TdJLCc",
    title: "CUZ I'M GONNA REMIX",
    category: "single",
    tags: ["remix", "visualization"],
    featured: false,
    blurb: "Remix visualization — kinetic and relentless.",
  },
  {
    videoId: "gsC2zh4cKHc",
    title: "THEY CALL ME MR. BIGNUTTS",
    category: "anthem",
    tags: ["anthem", "mr.bignutts", "official"],
    featured: true,
    blurb: "Character anthem — larger than life, impossible to ignore.",
  },
  {
    videoId: "2EIVVAA37Ng",
    title: "I QUIT",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Hard cut energy — decisive and loud.",
  },
  {
    videoId: "vXQduoVE73E",
    title: "IN YOUR 40's..",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Grown-man bars with a wink — and a wallop.",
  },
  {
    videoId: "_2D5hEd8OEA",
    title: "MR.BIGNUTTS GOES BALLS DEEP",
    category: "street",
    tags: ["street", "mr.bignutts"],
    featured: false,
    blurb: "No half measures — Mr.BIGNUTTS goes all in.",
  },
  {
    videoId: "1NTBvwdWzqE",
    title: "RIGHT HERE/RIGHT NOW",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Present-tense pressure — live in the moment.",
  },
  {
    videoId: "1xopY7xjK74",
    title: "TOO LATE",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Clock's out — regret never sounded this clean.",
  },
  {
    videoId: "dNcAQOQkAnA",
    title: "DON'T LOOK MY WAY",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Cold shoulder, hot production.",
  },
  {
    videoId: "8MLyyRggZCA",
    title: "WHATCHA WANNA DO",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Challenge accepted — club-ready swagger.",
  },
  {
    videoId: "GjF3PMUS_Ew",
    title: "BROTHER PLEASE",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Plea with punch — melody that sticks.",
  },
  {
    videoId: "RPcbORLs9OA",
    title: "IT'S A B!TCH",
    category: "street",
    tags: ["street", "official"],
    featured: false,
    blurb: "Street truth, premium delivery.",
  },
  {
    videoId: "eok8YZTGI7Q",
    title: "IN YO 40'S",
    category: "single",
    tags: ["single"],
    featured: false,
    blurb: "Alternate cut of the 40's energy.",
  },
  {
    videoId: "WXTZTlhhc9Y",
    title: "REAL ONE",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "Real ones only — authenticity as a flex.",
  },
  {
    videoId: "iWctnTbwrQ0",
    title: "HONEYBUNS",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "Sweet title, serious heat.",
  },
  {
    videoId: "XLVcc_uEMXk",
    title: "NOBODY TO SAVE",
    category: "official",
    tags: ["official", "music video"],
    featured: false,
    blurb: "Standalone energy — no safety net required.",
  },
  {
    videoId: "zPwyLG57PO0",
    title: "OLD GLORY",
    category: "classic",
    tags: ["classic", "official"],
    featured: false,
    blurb: "Classic cut energy for the long-haul fans.",
  },
  {
    videoId: "y6DcxUkw2oY",
    title: "PIMP ALL DAY",
    category: "anthem",
    tags: ["anthem", "pimpin", "official"],
    featured: true,
    blurb: "All-day anthem — purple-coded and proud.",
  },

  // —— Shorts (recent) ——
  {
    videoId: "ZaUSefEkaxk",
    title: "Double Digits Baby!!",
    category: "short",
    tags: ["short", "vertical", "latest"],
    featured: false,
    blurb: "Celebration energy in short form.",
  },
  {
    videoId: "-sX0IwZAkXY",
    title: "FRONT ME A HONEYBUN",
    category: "short",
    tags: ["short", "vertical", "4k"],
    featured: false,
    blurb: "Honeybun short — 4K teaser heat.",
  },
  {
    videoId: "R9wMcfmR43I",
    title: "LET ME GET A HIP HOP",
    category: "short",
    tags: ["short", "vertical", "teaser"],
    featured: false,
    blurb: "Hip-hop teaser short — pure pocket.",
  },
  {
    videoId: "Xb3OKgfoJuE",
    title: "BOSS MOVES — G's FOR MEN",
    category: "short",
    tags: ["short", "vertical", "atl"],
    featured: false,
    blurb: "Boss moves. ATL coded.",
  },
  {
    videoId: "5Wq7bx0Kcc4",
    title: "BIGFACTS",
    category: "short",
    tags: ["short", "vertical"],
    featured: false,
    blurb: "Facts only — short and sharp.",
  },
  {
    videoId: "2jyAuQapS_U",
    title: "BOSS MOVES (Motivational)",
    category: "short",
    tags: ["short", "vertical", "motivational"],
    featured: false,
    blurb: "Motivational short — welcome to Atlanta energy.",
  },
  {
    videoId: "kd39S3Wjvvc",
    title: "BOOTY BROWN — Teaser",
    category: "short",
    tags: ["short", "vertical", "teaser"],
    featured: false,
    blurb: "Official short teaser — don't blink.",
  },
  {
    videoId: "eWadKPweNik",
    title: "YO'BOY PIMPTAY — Teaser",
    category: "short",
    tags: ["short", "vertical", "teaser"],
    featured: false,
    blurb: "Pimptay teaser short.",
  },
  {
    videoId: "VlQlnGvjKAo",
    title: "ZIGZAG ONNA ZIGGY — Teaser",
    category: "short",
    tags: ["short", "vertical", "teaser"],
    featured: false,
    blurb: "Zigzag short teaser for the ATL feed.",
  },
  {
    videoId: "dVREwuSDM24",
    title: "PIMPIN BEEN SINCE",
    category: "short",
    tags: ["short", "vertical", "pimpin"],
    featured: false,
    blurb: "Pimpin been since — loop-ready.",
  },
];

export const videos: Video[] = SEED.map((v, i) => ({
  id: `tmack48-${v.videoId}`,
  videoId: v.videoId,
  title: v.title,
  embedUrl: youtubeEmbedUrl(v.videoId),
  watchUrl: v.category === "short" ? youtubeShortsUrl(v.videoId) : youtubeWatchUrl(v.videoId),
  thumbnailUrl: youtubeThumbnailUrl(v.videoId, "mq"),
  thumbnailHqUrl: youtubeThumbnailUrl(v.videoId, "hq"),
  thumbnailMaxUrl: youtubeThumbnailUrl(v.videoId, "max"),
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
