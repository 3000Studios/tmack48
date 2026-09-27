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

{
  title: "TMACK48 on YouTube: Where Every Official Video Lives",
  excerpt:
  "The official video library, what the visuals are known for, and how to catch the next drop the day it lands.",
  publishedAt: "2026-09-27",
  category: "Release",
  readMinutes: 3,
  body: [
  "Every TMACK48 single gets the visual treatment. The official music videos all live in one place — the 3000 Studios YouTube channel — and they are half the art. If you have only streamed the audio, you have only heard half the record.",
  "What the videos are known for.",
  "The visual language is consistent: bold lighting, performance shots that put the artist front and center, and an edit that moves with the drums instead of against them. The presentation is deliberately premium — street subject matter, cinematic delivery. That tension between raw content and polished visuals is the signature, and it carries across the whole library.",
  "How to watch them right.",
  "Start with the videos for the latest singles, since those represent the current sound and look. Then work backward through the catalog — you can see the visual identity tighten up release by release. Watch on YouTube rather than reposts or embeds elsewhere: that is where the views count, and that is where new drops land first.",
  "Catching the next drop.",
  "New videos premiere on the 3000 Studios channel. The reliable way to catch one the day it lands: subscribe to the channel and turn on notifications, and follow TMACK48 on socials for teaser clips. Every premiere also gets written up in the news section here, with links. Press play, run it up, and share it with somebody who needs new music in their life.",
  ],
},
{
  title: "The Independent Process: How Records Like These Get Made",
  excerpt:
  "No studio myths — a realistic look at how an independent artist takes a song from idea to finished mix.",
  publishedAt: "2026-09-27",
  category: "Behind the scenes",
  readMinutes: 3,
  body: [
  "Fans usually only hear the finished record. What they don't hear is everything between the first idea and the final bounce. Here is an honest look at how independent records in this lane typically come together — no myths, no invented details, just the work.",
  "It starts with the beat.",
  "For this kind of music, the instrumental comes first. The beat has to move on its own before any writing happens — if it doesn't hit in the first few seconds, it doesn't survive. What survives gets looped and lived with until the direction of the song becomes obvious.",
  "Writing is rewriting.",
  "Hooks get the most attention by far. A strong hook might go through a dozen versions — different melodies, different cadences, different stacks — before the keeper emerges. The test is simple: can a crowd chant it back after one listen? Verses get rewritten too. The rule is that every bar has to earn its spot; weak lines get cut, not patched.",
  "Recording and mixing.",
  "Vocals are tracked in takes and punches, then comped together line by line. Ad-libs are treated as a planned layer, not an afterthought. Doubles and harmonies get stacked to give the record its size, especially on the hook. Then the mix: drums up front, vocals sitting on top, low end tuned for real-world speakers — including car systems, because that is where a lot of fans hear this music first.",
  "Why the process matters.",
  "None of this is glamorous, and that is the point. A record that sounds effortless usually took the most effort. The next time a new TMACK48 single drops, you'll have a better ear for what went into it — the rewrites, the stacks, the mix passes. That is the independent grind: no shortcuts, just reps.",
  ],
},
{
  title: "TMACK48 Streaming Guide: Playlists, Platforms, and Where to Start",
  excerpt:
  "Every platform, a listener roadmap, and playlist ideas for new and longtime fans.",
  publishedAt: "2026-09-27",
  category: "For the fans",
  readMinutes: 3,
  body: [
  "New to TMACK48, or just want to make sure you're hearing everything? Here's the full rundown on where the music lives, how to keep up with new drops, and the best way to dive into the catalog.",
  "Every major platform.",
  "TMACK48's full catalog is distributed across all major streaming services. On Spotify, follow the artist profile to get new releases in your Release Radar the moment they drop. On Apple Music the full catalog is available with offline listening. The 3000 Studios YouTube channel hosts every official music video — subscribe and turn on notifications. Amazon Music, Tidal, Deezer and more carry the catalog too. New singles land everywhere at the same time, so follow on whichever platform you use daily.",
  "Start here: a listener's roadmap.",
  "Not sure where to begin? Start with the latest singles — the newest releases represent the current sound — then work backward. Watch the official music videos next; the visuals add a whole layer to the records. Then dig into the high-energy anthems, the core of the catalog, and finally the deeper cuts, where you'll hear the progression in the writing and production.",
  "Playlists worth building.",
  "TMACK48 records are playlist music by design. For workouts, stack the anthems back to back — the aggressive tempos and motivational bars were made for the gym. For late-night drives, the harder records carry perfectly on the highway. For pre-game lock-in, start here when you need to get your head right. And keep a new-music rotation updated with every single.",
  "Stay current.",
  "Follow the artist profile on your streaming platform of choice, subscribe to the 3000 Studios YouTube channel with notifications on, follow TMACK48 on socials for drop announcements and teaser clips, and check the news section on this site — every release gets covered here with links.",
  "Support the music directly.",
  "Streaming is the foundation, but it doesn't stop there. Share the records with people who'd feel them. Add the singles to your public playlists — that's one of the biggest ways independent artists get discovered. Drop a comment on the YouTube videos. Every bit of engagement feeds the algorithm and keeps the releases coming. The catalog keeps growing. Stay locked in.",
  ],
},

