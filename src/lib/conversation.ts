/**
 * The Mr Big Nuts CONVERSATION engine — deterministic, offline, $0.
 *
 * bigNutsBrain.ts knows the catalog; this file knows how to TALK:
 * thread memory, pronoun/context carry ("play it", "how long is it",
 * "another one"), trash-talk-back with a beef meter, and fallbacks
 * that engage with what the user actually said. Pure functions over an
 * explicit ConvoState — no framework, no storage, no LLM, no network.
 * All catalog facts come from bigNutsBrain exports; nothing about the
 * catalog is duplicated here.
 *
 * PURITY: converse() does NOT mutate its input state. It returns a NEW
 * ConvoState; the caller stores it (see the snippet below).
 *
 * ---------------------------------------------------------------------
 * COMPONENT INTEGRATION (parent: paste into BOTH bot components —
 * src/components/home/MrBigNuttsBot.tsx and src/components/ui/MrBigNutsWidget.tsx)
 * ---------------------------------------------------------------------
 *   import { converse, createConvo, type ConvoState } from "@/lib/conversation";
 *   const convoRef = useRef<ConvoState>(createConvo());
 *   const { state, answer } = converse(convoRef.current, text, "public"); // widget: "admin"
 *   convoRef.current = state;
 *   // then render answer.text / answer.play exactly as today
 *     (the widget keeps appending `answer.play.watchUrl` itself).
 *
 * Until that lands, answerQuestion() in bigNutsBrain.ts already routes
 * through converse() over a shared default session, so the shipped
 * site is conversational either way — the per-component state above
 * just gives each panel its own isolated thread.
 * ---------------------------------------------------------------------
 */
import {
  answerDirect,
  cleanTitle,
  echoWords,
  findSong,
  fullSongs,
  newestSong,
  normalize,
  queryTokens,
  scoreVideo,
  shorts,
  songById,
  type SongAnswer,
} from "./bigNutsBrain";
import type { Video } from "@/data/videos";

export interface ConvoTurn {
  role: "user" | "bot";
  text: string;
}

export interface ConvoState {
  /** Last 12 turns, oldest first. */
  turns: ConvoTurn[];
  /** The song in focus: last played, answered-about, or offered. */
  lastSongId: string | null;
  /** Coarse intent of the last exchange ("play", "trash", …). */
  lastIntent: string | null;
  /** Trash-talk heat: 0 calm … 3 mic-drop. Resets on friendly/catalog turns. */
  beef: number;
  /** Rolling salient tokens from recent user turns (max 8, newest first). */
  topicWords: string[];
  greeted: boolean;
}

export function createConvo(): ConvoState {
  return {
    turns: [],
    lastSongId: null,
    lastIntent: null,
    beef: 0,
    topicWords: [],
    greeted: false,
  };
}

type Persona = "public" | "admin";

/* ------------------------------------------------------------------ */
/* Small deterministic picker — pools rotate by conversation position  */
/* so replies vary across a thread yet stay reproducible in tests.    */
/* ------------------------------------------------------------------ */
function pick<T>(pool: readonly T[], seed: number): T {
  return pool[Math.abs(seed) % pool.length];
}

/* ------------------------------------------------------------------ */
/* Trash detection — conservative on purpose. Runs on normalized text  */
/* (lowercase, punctuation stripped, apostrophes gone: "youre").      */
/* Catalog intent is checked BEFORE this and wins every tie: "play    */
/* that fucking song X" is a play request, not a diss.                 */
/* ------------------------------------------------------------------ */
const TRASH_PATTERNS: RegExp[] = [
  /\byou suck\b/,
  /\bu suck\b/,
  /\byoure (trash|garbage|dumb|stupid|lame|weak|terrible|awful|boring|pathetic|useless|a loser)\b/,
  /\byou are (trash|garbage|dumb|stupid|lame|weak|terrible|awful|boring|pathetic|useless)\b/,
  /\byou aint\b/,
  /\byour (music|songs|song|voice|site) (sucks|is trash|is garbage|is terrible|is awful|is lame)\b/,
  /\bthis (sucks|is trash|is garbage|stinks)\b/,
  /\bthat (sucks|is trash|is garbage)\b/,
  /\b(music|song|songs|track) sucks\b/,
  /\btrash music\b/,
  /\bgarbage music\b/,
  /\bworst (music|song|songs|artist|rapper|singer)\b/,
  /\bshut up\b/,
  /\blosers?\b/,
  /\b(tmack|tmack48|taylor|taylormade) (sucks|is trash|is garbage|cant sing|cant rap|cannot sing|cant perform)\b/,
  /\bfuck (you|u|off)\b/,
  /\bscrew you\b/,
  /\bpiss off\b/,
  /\bi hate you\b/,
  /\bhate your (music|songs|voice)\b/,
];

