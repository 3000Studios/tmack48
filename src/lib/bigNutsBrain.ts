/**
 * The Mr Big Nuts catalog brain — deterministic, offline, $0.
 *
 * Answers questions about the TaylorMade Hits catalog from REAL data:
 * the site catalog (src/data/videos.ts) joined with the YouTube facts
 * library (src/data/songFacts.ts: real durations, publish dates and
 * descriptions fetched from the YouTube Data API). Nothing is invented:
 * a song's "about" is its own site blurb or its own YouTube description.
 *
 * CONVERSATION LAYER (2026-11-08): this file is the CATALOG engine.
 * The conversation engine lives in ./conversation.ts (thread memory,
 * pronoun/context carry, trash-talk-back with a beef meter, engaged
 * fallbacks) and is built entirely on the exports below — catalog logic
 * is NOT duplicated there.
 *
 * - answerDirect(raw, topicWords?) is the stateless direct engine: the
 *   exact historical answerQuestion behavior for direct questions.
 * - answerQuestion(raw) keeps its original signature, but delegates to
 *   converse() over a module-level DEFAULT SESSION (persona "public"),
 *   so both shipped bot components — which call answerQuestion today —
 *   get memory, context carry and trash-talk-back with zero component
 *   changes. The default session is created lazily on first call (the
 *   brain <-> conversation import is a deliberate, call-time-only cycle:
 *   neither module touches the other while it is still evaluating).
 * - Components SHOULD migrate to converse() with their own ConvoState
 *   (see the integration snippet in conversation.ts) so each chat panel
 *   owns an isolated thread instead of sharing the default session.
 */
import { videos, type Video } from "@/data/videos";
import { SONG_FACTS } from "@/data/songFacts";
import { converse, createConvo, type ConvoState } from "./conversation";

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

export function normalize(text: string): string {
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

export function queryTokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Words that must never be echoed back at the user (profanity + insult
 * vocabulary). Used to sanitize the salient words the engaged fallback
 * quotes back and the rolling topic words in conversation.ts.
 */
const ECHO_BLOCKLIST = new Set([
  "fuck", "fucking", "fuckin", "shit", "shitty", "bitch", "bitches", "damn",
  "ass", "piss", "crap", "suck", "sucks", "sucked", "sucking", "trash",
  "garbage", "stupid", "dumb", "lame", "loser", "losers", "hate", "hates",
  "weak", "pathetic", "terrible", "awful", "boring", "useless", "stinks",
]);

/** The user's own salient words, sanitized for safe echo: max ~5, no profanity. */
export function echoWords(raw: string, max = 5): string[] {
  return queryTokens(raw)
    .filter((w) => !ECHO_BLOCKLIST.has(w))
    .slice(0, max);
}

/** Score a video against free-text tokens: title hits weigh most. */
export function scoreVideo(video: Video, tokens: string[]): number {
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

export function songById(id: string | null | undefined): Video | null {
  if (!id) return null;
  return videos.find((v) => v.id === id) ?? null;
}

export function newestSong(): Video | null {
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

/**
 * The engaged fallback — the ONLY way the brain says "I don't know".
 * It always references the user's own input (sanitized salient words,
 * never profanity), admits honestly in character that the catalog has
 * no match for THAT, and redirects with a concrete offer: the top
 * vibe-scored song for those words, or the newest drop. topicWords are
 * the conversation's rolling context tokens (empty for stateless use).
 */
export function engagedFallbackAnswer(raw: string, topicWords: string[] = []): SongAnswer {
  const words = echoWords(raw);
  const heard = words.length ? `"${words.join(" ")}"` : "that one";
  const tokens = [...new Set([...queryTokens(raw), ...topicWords])];
  let best: Video | null = null;
  let bestScore = 0;
  for (const v of fullSongs) {
    const s = scoreVideo(v, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  const offer = best && bestScore > 0 ? best : newestSong();
  if (offer) {
    const name = cleanTitle(offer.title);
    return {
      text:
        best && bestScore > 0
          ? `I hear you on ${heard} — no exact match for that on the shelf, so here's the closest heat I got: "${name}" (${songFactsLine(offer)}). It's queued up below.`
          : `I hear you on ${heard} — that's not in the TaylorMade Hits catalog, and I know this catalog cold. Closest I can do is the freshest drop: "${name}" (${songFactsLine(offer)}). It's queued up below.`,
      play: offer,
    };
  }
  return {
    text: `I hear you on ${heard} — that's not in the TaylorMade Hits catalog. Give me a title, or a vibe like anthem, street or classic, and I'll pull one up.`,
  };
}

/**
 * The stateless direct engine: one raw question in, one SongAnswer out,
 * no memory. This is the historical answerQuestion behavior for direct
 * questions — same catalog answers for the same direct questions. Its
 * two old canned deflections are replaced by engagedFallbackAnswer.
 * Prefer answerQuestion (session-aware) or converse() (explicit state).
 */
export function answerDirect(raw: string, topicWords: string[] = []): SongAnswer {
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
    return engagedFallbackAnswer(text, topicWords);
  }

  // Vibe fallback: score by tags/category words and recommend. The
  // conversation's rolling topic words ride along so a vibe named
  // earlier in the thread still steers the pick.
  const tokens = [...new Set([...queryTokens(text), ...topicWords])];
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

  return engagedFallbackAnswer(text, topicWords);
}

/**
 * The module-level DEFAULT SESSION. Both shipped bot components call
 * answerQuestion(raw) with no state, so the brain keeps one shared
 * public-persona session here and delegates to converse() — the site
 * is conversational (memory, context carry, trash-talk-back) the
 * moment this ships, before the components migrate to per-panel state.
 * Created lazily: see the header note on the call-time-only cycle.
 */
let defaultSession: ConvoState | null = null;

/**
 * Session-aware entry point — original signature, original answers for
 * direct questions, now with a memory. New code should call converse()
 * from ./conversation.ts with its own ConvoState instead.
 */
export function answerQuestion(raw: string): SongAnswer {
  if (!defaultSession) defaultSession = createConvo();
  const result = converse(defaultSession, raw, "public");
  defaultSession = result.state;
  return result.answer;
}

function video2line(video: Video): string {
  return video.category === "short"
    ? "It's a Short — quick hit, full flavor."
    : "Hit play right here in the chat — no leaving the page.";
}
