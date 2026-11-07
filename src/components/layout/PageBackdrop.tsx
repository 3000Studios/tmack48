import { useLocation } from "react-router-dom";
import { backdropVariantForPath, BACKDROP_PRESETS } from "@/lib/pageBackdropVariant";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Fixed wallpaper behind all page content (z above body bg, below chrome).
 *
 * Boss order 2026-11-07: the body wallpaper is his Tmack48 alley film —
 * the gold TMACK48 MUSIC wall in the rain, looping full-viewport behind
 * every page (poster frame for reduced motion). It supersedes the
 * 2026-11-06 spotlight rig as the wallpaper; the per-variant color wash
 * stays as a light tint layer, and header/footer carry the clear-water
 * surface with gold ripples (see LiquidWater), blended to this scene.
 */
export default function PageBackdrop() {
  const { pathname } = useLocation();
  const variant = backdropVariantForPath(pathname);
  const preset = BACKDROP_PRESETS[variant];
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(212,175,55,0.14),transparent_52%),radial-gradient(ellipse_90%_60%_at_80%_100%,rgba(127,219,255,0.08),transparent_45%),#020202]"
        style={{ zIndex: 0 }}
      />
      {/* The alley wallpaper film (Boss-supplied, 2026-11-07) */}
      {reduced ? (
        <img
          src="/wallpaper/tmack48-alley.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 1, objectPosition: "62% 50%", filter: "brightness(0.6)" }}
        />
      ) : (
        <video
          src="/wallpaper/tmack48-alley.mp4"
          poster="/wallpaper/tmack48-alley.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 1, objectPosition: "62% 50%", filter: "brightness(0.6)" }}
        />
      )}
      {/* Legibility veil — darker at the edges, lets the wall breathe mid-frame */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(180deg, rgba(2,2,2,0.55) 0%, rgba(2,2,2,0.18) 22%, rgba(2,2,2,0.12) 55%, rgba(2,2,2,0.5) 100%)",
        }}
      />
      {/* Per-variant color wash — tints the wallpaper per page */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 3,
          background: `radial-gradient(ellipse 70% 50% at 50% 38%, ${preset.accent}1a 0%, transparent 62%), radial-gradient(ellipse 45% 35% at 82% 88%, ${preset.chill}14 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 12% 78%, ${preset.rim}0f 0%, transparent 60%)`,
        }}
      />
      <div className="noise-overlay absolute inset-0 opacity-[0.04]" style={{ zIndex: 4, pointerEvents: "none" }} />
    </div>
  );
}
