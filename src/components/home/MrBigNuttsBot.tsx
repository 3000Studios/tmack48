import { useEffect, useMemo, useState } from "react";

const BIG_NUTTS_LINES = [
  "Listen here, slick. Keep that crown straight and your game tighter than your fade.",
  "You ain't late, you just on pimp time. Move clean and make noise.",
  "Respect the hustle, respect the shine. Mr Big Nutts don't chase, he attracts.",
  "If they hate, let them spectate. You run this lane with luxury pressure.",
  "Keep your chin high, your rims clean, and your vision mean.",
  "Talk slick, walk slicker. That's certified Big Nutts game.",
  "You don't beg for the spotlight. You own the room before you enter it.",
  "If the beat drop, your confidence better drop heavier.",
];

const BOT_VOICE_ENABLED = import.meta.env.VITE_BOT_VOICE === "1";

function speakLine(line: string) {
  if (!BOT_VOICE_ENABLED) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.rate = 0.98;
  utterance.pitch = 0.78;
  utterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /david|guy|male|en-us/i.test(v.name + v.lang)) ?? voices[0];
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

export default function MrBigNuttsBot() {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState(BIG_NUTTS_LINES[0]);
  const lines = useMemo(() => BIG_NUTTS_LINES, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // First random line shortly after landing.
    const starter = window.setTimeout(() => {
      const pick = lines[Math.floor(Math.random() * lines.length)];
      setLine(pick);
    }, 10000);
    return () => {
      window.clearTimeout(starter);
    };
  }, [lines]);

  return (
    <div className="fixed bottom-24 right-4 z-[85] max-w-[min(90vw,320px)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-gold !px-4 !py-2 text-xs uppercase tracking-[0.22em]"
      >
        Mr Big Nutts
      </button>

      {open && (
        <div className="mt-2 card-premium p-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold-300">Pimp Game Bot</p>
          <p className="mt-2 text-sm text-platinum/85 leading-relaxed">{line}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => speakLine(line)}
              className="btn-ghost !px-3 !py-1.5 text-[10px] uppercase tracking-[0.2em]"
            >
              Talk Trash
            </button>
            <button
              type="button"
              onClick={() => {
                const pick = lines[Math.floor(Math.random() * lines.length)];
                setLine(pick);
                speakLine(pick);
              }}
              className="btn-diamond !px-3 !py-1.5 text-[10px] uppercase tracking-[0.2em]"
            >
              New Pimp Line
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