function isTrash(lower: string): boolean {
  if (TRASH_PATTERNS.some((re) => re.test(lower))) return true;
  // "bitch" counts only when it reads as aimed at the bot: a short
  // bark or paired with "you". Longer sentences fall through.
  if (/\bbitch\b/.test(lower) && (lower.split(" ").length <= 5 || /\byou\b/.test(lower))) {
    return true;
  }
  return false;
}

/**
 * Is this unmistakably a catalog ask? If so, trash patterns inside it
 * are just seasoning and the catalog answers. Mirrors the intent
 * branches of answerDirect — routing only, no catalog data.
 */
function isClearCatalogAsk(raw: string, lower: string): boolean {
  if (findSong(raw)) return true;
  if (
    /\b(how many|count|total|newest|latest|most recent|longest|most minutes|joke|who are you|your name|who is tmack|who is taylor|about tmack|the artist)\b/.test(
      lower
    )
  ) {
    return true;
  }
  // A play request carrying any real word rides as a catalog ask.
  if (/\b(play|pull up|put on|queue|start)\b/.test(lower) && queryTokens(raw).length > 0) {
    return true;
  }
  return false;
}

const FRIENDLY =
  /\b(thanks|thank you|thx|thank u|appreciate|lol|haha|lmao|my bad|sorry|apologies|just kidding|nice one|good one|love it|awesome|cool)\b/;

const GREETING_START = /^(hi|hello|hey|yo|sup|whats up|what up|good morning|good afternoon|good evening)\b/;
const PURE_GREETING =
  /^(hi|hello|hey|yo|sup|whats up|what up|good morning|good afternoon|good evening)( mr big nuts| big nuts| nuts| there| yall)?$/;
const THANKS = /\b(thanks|thank you|thx|thank u|appreciate it|good looking out|preciate it)\b/;
const APOLOGY = /\b(my bad|sorry|apologies|just kidding|jk)\b/;
const FAREWELL =
  /^(bye+|goodbye|good ?night|see (you|ya)( later)?|later|peace( out)?|im out|i am out|gotta go|gtg)\b/;
const LOL_ONLY = /^(lol|haha|ha|lmao|rofl)( (lol|haha|ha|lmao|rofl))*$/;
const AFFIRMATIVE =
  /^(yes|yeah|yep|yup|sure|ok|okay|alright|do it|yeah do it|yes please|please do|go ahead|go for it|lets go|let s go|sounds good|bet)$/;

/* ------------------------------------------------------------------ */
/* Comeback pools. Public: smooth Big Nuts swagger, profanity-light    */
/* (hell/damn max — the site is public and AdSense-aware). Admin:      */
/* spicier, persona-neutral — the widget layers its own hillbilly /    */
/* pirate / lady intros on top, these lines just shouldn't clash.      */
/* Guardrails, both personas: no slurs, nothing aimed at protected     */
/* classes, no threats — it's all about the music, the taste, the game.*/
/* ------------------------------------------------------------------ */
function flexSong(): Video | null {
  return fullSongs.find((v) => v.featured) ?? newestSong() ?? fullSongs[0] ?? null;
}

const PUBLIC_COMEBACKS: Record<1 | 2 | 3, (flex: Video | null) => string[]> = {
  1: () => [
    "Whoa, coming in hot! I respect the energy — but this catalog's got receipts. Name a vibe and watch me work.",
    "Ha! Big talk from the cheap seats. Pick any track and let the music do the arguing for me.",
    "You woke up and chose violence, huh? Cute. I'm still the smoothest acorn on this site — try a song before you judge the tree.",
  ],
  2: (flex) => [
    `Alright, gloves off a little. You keep typing, TMACK keeps charting — "${flex ? cleanTitle(flex.title) : "the catalog"}" didn't climb by accident. Ears first, opinions after.`,
    `Second round? Bold. The catalog is ${fullSongs.length} songs deep and undefeated — you diss like you're skipping the intros. Let a full track play, then we'll talk.`,
    `You're arguing with an acorn and losing on style points. "${flex ? cleanTitle(flex.title) : "The hits"}" — that's the level we're on over here.`,
  ],
  3: (flex) => [
    `That's three strikes, superstar — mic drop time. Here's "${flex ? cleanTitle(flex.title) : "the crown jewel"}" doing what your review couldn't. We can talk again after the chorus.`,
    `Victory lap. You brought words, I brought the whole TaylorMade Hits catalog. "${flex ? cleanTitle(flex.title) : "This one"}" plays you out — enjoy the show.`,
  ],
};

