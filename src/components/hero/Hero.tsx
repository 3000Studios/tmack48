import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AmbientParticles from "@/components/effects/AmbientParticles";
import { siteConfig } from "@/data/siteConfig";
import type { Video } from "@/data/videos";
import { buildEmbedUrl, YOUTUBE_EMBED_MESSAGE_ORIGIN } from "@/lib/youtube";
import { HeartIcon, PlayIcon, SoundOffIcon, SoundOnIcon, SparkleIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

export default function Hero({ video }: { video: Video }) {
  const [muted, setMuted] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [spot, setSpot] = useState({ x: 50, y: 18 });
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setShowPlayer(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const heroEmbedSrc = useMemo(
    () =>
      buildEmbedUrl(video.videoId, {
        autoplay: true,
        mute: true,
        loop: true,
        controls: true,
        enableJsApi: true,
      }),
    [video.videoId]
  );

  const toggleMute = () => {
    if (!iframeRef.current) return;
    const next = !muted;
    setMuted(next);
    try {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: next ? "mute" : "unMute",
          args: [],
        }),
        YOUTUBE_EMBED_MESSAGE_ORIGIN
      );
    } catch {
      iframeRef.current.src = buildEmbedUrl(video.videoId, {
        autoplay: true,
        mute: next,
        loop: true,
        controls: true,
        enableJsApi: true,
      });
    }
  };

  return (
    <section
      aria-label="TMACK48 hero"
      className="relative isolate overflow-hidden min-h-[92dvh] lg:min-h-[100dvh] flex items-center"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setSpot({ x, y });
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (!t) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((t.clientX - rect.left) / rect.width) * 100;
        const y = ((t.clientY - rect.top) / rect.height) * 100;
        setSpot({ x, y });
      }}
    >
      <AmbientParticles className="opacity-60" count={80} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-150"
        style={{
          background: `radial-gradient(420px 420px at ${spot.x}% ${spot.y}%, rgba(212,175,55,0.5), rgba(212,175,55,0.1) 40%, transparent 72%)`,
        }}
      />
      <div className="noise-overlay" />

      <div className="relative container-lux grid gap-8 lg:grid-cols-12 items-center py-12 sm:py-14 lg:py-20">
        <div className="lg:col-span-6 relative z-10 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow flex items-center gap-2"
          >
            <SparkleIcon className="h-4 w-4 text-gold-300" />
            Official Artist Universe
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 display-title font-black text-4xl sm:text-5xl lg:text-[6.5rem] leading-[0.9] tracking-tight"
          >
            <span className="gold-text">TMACK</span>
            <span className="platinum-text">48</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-5 max-w-xl text-lg sm:text-xl text-platinum/80 leading-relaxed text-balance"
          >
            Luxury-flashy music, cinematic visuals, and relentless energy. Press play, feel the grind,
            and watch the movement take over.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-10 overflow-hidden rounded-2xl border border-gold-300/20 bg-black/35 px-4 py-3"
          >
            <div
              className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform"
              style={{ animation: "marquee 32s linear infinite" }}
            >
              {[
                { label: "Videos", value: siteConfig.stats.videos },
                { label: "Years", value: siteConfig.stats.years },
                { label: "Fans", value: siteConfig.stats.fans },
                { label: "Moves", value: siteConfig.stats.moves },
              ]
                .concat([
                  { label: "Videos", value: siteConfig.stats.videos },
                  { label: "Years", value: siteConfig.stats.years },
                  { label: "Fans", value: siteConfig.stats.fans },
                  { label: "Moves", value: siteConfig.stats.moves },
                ])
                .map((s, i) => (
                  <div key={`${s.label}-${i}`} className="inline-flex items-center gap-2 text-sm">
                    <span className="gold-text font-bold">{s.value}</span>
                    <span className="uppercase tracking-[0.25em] text-platinum/70">{s.label}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative z-10 w-full max-w-3xl lg:ml-auto"
        >
          <div className="relative rounded-[1.25rem] sm:rounded-[1.5rem] card-premium overflow-hidden shadow-gold-xl ring-2 ring-gold-400 ring-offset-4 ring-offset-black">
            <div className="aspect-video-frame relative overflow-hidden bg-black">
              {showPlayer ? (
                <iframe
                  key={video.videoId}
                  ref={iframeRef}
                  title={video.title}
                  src={heroEmbedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <img
                  src={video.thumbnailMaxUrl}
                  onError={(e) => {
                    e.currentTarget.src = video.thumbnailHqUrl;
                  }}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-black/40" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="chip chip-active">Now Playing</span>
                <h2 className="mt-2 display-title text-2xl sm:text-3xl font-bold text-platinum drop-shadow">
                  {video.title}
                </h2>
                {video.blurb && <p className="mt-1 text-sm text-platinum/70 line-clamp-2">{video.blurb}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-5 py-3">
              <button
                type="button"
                onClick={toggleMute}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-platinum/80 hover:text-gold-200"
                aria-label={muted ? "Unmute hero" : "Mute hero"}
              >
                {muted ? <SoundOffIcon className="h-4 w-4" /> : <SoundOnIcon className="h-4 w-4" />}
                {muted ? "Unmute" : "Mute"}
              </button>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCta("hero_watch_on_youtube")}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold-300 hover:text-gold-200"
              >
                <YoutubeIcon className="h-4 w-4" /> Watch on YouTube
              </a>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/videos" onClick={() => trackCta("hero_watch_now")} className="btn-gold glint text-base">
              <PlayIcon className="h-5 w-5" /> Watch Now
            </Link>
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("hero_subscribe")}
              className="btn-ghost text-base"
            >
              <YoutubeIcon className="h-5 w-5" /> Subscribe on YouTube
            </a>
            <Link to="/support" onClick={() => trackCta("hero_support")} className="btn-diamond text-base">
              <HeartIcon className="h-5 w-5" /> Support the Artist
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.4em] text-platinum/60">
        <span>Scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-gold-400 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
