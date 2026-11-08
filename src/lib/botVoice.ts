/**
 * Shared voice engine for the Mr Big Nuts chatbots.
 *
 * Speech OUT (fallback path): the browser's built-in speech synthesis,
 * with voices RANKED by naturalness — network/Google/Microsoft "Natural"
 * voices first, robotic local defaults (eSpeak, compact, novelty voices)
 * hard-penalized. The public bot prefers the ElevenLabs natural voice
 * served by /api/tts and only falls back to this when that's unavailable.
 *
 * Speech IN: Web Speech recognition, restructured for Android Chrome.
 * The old flow awaited a getUserMedia pre-flight, stopped its tracks
 * instantly, and only then started recognition — that double-request
 * made recognition.start() fail (not-allowed / aborted) or start into
 * a dead mic on several Android builds. The fixed flow runs entirely
 * inside the tap handler's synchronous call stack:
 *   1. getUserMedia is INVOKED (enhanced constraints, bare fallback) —
 *      the resulting stream is HELD for the whole session, never
 *      stopped-and-restarted, and its tracks stop only in finish().
 *   2. permissions.query + enumerateDevices are invoked in the same
 *      tick as a parallel diagnosis — they can stop a bad session with
 *      a precise message, but a detection failure never blocks the
 *      recognition attempt.
 *   3. recognition.start() is called synchronously, before any await.
 * Diagnosis vs recognition is a race with one winner: whichever reports
 * denied / no-device / an error first posts the message (per-session
 * token), late resolutions never double-post. Every failure mode
 * surfaces a chat line — never silence.
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

/* ------------------------------------------------------------------ */
/* Mic diagnosis: permission state + device detection + a real         */
/* getUserMedia attempt, classified into precise outcomes.             */
/* ------------------------------------------------------------------ */

export type MicDiag = "granted" | "denied" | "no-device" | "unsupported" | "unknown";

/** Status driving the persistent mic status line in both bot panels. */
export type MicStatus = "idle" | "listening" | "denied" | "no-device" | "unsupported" | "error";

/** Chat-line copy per mic outcome — denied vs no-device vs unsupported stay distinct. */
export const MIC_DENIED_MESSAGE: string = RECOGNITION_ERRORS["not-allowed"];
export const MIC_NO_DEVICE_MESSAGE: string = RECOGNITION_ERRORS["audio-capture"];
export const MIC_UNSUPPORTED_MESSAGE =
  "This browser can't do voice typing — Chrome hears best. Type your jam below and I'll still answer out loud.";

/** Short copy for the persistent status line above each bot's input row. */
export const MIC_STATUS_COPY: Record<MicStatus, string> = {
  idle: "",
  listening: "🎤 Listening… talk now.",
  denied: "🎤 Mic blocked — allow the microphone for this site, then tap Mic again.",
  "no-device": "🎤 No microphone found on this device.",
  unsupported: "🎤 Voice typing isn't supported in this browser — try Chrome.",
  error: "🎤 Mic hit a snag — tap Mic and try again.",
};

function errorName(err: unknown): string {
  if (err && typeof err === "object" && "name" in err) {
    return String((err as { name: unknown }).name ?? "");
  }
  return "";
}

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* already stopped */
    }
  });
}

/**
 * Microphone permission state via the Permissions API, or null when it
 * can't be queried. Calling this invokes permissions.query
 * synchronously; the returned promise never rejects — a detection
 * failure must never block the recognition attempt.
 */
async function queryMicPermissionState(): Promise<string | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return null;
    const status = await navigator.permissions.query({ name: "microphone" } as PermissionDescriptor);
    return status?.state ?? null;
  } catch {
    return null;
  }
}

/**
 * Whether enumerateDevices() can see an audio input. true/false only
 * when the browser actually enumerated devices; null when it can't
 * tell (some browsers return an empty list before permission is
 * granted — that must not be misread as "no microphone"). Calling this
 * invokes enumerateDevices synchronously; never rejects.
 */
async function hasAudioInputDevice(): Promise<boolean | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return null;
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (!devices.length) return null;
    return devices.some((d) => d.kind === "audioinput");
  } catch {
    return null;
  }
}

