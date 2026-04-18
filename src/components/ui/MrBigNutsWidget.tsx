import { useEffect, useMemo, useRef, useState } from "react";
import { videos, type Video } from "@/data/videos";
import { siteConfig } from "@/data/siteConfig";

type Msg = { role: "bot" | "user"; text: string };

type KBEntry = {
  video: Video;
  tokens: string[];
};

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const buildKnowledgeBase = (): KBEntry[] =>
  videos.map((video) => ({
    video,
    tokens: [
      video.title,
      video.category,
      ...(video.tags ?? []),
      video.blurb ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
  }));

function recommendSong(input: string, kb: KBEntry[]): Video {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const scores = kb.map((entry) => ({
    entry,
    score: words.reduce((acc, word) => acc + (entry.tokens.includes(word) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.entry.video ?? videos[0];
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred =
    voices.find((v) => /en-us|en_us/i.test(v.lang) && /male|david|mark|daniel|alex/i.test(v.name)) ??
    voices.find((v) => /en-us|en_us/i.test(v.lang)) ??
    voices[0];
  return preferred ?? null;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.rate = 0.98;
  utter.pitch = 0.92;
  utter.volume = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function MrBigNutsWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [showDevForm, setShowDevForm] = useState(false);
  const [devRequest, setDevRequest] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "I'm Mr Big Nuts. Ask me for a vibe, lyric mood, or energy and I’ll pick your next track.",
    },
  ]);
  const kb = useMemo(() => buildKnowledgeBase(), []);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const send = (forcedText?: string) => {
    const nextDraft = (forcedText ?? draft).trim();
    if (!nextDraft) return;
    const pick = recommendSong(nextDraft, kb);
    const botText = `Try "${pick.title}" (${pick.category}). ${pick.blurb ?? "It matches your vibe."} Watch: ${pick.watchUrl}`;
    setDraft("");
    setMsgs((m) => [
      ...m,
      { role: "user", text: nextDraft },
      { role: "bot", text: botText },
    ]);
    speak(botText);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nudges = [
        "Yo TMACK, your fans need another anthem right now.",
        "Quick reminder: feed me a vibe and I'll feed you a banger.",
        "I'm still here running point — ask for your next song pick.",
      ];
      const text = nudges[Math.floor(Math.random() * nudges.length)] ?? nudges[0];
      setMsgs((m) => [...m, { role: "bot", text }]);
    }, 120000);
    return () => window.clearInterval(interval);
  }, []);

  const openDevRequest = () => {
    const subject = encodeURIComponent("TMACK48 Dev Request");
    const body = encodeURIComponent(
      devRequest.trim() || "Please update this part of the TMACK48 website:\n\n- "
    );
    window.location.href = `mailto:mr.jwswain@gmail.com?subject=${subject}&body=${body}`;
    const confirm = "Request queued for 3000 Studios. Dev team is locked in.";
    setMsgs((m) => [...m, { role: "bot", text: confirm }]);
    speak(confirm);
    setShowDevForm(false);
    setDevRequest("");
  };

  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const Recognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!Recognition) return;
    if (!recognitionRef.current) {
      const rec = new Recognition();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (evt) => {
        const transcript = evt.results?.[0]?.[0]?.transcript ?? "";
        setDraft(transcript);
        send(transcript);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <aside className="fixed bottom-28 right-4 z-[56] w-[min(92vw,340px)]">
      <p className="mb-2 text-right text-xs uppercase tracking-[0.18em] text-gold-200/90">Mr Big Nuts</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto mb-2 flex items-center gap-2 rounded-full border border-gold-300/40 bg-black/85 px-3 py-2 text-sm text-platinum shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
      >
        <span className="animate-bounce text-xl">🐿️</span>
        <span>{open ? "Hide chat" : "Chat with Mr Big Nuts"}</span>
      </button>
      {open && (
        <div className="overflow-hidden rounded-2xl border border-gold-300/45 bg-[#050505] shadow-[0_14px_45px_rgba(0,0,0,0.72)]">
          <div className="max-h-64 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <p
                key={i}
                className={`rounded-xl px-3 py-2 text-sm ${
                  m.role === "bot" ? "bg-gold-300/12 text-gold-100" : "bg-[#161616] text-platinum"
                }`}
              >
                {m.text}
              </p>
            ))}
          </div>
          {showDevForm && (
            <div className="border-t border-white/10 p-3 space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.16em] text-platinum/60">
                Dev Request
              </label>
              <textarea
                value={devRequest}
                onChange={(e) => setDevRequest(e.target.value)}
                rows={3}
                placeholder="Describe the website changes you need..."
                className="w-full rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-platinum outline-none focus:border-gold-300/60"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDevForm(false)}
                  className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.16em] text-platinum/80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={openDevRequest}
                  className="rounded-lg bg-gold-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-950"
                >
                  Send Request
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Ask for a song..."
              className="flex-1 rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-platinum outline-none focus:border-gold-300/60"
            />
            <button
              type="button"
              onClick={startVoiceInput}
              className="rounded-lg border border-gold-300/40 bg-black px-3 py-2 text-sm font-semibold text-gold-200"
            >
              {listening ? "..." : "🎤"}
            </button>
            <button
              type="button"
              onClick={() => send()}
              className="rounded-lg bg-gold-300 px-3 py-2 text-sm font-semibold text-ink-950"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setShowDevForm((v) => !v)}
              className="rounded-lg border border-gold-300/40 bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-200"
            >
              Dev
            </button>
          </div>
          <div className="border-t border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-platinum/50">
            Voice uses your browser audio engine · Channel: {siteConfig.channel.handle}
          </div>
        </div>
      )}
    </aside>
  );
}
