import { useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import AmbientParticles from "@/components/effects/AmbientParticles";
import HeroCarousel from "@/components/hero/HeroCarousel";
import type { Video } from "@/data/videos";
import { HeartIcon, SparkleIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";
import { siteConfig } from "@/data/siteConfig";
import { useSiteOverrides } from "@/lib/siteOverrides";

/**
 * Hero — Boss order 2026-11-07 (evening): the old single Now Playing
 * player card is replaced by the U-shaped top-videos carousel (auto-
 * scrolling, swipeable, tap-to-lift-and-play), and the JUST BUSTED
 * 1,000-subscriber card moves BELOW the carousel.
 */
export default function Hero({ video, playlist }: { video: Video; playlist?: Video[] }) {
  // Admin editor overrides — hero words + banner are editable live.
  const ov = useSiteOverrides();
  const pool = useMemo(() => (playlist && playlist.length ? playlist : [video]), [playlist, video]);
  const initialIndex = useMemo(
    () => Math.max(0, pool.findIndex((v) => v.id === video.id)),
    [pool, video.id]
  );
  // PERF: spotlight position lives in a ref + direct DOM style write.
  const spotRef = useRef<HTMLDivElement | null>(null);

  const moveSpot = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const el = spotRef.current;
    if (!el) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    el.style.background = `radial-gradient(420px 420px at ${x}% ${y}%, rgba(212,175,55,0.5), rgba(212,175,55,0.1) 40%, transparent 72%)`;
  }, []);

  return (
    <section
      aria-label="TMACK48 hero"
      className="relative isolate overflow-hidden lg:min-h-[100dvh] lg:flex lg:items-center"
      onMouseMove={(e) => {
        moveSpot(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (!t) return;
        moveSpot(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
      }}
    >
      <AmbientParticles className="opacity-60" count={40} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(420px 420px at 50% 18%, rgba(212,175,55,0.5), rgba(212,175,55,0.1) 40%, transparent 72%)`,
        }}
      />
      <div className="noise-overlay" />

      <div className="relative container-lux py-8 sm:py-12 lg:py-20 w-full">
        <div className="grid gap-7 lg:gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 relative z-10 max-w-2xl min-w-0">
            <p className="hero-in eyebrow flex items-center gap-2" style={{ animationDuration: "0.8s" }}>
              <SparkleIcon className="h-4 w-4 text-gold-300" />
              TaylorMade Hits · Official Artist Universe
            </p>

            <h1
              className="hero-in mt-4 display-title font-black text-[clamp(3rem,9vw,6.25rem)] leading-[0.92] tracking-tight"
              style={{ animationDuration: "1s", animationDelay: "0.1s" }}
            >
              {ov.heroHeading ? (
                <span className="gold-text">{ov.heroHeading}</span>
              ) : (
                <>
                  <span className="gold-text">TMACK</span>
                  <span className="platinum-text">48</span>
                </>
              )}
            </h1>

            <p
              className="hero-in mt-5 max-w-xl text-lg sm:text-xl text-white font-semibold drop-shadow-md leading-relaxed text-balance"
              style={{ animationDuration: "0.9s", animationDelay: "0.3s" }}
            >
              {ov.heroSubtext ||
                "Luxury-flashy music, cinematic visuals, and relentless energy. Press play, feel the grind, and watch the movement take over."}
            </p>
          </div>

          <div
            className="hero-in lg:col-span-6 relative z-10 w-full min-w-0"
            style={{ animationDuration: "1s", animationDelay: "0.35s" }}
          >
            <HeroCarousel pool={pool} initialIndex={initialIndex} />
            <div className="mt-4 sm:mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to="/support"
                onClick={() => trackCta("hero_support")}
                className="btn-diamond !px-4 !py-2 text-xs sm:text-sm"
              >
                <HeartIcon className="h-5 w-5" /> Support the Artist
              </Link>
            </div>
          </div>
        </div>

        {/* JUST BUSTED — below the carousel (Boss order 2026-11-07);
            title/text/visibility are editable in the admin editor */}
        {ov.bannerEnabled !== false && (
          <div
            className="hero-in milestone-banner mx-auto mt-10 max-w-3xl text-center lg:mt-14"
            style={{ animationDuration: "0.9s", animationDelay: "0.05s" }}
          >
            <p className="milestone-title">{ov.bannerTitle || "JUST BUSTED 1,000 SUBSCRIBERS ON YOUTUBE"}</p>
            <p className="mt-1 text-sm text-platinum/85">
              {ov.bannerText || "TaylorMade Hits just crossed 1K — thank you. Join the next 1,000."}
            </p>
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("hero_subscribe_1k")}
              className="btn-gold glint mt-3 !px-6 !py-3 text-sm font-black uppercase tracking-widest"
            >
              <SparkleIcon className="h-4 w-4" /> Subscribe — @TaylorMadeHits
            </a>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.4em] text-platinum/60">
        <span>Scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-gold-400 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