interface MicAttempt {
  stream: MediaStream | null;
  errorName: string;
}

/**
 * One getUserMedia attempt chain: enhanced constraints FIRST (echo
 * cancellation + noise suppression), bare { audio: true } as the
 * fallback for odd hardware that rejects constraints with
 * OverconstrainedError. A denial is not retried — bare constraints
 * can't unblock it. Calling this invokes getUserMedia SYNCHRONOUSLY
 * (the async body runs up to its first await), which is what lets a
 * tap handler kick the permission prompt off in the same tick.
 */
async function tryGetMicStream(): Promise<MicAttempt> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { stream: null, errorName: "unsupported" };
  }
  const devices = navigator.mediaDevices;
  try {
    const stream = await devices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    return { stream, errorName: "" };
  } catch (firstErr) {
    const firstName = errorName(firstErr);
    if (firstName === "NotAllowedError" || firstName === "SecurityError") {
      return { stream: null, errorName: firstName };
    }
    try {
      const stream = await devices.getUserMedia({ audio: true });
      return { stream, errorName: "" };
    } catch (secondErr) {
      return { stream: null, errorName: errorName(secondErr) || firstName };
    }
  }
}

/** Classify a failed getUserMedia attempt. NotFound/Overconstrained ≠ denied. */
function classifyFailure(name: string, hasInput: boolean | null): MicDiag {
  if (name === "unsupported") return "unsupported";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") {
    return "no-device";
  }
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (hasInput === false) return "no-device";
  return "unknown";
}

/**
 * Full microphone diagnosis: a queryable "denied" permission state
 * short-circuits with the precise answer; otherwise device detection
 * plus a real getUserMedia attempt decide. Any stream this opens is a
 * DIAGNOSIS stream and is stopped before returning — the stream a live
 * session holds is a separate one, opened by startListeningSession.
 */
export async function diagnoseMic(): Promise<MicDiag> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  // A live session already holds a working stream — never open a second one.
  if (sessionStream && sessionStream.getAudioTracks().some((t) => t.readyState === "live")) {
    return "granted";
  }
  const permState = await queryMicPermissionState();
  if (permState === "denied") return "denied";
  const hasInput = await hasAudioInputDevice();
  const attempt = await tryGetMicStream();
  if (attempt.stream) {
    stopStream(attempt.stream);
    return "granted";
  }
  return classifyFailure(attempt.errorName, hasInput);
}

/**
 * Legacy permission check, kept for compatibility. New callers should
 * use diagnoseMic() / startListeningSession(): under this 3-value
 * contract "no-device" and "unknown" collapse into "denied".
 */
export async function requestMicPermission(): Promise<"granted" | "denied" | "unsupported"> {
  const diag = await diagnoseMic();
  if (diag === "granted") return "granted";
  if (diag === "unsupported") return "unsupported";
  return "denied";
}

/* ------------------------------------------------------------------ */
/* Listening sessions.                                                 */
/* ------------------------------------------------------------------ */

export interface ListeningHandlers {
  onInterim?: (text: string) => void;
  onText: (transcript: string) => void;
  onError?: (message: string, status?: MicStatus) => void;
  onEnd: () => void;
}

export interface ListeningSession {
  stop: () => void;
  diagnosis: Promise<MicDiag>;
}

/** The one stream held by the active session — never two live streams. */
let sessionStream: MediaStream | null = null;
let sessionSeq = 0;

/** Combine the concurrently-kicked diagnosis signals into one verdict. */
async function settleDiagnosis(
  permPromise: Promise<string | null>,
  devicePromise: Promise<boolean | null>,
  attemptPromise: Promise<MicAttempt>,
): Promise<{ diag: MicDiag; stream: MediaStream | null }> {
  const [permState, hasInput, attempt] = await Promise.all([permPromise, devicePromise, attemptPromise]);
  if (attempt.stream) return { diag: "granted", stream: attempt.stream };
  if (permState === "denied") return { diag: "denied", stream: null };
  return { diag: classifyFailure(attempt.errorName, hasInput), stream: null };
}

