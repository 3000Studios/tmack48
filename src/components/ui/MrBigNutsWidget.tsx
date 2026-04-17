import { useMemo, useState } from "react";
import { videos } from "@/data/videos";

type Msg = { role: "bot" | "user"; text: string };

function recommendSong(input: string): string {
  const q = input.toLowerCase();
  const match =
    videos.find((v) => v.title.toLowerCase().includes(q)) ??
    (q.includes("love") ? videos.find((v) => v.title.toLowerCase().includes("oh baby")) : undefined) ??
    (q.includes("hype") ? videos.find((v) => v.title.toLowerCase().includes("dirty")) : undefined) ??
    videos[0];
  return `You should try "${match.title}". I got squirrel instincts for bangers.`;
}

export default function MrBigNutsWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "I'm Mr Big Nuts. Ask for your vibe and I’ll roast you and pick a song.",
    },
  ]);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const send = () => {
    if (!canSend) return;
    const text = draft.trim();
    setDraft("");
    setMsgs((m) => [
      ...m,
      { role: "user", text },
      { role: "bot", text: `${recommendSong(text)} Also... your aux better be ready.` },
    ]);
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
              onClick={send}
              className="rounded-lg bg-gold-300 px-3 py-2 text-sm font-semibold text-ink-950"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
