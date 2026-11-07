import { useEffect, useMemo, useRef, useState } from "react";
import type { Video } from "@/data/videos";
import { answerQuestion, cleanTitle } from "@/lib/bigNutsBrain";
import { PUBLIC_PERSONA, recognitionSupported, speak, startListening, stopSpeaking } from "@/lib/botVoice";

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

  const say = (text: string) => {
    if (talkRef.current) speak(text, PUBLIC_PERSONA);
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

  const mic = () => {
    if (listening) return;
    const started = startListening({
      onText: (transcript) => send(transcript),
      onEnd: () => setListening(false),
    });
    if (started) setListening(true);
    else
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "This browser doesn't do voice typing — type it and I'll still answer out loud." },
      ]);
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
    <div className="fixed bottom-24 right-4 z-[85] w-[min(92vw,360px)]">
      <div className="overflow-hidden rounded-2xl border border-gold-300/45 bg-[#050505]/97 shadow-[0_14px_45px_rgba(0,0,0,0.72)] backdrop-blur-md">
        {/* Header: title, voice toggle, minimize, close */}
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
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
                  if (v) stopSpeaking();
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
              stopSpeaking();
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
        <div ref={scrollRef} className="max-h-[46vh] space-y-2 overflow-y-auto p-3">
          {msgs.map((m, i) => (
            <div key={i}>
              <p
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
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
                    className="block bg-black/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-gold-200/90 hover:text-gold-100"
                  >
                    {cleanTitle(m.play.title)} — open on YouTube ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
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

        {/* Input */}
        <div className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask for a song, a fact, a vibe…"
            className="flex-1 rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-platinum outline-none focus:border-gold-300/60"
            aria-label="Ask Mr Big Nuts"
          />
          <button
            type="button"
            onClick={mic}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              listening
                ? "border-red-300/70 bg-red-500/20 text-red-100"
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
            className="rounded-lg bg-gold-300 px-3 py-2 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="border-t border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-platinum/45">
          Knows all 78 catalog videos · facts from the real YouTube listings
        </p>
      </div>
    </div>
  );
}
