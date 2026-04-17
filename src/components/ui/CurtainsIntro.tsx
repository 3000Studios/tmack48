import { useEffect, useMemo, useState } from "react";

const INTRO_KEY = "tmack48_curtains_seen_v1";
const INTRO_MS = 5400;
const CURTAINS_VIDEO = "https://www.youtube-nocookie.com/embed/6u1QtgViGfg?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1";

export default function CurtainsIntro() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(INTRO_KEY) === "1";
    if (!seen) {
      setOpen(true);
      window.sessionStorage.setItem(INTRO_KEY, "1");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), INTRO_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  const wrapClass = useMemo(
    () =>
      [
        "fixed inset-0 z-[120] transition-opacity duration-700",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" "),
    [open]
  );

  return (
    <div className={wrapClass} aria-hidden={!open}>
      <div className="absolute inset-0 bg-black" />
      <iframe
        title="Curtains intro"
        src={CURTAINS_VIDEO}
        allow="autoplay; encrypted-media; picture-in-picture"
        className="absolute inset-0 h-full w-full"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-4 top-4 rounded-lg border border-gold-300/55 bg-black/70 px-3 py-2 text-xs uppercase tracking-[0.22em] text-gold-200"
      >
        Skip Intro
      </button>
    </div>
  );
}