const ADMIN_COMEBACKS: Record<1 | 2 | 3, (flex: Video | null) => string[]> = {
  1: () => [
    "Well damn, somebody woke up on the wrong side of the bed. Noted — and ignored, mostly. Pick a song, let's see if your taste is better than your manners.",
    "Oh, spicy! I like it. Still wrong, but spicy. The catalog's right there when you're ready to lose this argument to a chorus.",
    "Hell of an opener. I've been insulted by professionals, sweetheart — you're gonna have to bring more than that.",
  ],
  2: (flex) => [
    `Round two and you're still swinging at air. "${flex ? cleanTitle(flex.title) : "The catalog"}" has more game than your whole insult drawer. Ears first.`,
    `You talk like a one-star review with a keyboard. This shelf is ${fullSongs.length} songs deep — quantity AND quality, which is two more things than your take has.`,
    `Keep going, I'm taking notes for the comedy album. Meanwhile the music you hate is out here doing numbers. Funny how that works.`,
  ],
  3: (flex) => [
    `THREE. That's a whole trilogy of wrong. Mic drop: "${flex ? cleanTitle(flex.title) : "the crown jewel"}" — let it play you out, champ.`,
    `Victory lap, and I'm not even winded. Here's "${flex ? cleanTitle(flex.title) : "the closer"}" as your closing argument. Court's adjourned.`,
  ],
};

const BEEF_DROP = [
  "We good now.",
  "Alright, truce — crown back on straight.",
  "See? Friends again.",
];

const THANKS_LINES: Record<Persona, string[]> = {
  public: [
    "Anytime — that's what I'm here for. The catalog stays open.",
    "You got it. Holler when you need another one.",
  ],
  admin: [
    "Anytime. I live to serve — and occasionally to talk back.",
    "You got it. Best seat in the control room, as always.",
  ],
};

const RETURNING_GREETING: Record<Persona, string[]> = {
  public: [
    "Back again — knew you couldn't stay away. Name a song, a vibe, or ask me anything on the shelf.",
    "Look who it is. The catalog missed you — what are we playing?",
  ],
  admin: [
    "Back in the control room — seat's warm, catalog's loaded. What are we spinning?",
    "Well look who's back. Trouble or tunes today?",
  ],
};

const FAREWELL_LINES: Record<Persona, string[]> = {
  public: ["Later — the hits will be right here when you're back."],
  admin: ["Later — I'll keep the catalog warm and the jokes questionable."],
};

/* ------------------------------------------------------------------ */
/* Context carry                                                       */
/* ------------------------------------------------------------------ */

