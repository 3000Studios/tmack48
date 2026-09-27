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
  title: "New Official Music Video Premiere on YouTube",
  excerpt:
  "The latest official music video is live — what to expect, how it was made, and where to watch and stream.",
  publishedAt: "2026-09-27",
  category: "Release",
  readMinutes: 3,
  body: [
  "The wait is over. TMACK48 just dropped the official music video for his latest single, and it's live now on the 3000 Studios YouTube channel. This one has been in the works for weeks — late nights in the studio, a full shoot day, and an edit pass that went through multiple versions before it was ready to ship.",
  "The video matches the energy of the record: bold lighting, fast cuts, and performance shots that put the artist front and center. From the first frame, it's clear this wasn't thrown together — every scene was built around the song's hook, and the pacing of the edit locks in with the drums.",
  "What to expect.",
  "Fans who've been following the rollout already know the single. The video takes it further. Without spoiling the concept, the visual leans into the themes TMACK48 is known for — discipline, pressure, and coming out the other side sharper. There are scenes shot on location and studio performance sequences, cut together so the song never loses momentum.",
  "If you've been waiting for a video that plays as hard as the track, this is the one.",
  "The making of the video.",
  "Getting this video made was a process in itself. The concept went through several revisions before the shoot — the team wanted something that served the song instead of distracting from it. Shoot day was long: multiple setups, location moves, and performance takes until the energy was right on camera. Then came the edit, where the first cut got reworked more than once. Pacing was the obsession — every cut had to land with the drums, and anything that slowed the record down hit the cutting-room floor.",
  "The result is a video that moves the way the song moves. It doesn't waste time, it doesn't over-explain, and it rewards repeat watches — there's detail in the background of several shots that you'll only catch the second or third time through.",
  "Where to watch and stream.",
  "YouTube: Watch the official video now on the 3000 Studios channel. Like, comment, and subscribe so you don't miss the next drop. Spotify and Apple Music: The single is streaming on all major platforms. Add it to your rotation and your workout playlists. Socials: Follow TMACK48 for the behind-the-scenes cut from the shoot, plus clips from the editing room.",
  "What's next.",
  "This premiere is the first of several releases lined up. The studio sessions haven't stopped, and there's more music — and more video — already in the pipeline. Stay locked in: the next announcement is coming sooner than you think.",
  "Watch the video, run the single up, and share it with somebody who needs new music in their life.",
  ],
},

