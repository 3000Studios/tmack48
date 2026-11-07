/**
 * Shared voice engine for the Mr Big Nuts chatbots.
 *
 * Speech OUT (fallback path): the browser's built-in speech synthesis,
 * with voices RANKED by naturalness — network/Google/Microsoft "Natural"
 * voices first, robotic local defaults (eSpeak, compact, novelty voices)
 * hard-penalized. The public bot prefers the ElevenLabs natural voice
 * served by /api/tts and only falls back to this when that's unavailable.
 *
 * Speech IN: Web Speech recognition. The mic flow asks for microphone
 * permission FIRST via getUserMedia (so the prompt reliably appears the
 * moment the button is tapped), then streams interim transcripts into
 * the chat input as live speech-to-text and sends the final transcript.
 * Every failure mode surfaces a spoken-style chat line — never silence.
 */

export interface VoicePersona {
  gender: "male" | "female";
  pitch: number;
  rate: number;
}

/** Smooth-talking public Mr Big Nuts. */
export const PUBLIC_PERSONA: VoicePersona = { gender: "male", pitch: 0.9, rate: 1.0 };

const FEMALE_HINT =
  /female|zira|samantha|victoria|karen|moira|fiona|tessa|susan|allison|ava|serena|joanna|salli|kimberly|catherine|linda|heather|jenny|aria/i;
const MALE_HINT =
  /male|david|daniel|alex|fred|guy|mark|christopher|eric|george|james|john|paul|richard|thomas|brian|ryan|tony/i;
const ROBOT_HINT =
  /espeak|compact|pico|eloquence|synthes|robot|novel|junior|grandpa|grandma|whisper|bells|organ|cellos|trinoids|zarvox|bahh|boing|bubbles|deranged|hysterical|wobble|albert|bad news|good news|jester|superstar|wobble/i;

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length) voicesCache = v;
  return voicesCache;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => loadVoices();
}

export function voiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Rank a voice by how human it sounds + whether it fits the persona. */
function voiceScore(v: SpeechSynthesisVoice, gender: "male" | "female"): number {
  const name = v.name.toLowerCase();
  let s = 0;
  if (/natural|neural/.test(name)) s += 60; // Microsoft Natural / neural voices
  if (name.startsWith("google")) s += 45; // Google network voices (Chrome)
  if (!v.localService) s += 20; // streamed voices sound far better than local packs
  if (/microsoft/.test(name)) s += 12;
  const hint = gender === "female" ? FEMALE_HINT : MALE_HINT;
  const anti = gender === "female" ? MALE_HINT : FEMALE_HINT;
  if (anti.test(v.name)) s -= 45;
  else if (hint.test(v.name)) s += 30;
  if (/-us/i.test(v.lang) || /_us/i.test(v.lang)) s += 12;
  else if (/-gb/i.test(v.lang) || /_gb/i.test(v.lang)) s += 8;
  else if (/^en/i.test(v.lang)) s += 4;
  if (ROBOT_HINT.test(name)) s -= 60;
  return s;
}

function pickVoice(gender: "male" | "female"): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  return [...pool].sort((a, b) => voiceScore(b, gender) - voiceScore(a, gender))[0] ?? null;
}

/** Strip chat formatting/emoji so the spoken line sounds like a person talking. */
export function toSpeakable(text: string): string {
  const clean = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#>`]/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= 340) return clean;
  const cut = clean.slice(0, 340);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return lastStop > 120 ? cut.slice(0, lastStop + 1) : cut;
}

export function speak(text: string, persona: VoicePersona): void {
  if (!voiceSupported()) return;
  const line = toSpeakable(text);
  if (!line) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  // Chrome drops utterances spoken in the same tick as a cancel — delay a hair.
  window.setTimeout(() => {
    const utter = new SpeechSynthesisUtterance(line);
    const voice = pickVoice(persona.gender);
    if (voice) utter.voice = voice;
    utter.pitch = persona.pitch;
    utter.rate = persona.rate;
    utter.volume = 1;
    synth.speak(utter);
  }, 60);
}

export function stopSpeaking(): void {
  if (voiceSupported()) window.speechSynthesis.cancel();
}

/* ------------------------------------------------------------------ */
/* Speech recognition (mic input).                                     */
/* ------------------------------------------------------------------ */

interface RecognitionAlternativeLike {
  transcript: string;
}
interface RecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternativeLike;
}
interface RecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
}
interface RecognitionErrorLike {
  error: string;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function recognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/**
 * Ask for microphone permission directly. Calling getUserMedia on the
 * button tap is what makes the browser's permission prompt appear —
 * far more reliably than hoping recognition.start() surfaces it.
 */
export async function requestMicPermission(): Promise<"granted" | "denied" | "unsupported"> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return "granted";
  } catch {
    return "denied";
  }
}

const RECOGNITION_ERRORS: Record<string, string> = {
  "not-allowed":
    "Mic's blocked, superstar. Tap the lock icon next to the address bar, allow the microphone for tmack48.com, then hit Mic again.",
  "service-not-allowed":
    "Mic's blocked, superstar. Tap the lock icon next to the address bar, allow the microphone for tmack48.com, then hit Mic again.",
  "no-speech": "Didn't catch a word of that — hit Mic and talk right at it, nice and loud.",
  "audio-capture": "This device ain't showing me a microphone. Plug one in or type your jam below.",
  network: "The speech service needs a connection — check your signal and hit Mic again.",
  aborted: "",
};

/**
 * Start a recognition session. Interim words stream to onInterim (the
 * caller shows them in the input as live speech-to-text); the final
 * transcript goes to onText. Returns a stop function, or null when
 * recognition is unavailable.
 */
export function startListening(handlers: {
  onInterim?: (text: string) => void;
  onText: (transcript: string) => void;
  onError?: (message: string) => void;
  onEnd: () => void;
}): (() => void) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Recognition) return null;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    handlers.onEnd();
  };
  try {
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (evt) => {
      let interim = "";
      let finalText = "";
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        const result = evt.results[i];
        const transcript = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finalText += transcript;
        else interim += transcript;
      }
      if (finalText.trim()) handlers.onText(finalText.trim());
      else if (interim) handlers.onInterim?.(interim);
    };
    rec.onerror = (evt) => {
      const message = RECOGNITION_ERRORS[evt.error] ?? "Mic hiccup — hit it again and talk to me.";
      if (message) handlers.onError?.(message);
      finish();
    };
    rec.onend = () => finish();
    rec.start();
    return () => {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      finish();
    };
  } catch {
    finish();
    return null;
  }
}