{
  title: "How TMACK48 Releases Work: From Studio to Streaming",
  excerpt:
  "The rollout pattern for new music — where announcements land, how release day works, and how to never miss one.",
  publishedAt: "2026-09-27",
  category: "Announcement",
  readMinutes: 3,
  body: [
  "New music follows a pattern, and once you know it, you will never miss a drop. Here is how releases from this camp typically roll out — and how to set yourself up so every single finds you on day one.",
  "The rollout pattern.",
  "It usually starts with teaser clips on socials: short snippets, often the hook, with no context. Then comes the announcement post with the title, artwork, and release date. On release day, the single goes live on all streaming platforms at the same time. The official video premieres on the 3000 Studios YouTube channel, either the same day or within the week. And the news section on this site gets the full write-up with links.",
  "Why the first 48 hours matter.",
  "New releases get their biggest push in the first two days. Streams, shares, playlist adds, and comments in that window carry extra weight with the algorithms — for an independent artist, that early surge is the difference between a single that travels and one that stalls. If you want to support a drop, the highest-leverage thing you can do is show up early.",
  "How to never miss a drop.",
  "The gap between teaser and release is usually short, so get set up now: follow TMACK48 on socials with notifications on, follow the artist profile on Spotify and Apple Music so new singles hit your Release Radar, and subscribe to the 3000 Studios YouTube channel. Check the news section here too — every release gets covered with links. Stay locked in.",
  ],
},
{
  title: "TMACK48 FAQ: Writing, Sound, and the Independent Grind",
  excerpt:
  "Straight answers to the questions fans ask most — about the writing, the sound, and building as an independent artist.",
  publishedAt: "2026-09-27",
  category: "For the fans",
  readMinutes: 3,
  body: [
  "These are the questions that come up again and again from fans and from aspiring artists. Here are straight answers — no invented interviews, just what the music and the process already tell you.",
  "On the writing.",
  "How long does a song take to write? It depends on the record. Some hooks arrive fast — you hear the beat and the melody is already there. Verses take longer, because every bar has to earn its spot. The philosophy is simple: say what you came to say and get out. Nobody skips a record that never wastes their time.",
  "On the sound.",
  "Why the heavy low end? Because that is where this music lives. A lot of fans hear these records in their cars first — big systems, real volume — so the mixes are built to hit there. The sound sits in the Southern rap tradition: aggressive drums, direct writing, hooks built to be shouted back. The biggest influence, though, is just life — work, setbacks, pressure, and refusing to fold.",
  "On the independent grind.",
  "What would TMACK48 tell an artist starting out? Record constantly — your first hundred songs are practice, so treat them that way. Learn how a mix actually works instead of guessing. And build your own audience instead of waiting for somebody to hand you one. Nobody is coming to save you, so save yourself.",
  "On what's next.",
  "The focus is the catalog: keep building the body of work, keep the visuals coming — every single gets the visual treatment, because the videos are half the art. Live shows are the goal down the road, built on top of a catalog strong enough to carry a stage. When that happens, you'll hear about it here first. Until then: press play on the newest single, work backward, and if the music moves you, share it. That is how independent artists eat — one fan telling another fan.",
  ],
},
];

export const posts: Post[] = RAW.map((p) => ({ ...p, slug: slugify(p.title) })).sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
