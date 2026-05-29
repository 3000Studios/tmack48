import { slugify } from "@/lib/slug";

/**
 * Editorial / news posts. These seed entries are evergreen BRAND copy — they contain
 * no fabricated facts (no fake stats, dates, quotes, or claims). Add real news, release
 * notes, and announcements over time. `body` paragraphs are plain strings.
 */
export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date string. */
  publishedAt: string;
  /** Display tag, e.g. "Release", "Behind the scenes", "Announcement". */
  category: string;
  readMinutes: number;
  body: string[];
  /** Optional related track slug to cross-link. */
  trackSlug?: string;
}

const RAW: Omit<Post, "slug">[] = [
  {
    title: "Welcome to the TMACK48 Universe",
    excerpt:
      "What this site is, why it exists, and how to ride along with every drop, visual, and moment.",
    publishedAt: "2026-05-20",
    category: "Announcement",
    readMinutes: 2,
    body: [
      "TMACK48 is more than a catalog of songs — it's a universe. This site is the front door: the place to watch the latest videos, dig through the vault, and stay close to everything the movement puts out.",
      "Everything here is built to send you straight to the source. Watch a video and the view counts on YouTube. Like what you hear and the Subscribe button is one tap away. The goal is simple: make it effortless to support the music in the way that actually helps an independent artist grow.",
      "Bookmark this page. New videos, news, and moments land here first. The universe keeps expanding — come back often.",
    ],
  },
  {
    title: "The TMACK48 Sound: Cinematic Street Luxury",
    excerpt:
      "Gold-grade hooks, platinum polish, and a refusal to be ignored — a look at the aesthetic that ties every release together.",
    publishedAt: "2026-05-22",
    category: "Behind the sound",
    readMinutes: 3,
    body: [
      "Every TMACK48 release leans on the same DNA: street authenticity wrapped in cinematic presentation. The hooks are built for repeat. The visuals are built to look expensive on purpose. Nothing is accidental.",
      "That tension — raw subject matter, premium delivery — is the whole point. It's music that doesn't ask for attention; it takes it. Big low-end, confident cadence, and a visual language drenched in gold, platinum, and diamond.",
      "If you're new, start with the featured drops on the home page, then explore the full catalog. Each track is a doorway into the same world from a different angle.",
    ],
  },
  {
    title: "How to Support an Independent Artist (That Actually Helps)",
    excerpt:
      "The free moves that move the needle most — and why a single share can matter more than you think.",
    publishedAt: "2026-05-25",
    category: "For the fans",
    readMinutes: 3,
    body: [
      "Supporting an independent artist doesn't have to cost anything. The most valuable thing you can do is also the simplest: watch the videos all the way through, and watch them on YouTube where the views count.",
      "After that, the free moves stack up fast. Subscribe to the channel. Hit like. Leave a real comment — the algorithm reads engagement, and so does every label and playlist curator who checks the page later. Share a track with one person who'd genuinely like it. One real share beats a hundred silent plays.",
      "If you want to go further, the Support page has direct options. But never feel like you have to spend to belong. Showing up, pressing play, and spreading the word is the movement.",
    ],
  },
];

export const posts: Post[] = RAW.map((p) => ({ ...p, slug: slugify(p.title) })).sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
