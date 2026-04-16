export type VideoCategory =
  | "official"
  | "single"
  | "anthem"
  | "street"
  | "classic"
  | "featured";

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

const seed: Array<
  Omit<Video, "embedUrl" | "watchUrl" | "thumbnailUrl" | "thumbnailHqUrl" | "thumbnailMaxUrl" | "id">
> & { _videoId?: string } = [] as never;

interface SeedEntry {
  videoId: string;
  title: string;
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  blurb?: string;
}

const SEED: SeedEntry[] = [
  {
    videoId: "kYV3Vl_lZ8M",
    title: "Mr BigNutts (Official Music Video)",
    category: "official",
    tags: ["official", "music video"],
    featured: true,
    blurb: "The official music video that put the movement on notice.",
  },
  { videoId: "Q-9mH_7p0k0", title: "Booty Brown", category: "single", tags: ["single"], featured: true, blurb: "A laid-back anthem with that West Coast bounce." },
  { videoId: "6Yt-3kR9wN0", title: "Pimpin In My Cup", category: "anthem", tags: ["anthem"], featured: true, blurb: "Chrome pours and smooth talk — the TMACK48 signature mood." },
  { videoId: "jL6S8kU9VvM", title: "Keep It Movin", category: "single", tags: ["single"], featured: false, blurb: "For the ones chasing greatness — never stop." },
  { videoId: "hB2C7d_9K8o", title: "Let's Get It Started", category: "anthem", tags: ["anthem"], featured: true, blurb: "Stadium-ready energy. Press play and lock in." },
  { videoId: "fD4E8f_3G8s", title: "I'm a Hustler", category: "street", tags: ["street"], featured: false, blurb: "A grind manifesto set to pure heat." },
  { videoId: "gE5F9h_4H9t", title: "The Grind", category: "street", tags: ["street"], featured: false, blurb: "Dawn-to-dusk work ethic on wax." },
  { videoId: "iF7G0j_5I0u", title: "Old School Vibes", category: "classic", tags: ["classic"], featured: false, blurb: "Throwback flows with modern polish." },
  { videoId: "kH9I2k_6K1v", title: "Street Life", category: "street", tags: ["street"], featured: false, blurb: "Pavement poetry with cinematic scope." },
  { videoId: "mJ1K3l_7L2w", title: "Coming Up", category: "single", tags: ["single"], featured: false, blurb: "The rise record. Loud, hungry, unmissable." },
  { videoId: "nK2L4m_8M3x", title: "My Life Story", category: "single", tags: ["single"], featured: false, blurb: "A first-person timeline, told in bars." },
  { videoId: "oL3N5n_9N4y", title: "Ride With Me", category: "anthem", tags: ["anthem"], featured: false, blurb: "Windows down, city blurring by." },
  { videoId: "pM4O6o_0O5z", title: "Real Talk", category: "street", tags: ["street"], featured: false, blurb: "No filter. No apologies. Just truth." },
  { videoId: "qN5P7p_1P6a", title: "Tha Hood", category: "street", tags: ["street"], featured: false, blurb: "A love letter to the blocks that built him." },
  { videoId: "rO6Q8q_2Q7b", title: "Game Time", category: "anthem", tags: ["anthem"], featured: false, blurb: "Clock's ticking — suit up and execute." },
  { videoId: "sP7R9r_3R8c", title: "Stay True", category: "classic", tags: ["classic"], featured: false, blurb: "A record built on loyalty and longevity." },
  { videoId: "tQ8S0s_4S9d", title: "Top of the Line", category: "anthem", tags: ["anthem"], featured: true, blurb: "Luxury-coded. Everything premium." },
  { videoId: "uR9T1t_5T0e", title: "No Games", category: "single", tags: ["single"], featured: false, blurb: "Clear-eyed warnings over ice-cold production." },
  { videoId: "vS0U2u_6U1f", title: "The Takeover", category: "anthem", tags: ["anthem"], featured: true, blurb: "The closing statement — full crown in view." },
  { videoId: "wT1V3v_7V2g", title: "Finish Line", category: "classic", tags: ["classic"], featured: false, blurb: "Where the grind meets the victory lap." },
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
