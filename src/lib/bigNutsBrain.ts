/**
 * The Mr Big Nuts catalog brain — deterministic, offline, $0.
 *
 * Answers questions about the TaylorMade Hits catalog from REAL data:
 * the site catalog (src/data/videos.ts) joined with the YouTube facts
 * library (src/data/songFacts.ts: real durations, publish dates and
 * descriptions fetched from the YouTube Data API). Nothing is invented:
 * a song's "about" is its own site blurb or its own YouTube description.
 */
import { videos, type Video } from "@/data/videos";
import { SONG_FACTS } from "@/data/songFacts";

export interface SongAnswer {
  text: string;
  /** When set, the chat renders this video's player under the reply. */
  play?: Video;
}

export const fullSongs: Video[] = videos.filter((v) => v.category !== "short");
export const shorts: Video[] = videos.filter((v) => v.category === "short");

export function formatDuration(totalSec: number | null | undefined): string | null {
  if (!totalSec || totalSec <= 0) return null;
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function factFor(video: Video) {
  return SONG_FACTS[video.videoId];
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\s*[|•]\s*@[\w.-]+/gi, " ")
    .replace(/\s*\(\s*official[^)]*\)\s*/gi, " ")
    .replace(/\s*official\s*(music\s*)?video\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "the", "a", "an", "song", "songs", "track", "tracks", "video", "play", "put", "on",
  "pull", "up", "show", "me", "find", "get", "that", "this", "what", "whats", "is",
  "it", "about", "how", "long", "when", "did", "does", "do", "can", "you", "please",
  "mr", "big", "nuts", "nutts", "hey", "tell", "give", "want", "hear", "listen", "to",
  "of", "for", "my", "i", "im", "let", "lets", "some", "any", "one", "out", "come",
  "came", "released", "release", "date", "duration", "runtime", "run", "time",
]);

function queryTokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Score a video against free-text tokens: title hits weigh most. */
function scoreVideo(video: Video, tokens: string[]): number {
  const title = normalize(cleanTitle(video.title));
  const titleWords = new Set(title.split(" "));
  const haystack = normalize(
    [video.title, video.category, ...(video.tags ?? []), video.blurb ?? ""].join(" ")
  );
  let score = 0;
  for (const t of tokens) {
    if (titleWords.has(t)) score += 3;
    else if (title.includes(t)) score += 2;
    else if (haystack.includes(t)) score += 1;
  }
  return score;
}