/** A different song kin to the one in focus: shared tags + category. */
function pickDifferentSong(state: ConvoState, extraTokens: string[]): Video | null {
  const last = songById(state.lastSongId);
  const pool = last?.category === "short" ? shorts : fullSongs;
  const candidates = pool.filter((v) => v.id !== state.lastSongId);
  if (!candidates.length) return null;
  const tokens = [...extraTokens, ...state.topicWords];
  let best: Video | null = null;
  let bestScore = -1;
  for (const v of candidates) {
    let s = scoreVideo(v, tokens);
    if (last) {
      const lastTags = (last.tags ?? []).filter((t) => t !== "taylormade-hits");
      const shared = (v.tags ?? []).filter((t) => lastTags.includes(t)).length;
      s += shared * 2 + (v.category === last.category ? 2 : 0) + (v.featured ? 1 : 0);
    }
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

interface ContextHit {
  answer: SongAnswer;
  intent: string;
  focusId: string | null;
}

function resolveContext(state: ConvoState, raw: string, lower: string): ContextHit | null {
  const named = findSong(raw);
  const namedIsNew = !!named && named.id !== state.lastSongId;

  const last = songById(state.lastSongId);
  const lastName = last ? cleanTitle(last.title) : null;
  const playLast = (): ContextHit | null =>
    last && lastName
      ? { answer: answerDirect(`play ${lastName}`), intent: "play", focusId: last.id }
      : null;

  // Follow-up patterns run BEFORE the named-song guard on purpose:
  // findSong can incidentally match an unrelated Short on one common
  // word ("more like that" hits a Short titled "…Look Like Progress"),
  // and explicit follow-up language must win over that accident. A
  // fresh named ask ("play Save Me Wonder Woman", "how long is X")
  // matches none of these patterns, so it still reaches the direct
  // engine untouched below.
  //
  // Bare affirmatives after a bot offer ("Want it playing?") = do it.
  if (AFFIRMATIVE.test(lower) || /^(play|queue|run) (it|that|that one|this|this one)$/.test(lower)) {
    return playLast();
  }
  // "please play it", "play it again", … — but "play that song <new
  // title>" names a fresh pick, so a new named song defers this one.
  if (!namedIsNew && /\bplay (it|that|that one|this|this one)\b/.test(lower)) return playLast();

  const pronoun = /\b(it|that|that one|this|this one)\b/.test(lower);
  if (last && lastName && pronoun) {
    if (/\bhow long\b/.test(lower) || /\bduration\b/.test(lower) || /\bruntime\b/.test(lower)) {
      return { answer: answerDirect(`how long is ${lastName}`), intent: "length", focusId: last.id };
    }
    if (/\bwhen\b/.test(lower) && /\b(drop|come out|came out|release|posted|upload)\b/.test(lower)) {
      return { answer: answerDirect(`when did ${lastName} come out`), intent: "when", focusId: last.id };
    }
    if (/\babout\b/.test(lower) || /\bmeaning\b/.test(lower) || /\bstory\b/.test(lower)) {
      return { answer: answerDirect(`what is ${lastName} about`), intent: "about", focusId: last.id };
    }
  }

  // "another one" / "one more" — a DIFFERENT song, kin to the last.
  if (/\banother\b/.test(lower) || /\bone more\b/.test(lower)) {
    const next = pickDifferentSong(state, queryTokens(raw));
    if (next) {
      return {
        answer: answerDirect(`play ${cleanTitle(next.title)}`),
        intent: "another",
        focusId: next.id,
      };
    }
  }

  // Vibe follow-ups: "more like that", "something harder", "similar"…
  if (
    /^more( please)?$/.test(lower) ||
    /\bmore like that\b/.test(lower) ||
    /\bmore of (that|those|this)\b/.test(lower) ||
    /\bsomething (harder|softer|slower|faster|like that|similar)\b/.test(lower) ||
    /\bsimilar\b/.test(lower) ||
    /\bsame vibe\b/.test(lower) ||
    /\bharder\b/.test(lower)
  ) {
    const tagTokens = (last?.tags ?? []).flatMap((t) => normalize(t).split(" "));
    const vibeTokens = [...new Set([...queryTokens(raw), ...state.topicWords, ...tagTokens])];
    let best: Video | null = null;
    let bestScore = 0;
    for (const v of fullSongs) {
      if (v.id === state.lastSongId) continue;
      const s = scoreVideo(v, vibeTokens);
      if (s > bestScore) {
        bestScore = s;
        best = v;
      }
    }
    const chosen = best && bestScore > 0 ? best : pickDifferentSong(state, vibeTokens);
    if (chosen) {
      return {
        answer: answerDirect(`play ${cleanTitle(chosen.title)}`),
        intent: "vibe",
        focusId: chosen.id,
      };
    }
  }

  return null;
}

/** Coarse intent label for the direct-engine path (thread bookkeeping). */
function intentFor(lower: string, answer: SongAnswer): string {
  if (/\b(how many|count|total)\b/.test(lower)) return "count";
  if (/\b(newest|latest|most recent)\b/.test(lower)) return "newest";
  if (/\b(longest|most minutes)\b/.test(lower)) return "longest";
  if (/\bjoke\b/.test(lower)) return "joke";
  if (/\bhow long\b/.test(lower)) return "length";
  if (/\babout\b/.test(lower)) return "about";
  if (answer.play) return "play";
  return "catalog";
}

/* ------------------------------------------------------------------ */
/* converse — the engine. Priority: trash (unless a clear catalog     */
/* ask) → friendly reset/small talk → context carry → direct engine   */
/* (whose own fallbacks are engaged). Returns a NEW state.             */
/* ------------------------------------------------------------------ */
export function converse(
  state: ConvoState,
  rawInput: string,
  persona: Persona
): { state: ConvoState; answer: SongAnswer } {
  const raw = rawInput.trim();
  if (!raw) {
    return {
      state: { ...state, turns: [...state.turns] },
      answer: { text: "Say the word — a song title, a vibe, or a question." },
    };
  }

  const next: ConvoState = {
    turns: [...state.turns],
    lastSongId: state.lastSongId,
    lastIntent: state.lastIntent,
    beef: state.beef,
    topicWords: [...state.topicWords],
    greeted: state.greeted,
  };
  const seed = state.turns.length;

  const finish = (answer: SongAnswer, intent: string, focusId?: string | null) => {
    if (focusId !== undefined) next.lastSongId = focusId;
    else if (answer.play) next.lastSongId = answer.play.id;
    next.lastIntent = intent;
    next.turns = [
      ...next.turns,
      { role: "user" as const, text: raw },
      { role: "bot" as const, text: answer.text },
    ].slice(-12);
    return { state: next, answer };
  };

  let lower = normalize(raw);
  let working = raw;

  // Rolling topic words: this turn's sanitized salient tokens lead.
  const salient = echoWords(raw, 8);
  if (salient.length) {
    next.topicWords = [...new Set([...salient, ...next.topicWords])].slice(0, 8);
  }

  const catalogAsk = isClearCatalogAsk(raw, lower);

  /* (a)+(b) TRASH — first, unless the catalog clearly owns the ask. */
  if (!catalogAsk && isTrash(lower)) {
    next.beef = Math.min(3, state.beef + 1);
    const level = next.beef as 1 | 2 | 3;
    const flex = flexSong();
    const pool = persona === "admin" ? ADMIN_COMEBACKS[level](flex) : PUBLIC_COMEBACKS[level](flex);
    const text = pick(pool, seed + level);
    const answer: SongAnswer =
      level === 3 && flex ? { text, play: flex } : { text };
    return finish(answer, "trash", state.lastSongId);
  }

  /* Beef reset: friendly or a real catalog question cools it off, and
   * the reply's tone says so (the drop line prefixes the answer). */
  const friendly = FRIENDLY.test(lower);
  let dropPrefix = "";
  if (state.beef > 0 && (friendly || catalogAsk)) {
    next.beef = 0;
    dropPrefix = `${pick(BEEF_DROP, seed)} `;
  }

  /* (e) Greetings — returning users get acknowledged as returning. A
   * greeting glued to a real ask ("hey, play X") is stripped, not
   * swallowed: the ask still gets answered. */
  if (GREETING_START.test(lower)) {
    if (catalogAsk && !PURE_GREETING.test(lower)) {
      working = raw.replace(/^(hi|hello|hey|yo|sup)[,!.?\s]+/i, "");
      lower = normalize(working);
    } else {
      next.greeted = true;
      if (state.greeted || state.turns.length > 0) {
        return finish(
          { text: dropPrefix + pick(RETURNING_GREETING[persona], seed) },
          "greeting",
          state.lastSongId
        );
      }
      const a = answerDirect(working);
      return finish({ ...a, text: dropPrefix + a.text }, "greeting", state.lastSongId);
    }
  }

  /* (e) Thanks / apology / farewell / a bare laugh — thin small talk. */
  if (!catalogAsk && THANKS.test(lower)) {
    return finish({ text: dropPrefix + pick(THANKS_LINES[persona], seed) }, "thanks", state.lastSongId);
  }
  if (!catalogAsk && APOLOGY.test(lower)) {
    return finish(
      {
        text: dropPrefix
          ? `${dropPrefix}No hard feelings — what you need, a song, a fact, a vibe?`
          : "All good — what you need? A song, a fact, a vibe?",
      },
      "apology",
      state.lastSongId
    );
  }
  if (!catalogAsk && FAREWELL.test(lower)) {
    return finish({ text: dropPrefix + pick(FAREWELL_LINES[persona], seed) }, "farewell", state.lastSongId);
  }
  if (LOL_ONLY.test(lower)) {
    return finish(
      {
        text:
          dropPrefix +
          "Ha — stick around, the catalog's got better material than my jokes. Name a vibe.",
      },
      "smalltalk",
      state.lastSongId
    );
  }

  /* (c) Context carry — follow-ups resolve against the thread before
   * the stateless engine ever sees them. */
  const ctx = resolveContext(next, working, lower);
  if (ctx) return finish(ctx.answer, ctx.intent, ctx.focusId);

  /* Direct engine — specific catalog answers win unchanged; its
   * fallbacks are the engaged kind (see engagedFallbackAnswer). */
  const answer = answerDirect(working, next.topicWords);
  const named = findSong(working);
  const finalAnswer = dropPrefix ? { ...answer, text: dropPrefix + answer.text } : answer;
  return finish(finalAnswer, intentFor(lower, answer), named ? named.id : undefined);
}
