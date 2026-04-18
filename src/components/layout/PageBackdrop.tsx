import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { backdropVariantForPath } from "@/lib/pageBackdropVariant";

const Hero3D = lazy(() => import("@/components/effects/Hero3D"));

/**
 * Fixed wallpaper + Three.js layer behind all page content (z above body bg, below chrome).
 * Pointer-events none so taps/clicks reach UI; motion uses window-level mouse + deviceorientation.
 */
export default function PageBackdrop() {
  const { pathname } = useLocation();
  const variant = backdropVariantForPath(pathname);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden motion-reduce:hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(212,175,55,0.14),transparent_52%),radial-gradient(ellipse_90%_60%_at_80%_100%,rgba(127,219,255,0.08),transparent_45%),#020202]"
        style={{ zIndex: 0 }}
      />
      <Suspense
        fallback={
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.08),transparent_65%)]"
            style={{ zIndex: 1 }}
          />
        }
      >
        <Hero3D variant={variant} className="opacity-[0.88]" />
      </Suspense>
      <div
        className="noise-overlay absolute inset-0 opacity-[0.035]"
        style={{ zIndex: 2, pointerEvents: "none" }}
      />
    </div>
  );
}
