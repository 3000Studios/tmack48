import { Link } from "react-router-dom";

/**
 * TMACK48 logo — Boss order 2026-11-07 (evening): the old static gold
 * BLOCK ("T48" in a square) is gone. The new mark is a living badge:
 * a gold ring that slowly rotates its sheen around a dark disc, with
 * five equalizer bars bouncing inside like the music is always playing,
 * and a soft gold pulse for a glow. Pure CSS/SVG — no image weight.
 * Reduced-motion visitors get the still badge (see index.css).
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="TMACK48 — TaylorMade Hits home"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <span className="logo-badge relative grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full">
        {/* rotating gold sheen ring */}
        <span
          aria-hidden
          className="logo-ring absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #8d7220, #ffe29a, #d4af37, #fff3c4, #8d7220, #d4af37, #ffe29a, #8d7220)",
          }}
        />
        {/* dark inner disc */}
        <span className="absolute inset-[3px] rounded-full bg-[#070604] shadow-[inset_0_1px_0_rgba(255,226,154,0.25)]" />
        {/* equalizer bars + monogram */}
        <span className="relative flex flex-col items-center justify-center gap-[3px]">
          <span className="flex h-[13px] items-end gap-[2.5px]" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="logo-eq-bar block w-[3px] rounded-full bg-gradient-to-t from-[#8d7220] via-[#d4af37] to-[#ffeaa6]"
                style={{
                  height: "100%",
                  animationDelay: `${i * 0.13}s`,
                  animationDuration: `${0.9 + (i % 3) * 0.17}s`,
                }}
              />
            ))}
          </span>
          <span className="font-display text-[10px] font-black leading-none tracking-[0.08em] text-[#ffe29a]">
            T48
          </span>
        </span>
      </span>
      <span className="hidden sm:flex flex-col leading-tight">
        <span className="display-title text-lg font-black tracking-wide gold-text">TMACK48</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-platinum/60">TaylorMade Hits</span>
      </span>
    </Link>
  );
}