{
  title: "Inside the Studio: How a TMACK48 Session Actually Works",
  excerpt:
  "From beat selection to the car test: a walkthrough of how a TMACK48 record gets made.",
  publishedAt: "2026-09-27",
  category: "Behind the scenes",
  readMinutes: 3,
  body: [
  "Most fans only hear the finished record. They don't hear the forty takes, the scrapped verses, or the 2 AM arguments about whether a hook needs one more stack. This is what a TMACK48 session actually looks like — from the first idea to the final mix.",
  "It starts with the beat.",
  "Every session starts with sound selection. TMACK48 doesn't write to just anything — the beat has to move before a single word gets written. Producers in the 3000 Studios camp send over batches of instrumentals, and the rule is simple: if it doesn't make the room react in the first fifteen seconds, it's out. What survives gets loaded up, looped, and lived with for a while before recording starts.",
  "Writing under pressure.",
  "The writing process is fast and physical. TMACK48 writes standing up, pacing, testing lines out loud against the beat in real time. Verses get punched in section by section rather than written out on paper first — the idea is to capture the energy of the moment instead of reading something flat off a page. If a bar doesn't hit with the right force on the first few takes, it gets rewritten on the spot, not patched later.",
  "Hooks get the most attention. A TMACK48 hook might go through a dozen versions — different melodies, different cadences, different stacks — before the final one is chosen. The test is always the same: can a crowd chant it back after hearing it once? If yes, it stays. If no, it's back to the drawing board.",
  "The recording grind.",
  "Tracking is where the perfectionism shows. Vocals are recorded in full takes and in punches, then comped together line by line. Ad-libs get their own pass — they're not an afterthought but a planned layer, written and performed with the same intent as the lead vocal. Doubles and harmonies are stacked to give the record its size, especially on the hook.",
  "Nothing gets rushed, but nothing gets overthought either. There's a window where a performance is at its best — usually within the first handful of takes — and the session moves fast enough to stay inside it.",
  "Mixing and the car test.",
  "Once tracking is done, the mix session begins: drums up front, vocals sitting on top, low end tuned for real-world speakers. And then comes the part fans never see — the car test. The mix gets bounced and played through an actual vehicle sound system, because that's where this music lives. If the kick doesn't hit right in the car, the mix goes back for another pass. No exceptions.",
  "Why it matters.",
  "This process is why TMACK48 records sound the way they do. Every layer of effort — the beat selection, the rewrites, the stacks, the car test — is there to make sure the final product hits exactly as intended. The next time a new single drops, you'll know what went into it.",
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
  title: "New TMACK48 Release on the Way: What We Know So Far",
  excerpt:
  "A new single is in motion — what is confirmed, the sound direction, and how the rollout works.",
  publishedAt: "2026-09-27",
  category: "Announcement",
  readMinutes: 3,
  body: [
  "Something new is coming. TMACK48 has confirmed that the next release is officially in motion — studio time is booked, the record is tracked, and the rollout plan is taking shape. Here's everything we can tell you right now.",
  "What's confirmed.",
  "The new single is recorded. Multiple studio sessions went into it, and the final mix is being dialed in now — including the mandatory car test, because no TMACK48 record ships until it passes that. The cover art is in production, and the video treatment is written. If the pattern of recent releases holds, the visual will drop right alongside the audio. What we can't tell you yet: the title, the exact drop date, and whether there's a video premiere event attached. Those details get announced when they're locked, not before.",
  "The sound direction.",
  "Based on the sessions so far, expect the new record to sit firmly in TMACK48's lane — hard drums, a hook built to be shouted back, and writing that stays on the themes the fans come for: discipline, pressure, and forward motion. The production team has been pushing the low end even further on this one, so plan accordingly if your speakers can handle it.",
  "How the rollout works.",
  "Here's the usual sequence, so you know what to watch for. First, teaser clips hit socials — short snippets, usually the hook, no context. Then the announcement post follows with the title, artwork, and release date. On release day the single goes live on all streaming platforms at once. The official video premieres on the 3000 Studios YouTube channel, either same-day or within the week. And the news section on this site gets the full write-up with links.",
  "Don't miss it.",
  "The gap between the teaser and the drop is usually short, so get set up now: follow TMACK48 on all socials with notifications on, follow the artist profile on Spotify and Apple Music, and subscribe to the 3000 Studios YouTube channel. New releases get their biggest push in the first 48 hours — streams, shares, playlist adds, and comments all count double in that window. Stay tuned. The announcement is coming.",
  ],
},

{
  title: "TMACK48 Fan Q&A: The Questions You Asked, Answered",
  excerpt:
  "Writing process, song length, car-audio mixing, influences, and advice for new artists.",
  publishedAt: "2026-09-27",
  category: "For the fans",
  readMinutes: 3,
  body: [
  "The fans sent in questions, and TMACK48 answered. Here are the highlights from the latest Q&A session — covering the music, the process, and what's coming next.",
  "On the writing process.",
  "Q: How long does it take you to write a song? A: Depends on the record. Some hooks come in twenty minutes — you hear the beat, the melody's already there, and it writes itself. Verses take longer because every bar has to earn its spot. I'd rather spend three days on sixteen bars than rush something weak out the door. Q: Do you write everything yourself? A: Every word. The beats come from producers I trust, but the writing is all me. If my name's on it, I wrote it. That's non-negotiable.",
  "On the sound.",
  "Q: Why are your songs so short? A: Because they don't need to be longer. Say what you came to say and get out. Nobody's skipping a record that never wastes their time. Q: What's with the car-audio obsession? A: That's just where the music lives. A lot of fans hear these records in their cars first — big systems, real volume. So the mixes get tested there. If it doesn't hit in the car, it doesn't ship. Simple as that.",
  "On influences and the come-up.",
  "Q: Who influenced your style? A: Southern rap, first and foremost — the energy, the drums, the directness. But honestly, the biggest influence is just life. Work, setbacks, watching people fold when things get hard. The music is about not being one of those people. Q: What would you tell an artist just starting out? A: Record constantly. Your first hundred songs are practice — treat them that way and don't get precious about any of them. Learn how a mix actually works instead of guessing. And build your own audience instead of waiting for somebody to hand you one. Nobody's coming to save you, so save yourself.",
  "On what's next.",
  "Q: When's the new music dropping? A: Soon. There's always something in the pipeline — that's how the camp works. Follow the socials and keep your notifications on, because the announcements come fast and the window between teaser and drop is short. Q: Will there be more music videos? A: Every single gets the visual treatment. The videos are half the art — they take time, but they're worth it. The next one is already in the works. Q: Any live shows coming? A: That's the goal. Right now the focus is the catalog — building the body of work first, then taking it on stage the right way. When shows happen, you'll hear about it here first.",
  "One more thing.",
  "Q: What's the one thing you want new listeners to know? A: Press play on the newest single first, then work backward. And if the music moves you, share it. That's how independent artists eat — one fan telling another fan. I appreciate every single one of you.",
  ],
},
];

export const posts: Post[] = RAW.map((p) => ({ ...p, slug: slugify(p.title) })).sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
