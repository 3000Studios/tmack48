import { useEffect, useMemo, useRef, useState } from "react";
import type { Video } from "@/data/videos";
import { answerQuestion, cleanTitle } from "@/lib/bigNutsBrain";
import {
  MIC_STATUS_COPY,
  MIC_UNSUPPORTED_MESSAGE,
  PUBLIC_PERSONA,
  diagnoseMic,
  recognitionSupported,
  speak,
  startListeningSession,
  stopSpeaking,
  toSpeakable,
  type MicStatus,
} from "@/lib/botVoice";

type Msg = { role: "bot" | "user"; text: string; play?: Video };

const TAGLINES = [
  "Keep that crown straight and your game tighter than your fade.",
  "You ain't late, you just on pimp time. Move clean and make noise.",
  "Respect the hustle, respect the shine. Mr Big Nuts don't chase, he attracts.",
  "Talk slick, walk slicker. That's certified Big Nuts game.",
  "You don't beg for the spotlight. You own the room before you enter it.",
];

const GREETING =
  "What's up! I'm Mr Big Nuts — I know every song in the TaylorMade Hits catalog. Ask me to play one, ask what it's about or how long it runs, or name a vibe and I'll pick for you.";

const CHIPS = ["Play Save Me Wonder Woman", "What is Nobody To Save about?", "How many songs are there?", "Surprise me"];

