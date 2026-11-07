/**
 * Shared voice engine for the Mr Big Nuts chatbots.
 *
 * Uses the browser's built-in speech synthesis (free, on-device, no keys).
 * Voices load asynchronously in most browsers, so the list is cached and
 * refreshed on `voiceschanged`. Persona = a gender preference + pitch/rate
 * shaping on top of the most human-sounding local voice available.
 */

export interface VoicePersona {
  gender: "male" | "female";
  pitch: number;
  rate: number;
}

/** Smooth-talking public Mr Big Nuts. */
export const PUBLIC_PERSONA: VoicePersona = { gender: "male", pitch: 0.82, rate: 0.97 };

const FEMALE_HINT =
  /female|zira|samantha|victoria|karen|moira|fiona|tessa|susan|allison|ava|serena|joanna|salli|kimberly|catherine|linda|heather/i;
const MALE_HINT =
  /male|david|daniel|alex|fred|guy|mark|christopher|eric|george|james|john|paul|richard|thomas/i;

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

function pickVoice(gender: "male" | "female"): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;
  const hint = gender === "female" ? FEMALE_HINT : MALE_HINT;
  const antiHint = gender === "female" ? MALE_HINT : FEMALE_HINT;
  const en = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  return (
    pool.find((v) => hint.test(v.name) && /[-_]us/i.test(v.lang)) ??
    pool.find((v) => hint.test(v.name)) ??
    pool.find((v) => !antiHint.test(v.name) && /[-_]us/i.test(v.lang)) ??
    pool.find((v) => !antiHint.test(v.name)) ??
    pool[0] ??
    null
  );
}

/** Strip chat formatting/emoji so the spoken line sounds like a person talking. */
function speakable(text: string): string {
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
  const line = speakable(text);
  if (!line) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(line);
  const voice = pickVoice(persona.gender);
  if (voice) utter.voice = voice;
  utter.pitch = persona.pitch;
  utter.rate = persona.rate;
  utter.volume = 1;
  synth.speak(utter);
}

export function stopSpeaking(): void {
  if (voiceSupported()) window.speechSynthesis.cancel();
}

/* ------------------------------------------------------------------ */
/* Speech recognition (mic input). Pressing the mic button starts a    */
/* recognition session, which is what makes the browser ask for        */
/* microphone permission.                                              */
/* ------------------------------------------------------------------ */

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function recognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function startListening(handlers: {
  onText: (transcript: string) => void;
  onEnd: () => void;
}): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Recognition) return false;
  try {
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (evt) => {
      const transcript = evt.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) handlers.onText(transcript);
    };
    rec.onend = () => handlers.onEnd();
    rec.onerror = () => handlers.onEnd();
    rec.start(); // <- the browser shows the microphone-permission prompt here
    return true;
  } catch {
    handlers.onEnd();
    return false;
  }
}