export function findSong(text: string, pool: Video[] = videos): Video | null {
  const tokens = queryTokens(text);
  if (!tokens.length) return null;
  // Exact-ish phrase hit on the cleaned title wins outright.
  const phrase = tokens.join(" ");
  const phraseHit = pool.find((v) => normalize(cleanTitle(v.title)).includes(phrase));
  if (phraseHit) return phraseHit;
  let best: Video | null = null;
  let bestScore = 0;
  for (const v of pool) {
    const s = scoreVideo(v, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  // Require a real signal: at least one title-word hit.
  return bestScore >= 3 ? best : null;
}

export function songAbout(video: Video): string {
  const name = cleanTitle(video.title);
  if (video.blurb) return `"${name}" — ${video.blurb}`;
  const desc = factFor(video)?.description;
  if (desc) return `"${name}" — straight from its YouTube description: ${desc}`;
  const tags = (video.tags ?? []).filter((t) => t !== "taylormade-hits").slice(0, 3).join(", ");
  return `"${name}" is one of TMACK48's ${video.category} cuts${tags ? ` — filed under ${tags}` : ""}. No written description is posted for this one yet, so the honest move is to let the track talk.`;
}

export function songFactsLine(video: Video): string {
  const fact = factFor(video);
  const parts: string[] = [];
  const dur = formatDuration(fact?.durationSec);
  if (dur) parts.push(`runs ${dur}`);
  if (fact?.publishedAt) {
    const d = new Date(`${fact.publishedAt}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      parts.push(
        `dropped ${d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      );
    }
  }
  parts.push(video.category === "short" ? "it's a Short" : `it's a ${video.category} release`);
  return parts.join(" · ");
}

function newestSong(): Video | null {
  let best: Video | null = null;
  let bestDate = "";
  for (const v of fullSongs) {
    const d = factFor(v)?.publishedAt ?? "";
    if (d > bestDate) {
      bestDate = d;
      best = v;
    }
  }
  return best;
}

function longestSong(): Video | null {
  let best: Video | null = null;
  let bestDur = 0;
  for (const v of fullSongs) {
    const d = factFor(v)?.durationSec ?? 0;
    if (d > bestDur) {
      bestDur = d;
      best = v;
    }
  }
  return best;
}

const CLEAN_JOKES = [
  "Why did the squirrel cross the road? To prove he had the nuts to do it.",
  "TMACK48 walked into the studio and the microphone applied for hazard pay.",
  "Why don't acorns ever get lost? They always follow the nut map.",
  "My playlist is like my wallet — full of TaylorMade Hits and nothing I regret.",
  "Why did the song go to the doctor? It had too many sick beats.",
];

export function answerQuestion(raw: string): SongAnswer {
  const text = raw.trim();
  const lower = normalize(text);

  if (!text) return { text: "Say the word — a song title, a vibe, or a question." };

  if (/^(hi|hello|hey|yo|sup|whats up|what up)\b/.test(lower)) {
    return {
      text: "What's up! I'm Mr Big Nuts, the TaylorMade Hits guide. Ask me to play any song, ask what a song is about or how long it runs, or just name a vibe and I'll pick one.",
    };
  }

  if (/\b(how many|count|total)\b/.test(lower)) {
    if (/short/.test(lower)) return { text: `There are ${shorts.length} Shorts in the catalog.` };
    if (/song|track/.test(lower))
      return {
        text: `TMACK48 has ${fullSongs.length} full songs in the catalog, plus ${shorts.length} Shorts — ${videos.length} videos total on the channel shelf here.`,
      };
    return {
      text: `The catalog holds ${videos.length} videos: ${fullSongs.length} full songs and ${shorts.length} Shorts.`,
    };
  }

  if (/\b(newest|latest|most recent)\b/.test(lower)) {
    const v = newestSong();
    if (v)
      return {
        text: `Freshest drop is "${cleanTitle(v.title)}" — ${songFactsLine(v)}. Want it playing?`,
        play: v,
      };
  }

  if (/\b(longest|most minutes)\b/.test(lower)) {
    const v = longestSong();
    if (v)
      return {
        text: `The longest full song is "${cleanTitle(v.title)}" — ${songFactsLine(v)}.`,
        play: v,
      };
  }

  if (/\bjoke\b/.test(lower)) {
    return { text: CLEAN_JOKES[Math.floor(Math.random() * CLEAN_JOKES.length)] };
  }

  if (/\b(who are you|your name|about you)\b/.test(lower)) {
    return {
      text: "I'm Mr Big Nuts — the acorn with the answers. I know every song in the TaylorMade Hits catalog: what it's about, how long it runs, and when it dropped. I can pull any of them up and play it right here.",
    };
  }

  if (/\b(who is tmack|who is taylor|about tmack|the artist)\b/.test(lower)) {
    return {
      text: "TMACK48 is TaylorMade Hits — independent artist, 1,000+ subscribers strong on YouTube, dropping singles, anthems and Shorts. This site is his official home base.",
    };
  }

  const wantsPlay = /\b(play|pull up|put on|show|watch|hear|listen|queue|start)\b/.test(lower);
  const wantsAbout = /\babout\b/.test(lower) || /\bmeaning\b/.test(lower) || /\bstory\b/.test(lower);
  const wantsLength = /\bhow long\b/.test(lower) || /\bduration\b/.test(lower) || /\bruntime\b/.test(lower);
  const wantsWhen = /\bwhen\b/.test(lower) && /\b(release|drop|come out|came out|posted|upload)\b/.test(lower);

  const song = findSong(text);
  if (song) {
    const name = cleanTitle(song.title);
    if (wantsLength) {
      const dur = formatDuration(factFor(song)?.durationSec);
      return {
        text: dur
          ? `"${name}" runs ${dur} (${songFactsLine(song)}).`
          : `I don't have a runtime on file for "${name}" yet.`,
        play: wantsPlay ? song : undefined,
      };
    }
    if (wantsWhen) {
      return { text: `"${name}" — ${songFactsLine(song)}.`, play: wantsPlay ? song : undefined };
    }
    if (wantsAbout && !wantsPlay) {
      return { text: `${songAbout(song)} (${songFactsLine(song)}.) Say "play it" and I'll pull it up.` };
    }
    // Default: pull it up and play it.
    return {
      text: `Pulling up "${name}" — ${songFactsLine(song)}. ${video2line(song)}`,
      play: song,
    };
  }

  if (/\b(random|surprise|shuffle|anything)\b/.test(lower)) {
    const v = fullSongs[Math.floor(Math.random() * fullSongs.length)];
    return { text: `Dealer's choice: "${cleanTitle(v.title)}" — ${songFactsLine(v)}.`, play: v };
  }

  if (wantsAbout || wantsLength || wantsWhen || wantsPlay) {
    return {
      text: "I couldn't match that to a song in the catalog. Give me a title — or a word from one — and I'll pull it up, tell you what it's about, or how long it runs.",
    };
  }

  // Vibe fallback: score by tags/category words and recommend.
  const tokens = queryTokens(text);
  let best: Video | null = null;
  let bestScore = 0;
  for (const v of fullSongs) {
    const s = scoreVideo(v, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  if (best && bestScore > 0) {
    return {
      text: `For that vibe I'm reaching for "${cleanTitle(best.title)}" — ${songFactsLine(best)}.`,
      play: best,
    };
  }

  return {
    text: `I know all ${fullSongs.length} songs and ${shorts.length} Shorts in this catalog cold. Try "play Save Me Wonder Woman", "what is Nobody To Save about", or "how long is it" about any title — or name a vibe like anthem, street or classic.`,
  };
}

function video2line(video: Video): string {
  return video.category === "short"
    ? "It's a Short — quick hit, full flavor."
    : "Hit play right here in the chat — no leaving the page.";
}
