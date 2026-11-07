import { useLocation } from "react-router-dom";
import { backdropVariantForPath, BACKDROP_PRESETS } from "@/lib/pageBackdropVariant";
import SpotlightBackdrop from "@/components/effects/SpotlightBackdrop";

/**
 * Fixed wallpaper behind all page content (z above body bg, below chrome).
 *
 * Boss order 2026-11-06: the body wallpaper is a living spotlight rig —
 * music-responsive (a 116 BPM band engine drives cone width, brightness
 * and sweep like an EQ) and mouse/hover-responsive (beams bend to the
 * pointer and flare onto hovered links, buttons and tiles). Header and
 * footer carry the Space Water surface instead (see LiquidWater).
 * The per-variant color wash stays as the rig's tint layer.
 */
export default function PageBackdrop() {
  const { pathname } = useLocation();
  const variant = backdropVariantForPath(pathname);
  const preset = BACKDROP_PRESETS[variant];

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(212,175,55,0.14),transparent_52%),radial-gradient(ellipse_90%_60%_at_80%_100%,rgba(127,219,255,0.08),transparent_45%),#020202]"
        style={{ zIndex: 0 }}
      />
      {/* Per-variant color wash — tints the spotlight rig per page */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: `radial-gradient(ellipse 70% 50% at 50% 38%, ${preset.accent}26 0%, transparent 62%), radial-gradient(ellipse 45% 35% at 82% 88%, ${preset.chill}1f 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 12% 78%, ${preset.rim}14 0%, transparent 60%)`,
        }}
      />
      {/* The spotlight rig (canvas) */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <SpotlightBackdrop />
      </div>
      <div className="noise-overlay absolute inset-0 opacity-[0.04]" style={{ zIndex: 2, pointerEvents: "none" }} />
    </div>
  );
}
