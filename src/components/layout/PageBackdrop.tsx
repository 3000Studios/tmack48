import { useLocation } from "react-router-dom";
import { backdropVariantForPath, BACKDROP_PRESETS } from "@/lib/pageBackdropVariant";

/**
 * Fixed wallpaper behind all page content (z above body bg, below chrome).
 *
 * PERF (2026-10-18): the full-screen Three.js/WebGL scene that used to live
 * here ran a continuous render loop on EVERY page (transmission material +
 * HDR environment fetch + ~250 sparkles) and was the site's main source of
 * scroll jank / "lagging all over the place". It is replaced by the static
 * gradient + CSS vortex that already served as its fallback — same gold /
 * chill / rim identity per page variant, zero JS, zero GPU render loop.
 */
export default function PageBackdrop() {
  const { pathname } = useLocation();
  const variant = backdropVariantForPath(pathname);
  const preset = BACKDROP_PRESETS[variant];

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(212,175,55,0.14),transparent_52%),radial-gradient(ellipse_90%_60%_at_80%_100%,rgba(127,219,255,0.08),transparent_45%),#020202]"
        style={{ zIndex: 0 }}
      />
      {/* Per-variant color wash (replaces the WebGL scene's accent lighting) */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: `radial-gradient(ellipse 70% 50% at 50% 38%, ${preset.accent}26 0%, transparent 62%), radial-gradient(ellipse 45% 35% at 82% 88%, ${preset.chill}1f 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 12% 78%, ${preset.rim}14 0%, transparent 60%)`,
        }}
      />
      {/* CSS vortex (all pages) — cheap compositor animation, no JS loop */}
      <div className="vortex-layer absolute inset-0 motion-reduce:opacity-40" style={{ zIndex: 1 }} />
      <div
        className="noise-overlay absolute inset-0 opacity-[0.04]"
        style={{ zIndex: 2, pointerEvents: "none" }}
      />
    </div>
  );
}