export default function MrBigNuttsBot() {
  const [view, setView] = useState<"open" | "min" | "closed">("min");
  const [talk, setTalk] = useState(true);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: GREETING }]);
  const tagline = useMemo(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)], []);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const greetedRef = useRef(false);
  const talkRef = useRef(talk);
  talkRef.current = talk;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, view]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsDeadRef = useRef(false);
  const sessionRef = useRef<ReturnType<typeof startListeningSession>>(null);

  const stopAllAudio = () => {
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  /**
   * His voice: the natural human voice from /api/tts (ElevenLabs) first;
   * if that endpoint isn't live yet or fails, fall back to the best
   * natural browser voice. One failure parks the API for the session.
   */
  const say = (text: string) => {
    if (!talkRef.current) return;
    void (async () => {
      if (!ttsDeadRef.current) {
        try {
          const line = toSpeakable(text);
          if (line) {
            const res = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: line }),
            });
            if (res.ok) {
              const blob = await res.blob();
              if (!talkRef.current) return;
              const url = URL.createObjectURL(blob);
              stopSpeaking();
              if (audioRef.current) audioRef.current.pause();
              const audio = new Audio(url);
              audioRef.current = audio;
              audio.onended = () => URL.revokeObjectURL(url);
              await audio.play();
              return;
            }
            ttsDeadRef.current = true;
          }
        } catch {
          ttsDeadRef.current = true;
        }
      }
      if (talkRef.current) speak(text, PUBLIC_PERSONA);
    })();
  };

  const openPanel = () => {
    setView("open");
    if (!greetedRef.current) {
      greetedRef.current = true;
      say(GREETING);
    }
  };

  const send = (forced?: string) => {
    const text = (forced ?? draft).trim();
    if (!text) return;
    setDraft("");
    const answer = answerQuestion(text);
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: answer.text, play: answer.play }]);
    say(answer.text);
  };

  // Deliberately NOT async: no await may intervene between the tap and
  // startListeningSession — it invokes getUserMedia and calls
  // recognition.start() synchronously, inside this handler's call stack.
  const mic = () => {
    if (listening) {
      sessionRef.current?.stop();
      return;
    }
    if (!recognitionSupported()) {
      setMicStatus("unsupported");
      // Still exercise the permission + device-detection path — never silent.
      void diagnoseMic();
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "This browser can't do voice typing — Chrome hears best. Type your jam below and I'll still answer out loud.",
        },
      ]);
      return;
    }
    setListening(true);
    setMicStatus("listening");
    const session = startListeningSession({
      // Live speech-to-text: your words land in the input as you talk…
      onInterim: (t) => setDraft(t),
      // …and the finished sentence sends itself.
      onText: (t) => {
        setDraft("");
        send(t);
      },
      onError: (message, status) => {
        if (status) setMicStatus(status);
        setMsgs((m) => [...m, { role: "bot", text: message }]);
      },
      onEnd: () => {
        sessionRef.current = null;
        setListening(false);
        // Clear back to idle — unless an error status just landed.
        setMicStatus((s) => (s === "listening" ? "idle" : s));
      },
    });
    if (session) {
      sessionRef.current = session;
    } else {
      setListening(false);
      setMicStatus("unsupported");
      setMsgs((m) => [...m, { role: "bot", text: MIC_UNSUPPORTED_MESSAGE }]);
    }
  };

  if (view === "closed") return null;

  if (view === "min") {
    return (
      <div className="fixed bottom-24 right-4 z-[85]">
        <button
          type="button"
          onClick={openPanel}
          className="btn-gold !px-4 !py-2.5 text-xs uppercase tracking-[0.22em] shadow-gold-xl"
          aria-label="Open the Mr Big Nuts chat"
        >
          🐿️ Mr Big Nuts
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-[85] flex max-h-[min(640px,calc(100dvh-8rem))] w-[min(92vw,360px)] flex-col max-sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:left-[max(0.75rem,env(safe-area-inset-left))] max-sm:right-[max(0.75rem,env(safe-area-inset-right))] max-sm:top-[max(0.75rem,env(safe-area-inset-top))] max-sm:max-h-none max-sm:w-auto">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gold-300/45 bg-[#050505]/97 shadow-[0_14px_45px_rgba(0,0,0,0.72)] backdrop-blur-md">
        {/* Header: title, voice toggle, minimize, close */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <span className="animate-bounce text-lg" aria-hidden>
            🐿️
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gold-100">Mr Big Nuts</p>
            <p className="truncate text-[10px] uppercase tracking-[0.16em] text-platinum/50">{tagline}</p>
          </div>
          <label className="flex cursor-pointer items-center gap-1.5" title="Turn his voice on or off">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-platinum/60">Voice</span>
            <button
              type="button"
              role="switch"
              aria-checked={talk}
              aria-label="Toggle Mr Big Nuts voice"
              onClick={() => {
                setTalk((v) => {
                  if (v) stopAllAudio();
                  return !v;
                });
              }}
              className={`relative h-5 w-10 shrink-0 rounded-full transition-colors ${talk ? "bg-gold-300" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${talk ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </label>
          <button
            type="button"
            onClick={() => setView("min")}
            className="rounded-lg border border-white/15 px-2 py-1 text-sm leading-none text-platinum/80 hover:border-gold-300/50 hover:text-gold-200"
            aria-label="Minimize chat"
            title="Minimize — he keeps talking down here"
          >
            –
          </button>
          <button
            type="button"
            onClick={() => {
              stopAllAudio();
              setView("closed");
            }}
            className="rounded-lg border border-white/15 px-2 py-1 text-sm leading-none text-platinum/80 hover:border-red-300/60 hover:text-red-200"
            aria-label="Close chat"
            title="Close him out completely"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {msgs.map((m, i) => (
            <div key={i} className="min-w-0">
              <p
                className={`break-words rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "bot" ? "bg-gold-300/12 text-gold-50" : "bg-[#161616] text-platinum"
                }`}
              >
                {m.text}
              </p>
              {m.play && (
                <div className="mt-2 overflow-hidden rounded-xl border border-gold-300/30">
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={`${m.play.embedUrl}?autoplay=1&mute=1&rel=0`}
                      title={cleanTitle(m.play.title)}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={m.play.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-words bg-black/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-gold-200/90 hover:text-gold-100"
                  >
                    {cleanTitle(m.play.title)} — open on YouTube ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className="flex shrink-0 flex-wrap gap-1.5 px-3 pb-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              className="rounded-full border border-gold-300/30 bg-black/50 px-2.5 py-1 text-[11px] text-gold-100/90 transition hover:border-gold-300/70 hover:text-gold-100"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Mic status line — persistent live region directly above the input row */}
        <p
          role="status"
          aria-live="polite"
          className={
            micStatus === "idle"
              ? "sr-only"
              : `shrink-0 px-3 pt-2 text-[11px] font-semibold ${
                  micStatus === "listening" || micStatus === "unsupported" ? "text-gold-200" : "text-red-200"
                }`
          }
        >
          {MIC_STATUS_COPY[micStatus]}
        </p>

        {/* Input */}
        <div className="flex shrink-0 gap-2 border-t border-white/10 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder={listening ? "Listening… talk to me" : "Ask for a song, a fact, a vibe…"}
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-platinum outline-none focus:border-gold-300/60"
            aria-label="Ask Mr Big Nuts"
          />
          <button
            type="button"
            onClick={() => void mic()}
            className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold ${
              listening
                ? "animate-pulse border-red-300/70 bg-red-500/20 text-red-100"
                : "border-gold-300/40 bg-black text-gold-200"
            }`}
            aria-label="Talk to Mr Big Nuts (microphone)"
            title={recognitionSupported() ? "Tap and talk — your browser will ask for the mic" : "Voice typing not supported in this browser"}
          >
            {listening ? "●" : "🎤"}
          </button>
          <button
            type="button"
            onClick={() => send()}
            disabled={!draft.trim()}
            className="shrink-0 rounded-lg bg-gold-300 px-3 py-2 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="shrink-0 border-t border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-platinum/45">
          Knows all 78 catalog videos · facts from the real YouTube listings
        </p>
      </div>
    </div>
  );
}