/**
 * Start a recognition session the Android-safe way. Everything that
 * needs the user gesture happens SYNCHRONOUSLY in this call, which the
 * bots invoke directly from the Mic tap handler with no await before
 * it: getUserMedia is invoked and its stream held for the session,
 * permissions.query + enumerateDevices are invoked as a parallel
 * diagnosis, and recognition.start() runs in the same tick. If the
 * diagnosis lands on denied / no-device while recognition is running,
 * the session stops and reports the precise message; if recognition
 * errors first, its message wins and the late diagnosis stays silent.
 * Returns null only when recognition itself is unavailable.
 */
export function startListeningSession(handlers: ListeningHandlers): ListeningSession | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Recognition) return null;

  const token = ++sessionSeq;
  let done = false;
  let errorDelivered = false;
  let heldStream: MediaStream | null = null;
  let rec: RecognitionLike | null = null;

  const releaseStream = () => {
    if (!heldStream) return;
    stopStream(heldStream);
    if (sessionStream === heldStream) sessionStream = null;
    heldStream = null;
  };
  const finish = () => {
    if (done) return;
    done = true;
    releaseStream();
    handlers.onEnd();
  };
  const deliverError = (message: string, status: MicStatus) => {
    if (done || errorDelivered) return;
    errorDelivered = true;
    if (message) handlers.onError?.(message, status);
  };
  const stopRecognition = () => {
    try {
      rec?.stop();
    } catch {
      /* already stopped */
    }
  };

  // Guard: never two live streams — retire any stream a prior session left held.
  if (sessionStream) {
    stopStream(sessionStream);
    sessionStream = null;
  }

  /* --- Synchronous kick-off, same tick as the tap. NO await anywhere
     before rec.start() below: the getUserMedia invocation is what makes
     the browser's permission prompt appear, and start() must run inside
     the tap handler's call stack on Android Chrome. --- */
  const streamPromise = tryGetMicStream(); // getUserMedia invoked NOW; stream held on success
  const permPromise = queryMicPermissionState(); // permissions.query invoked NOW
  const devicePromise = hasAudioInputDevice(); // enumerateDevices invoked NOW

  const diagnosis: Promise<MicDiag> = (async () => {
    const settled = await settleDiagnosis(permPromise, devicePromise, streamPromise);
    if (settled.stream) {
      if (done || token !== sessionSeq) {
        // Session already over — don't hold a stream nobody is using.
        stopStream(settled.stream);
      } else {
        heldStream = settled.stream;
        sessionStream = settled.stream;
      }
    }
    if (!done && token === sessionSeq && !errorDelivered) {
      if (settled.diag === "denied") {
        deliverError(RECOGNITION_ERRORS["not-allowed"], "denied");
        stopRecognition();
        finish();
      } else if (settled.diag === "no-device") {
        deliverError(RECOGNITION_ERRORS["audio-capture"], "no-device");
        stopRecognition();
        finish();
      }
    }
    return settled.diag;
  })();

  try {
    rec = new Recognition();
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
      const status: MicStatus =
        evt.error === "not-allowed" || evt.error === "service-not-allowed"
          ? "denied"
          : evt.error === "audio-capture"
            ? "no-device"
            : "error";
      if (message) deliverError(message, status);
      finish();
    };
    rec.onend = () => finish();
    rec.start(); // synchronous — still inside the tap handler's call stack
  } catch {
    // recognition.start() threw synchronously (e.g. InvalidStateError
    // from a lingering prior session on some Android builds).
    deliverError("Mic hiccup — hit it again and talk to me.", "error");
    finish();
  }

  return {
    stop: () => {
      stopRecognition();
      finish();
    },
    diagnosis,
  };
}

/**
 * Start a recognition session. Interim words stream to onInterim (the
 * caller shows them in the input as live speech-to-text); the final
 * transcript goes to onText. Returns a stop function, or null when
 * recognition is unavailable. Thin wrapper over startListeningSession.
 */
export function startListening(handlers: ListeningHandlers): (() => void) | null {
  const session = startListeningSession(handlers);
  return session ? session.stop : null;
}
