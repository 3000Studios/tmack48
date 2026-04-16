import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Hero3D from "@/components/effects/Hero3D";
import AmbientParticles from "@/components/effects/AmbientParticles";
import { siteConfig } from "@/data/siteConfig";
import { getRandomFeatured, type Video } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import { HeartIcon, PlayIcon, SoundOffIcon, SoundOnIcon, SparkleIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

export default function Hero() {
  const initial = useMemo<Video>(() => getRandomFeatured(), []);
  const [video] = useState<Video>(initial);
  const [muted, setMuted] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Attempt to show the muted autoplay player after a tick so the 3D scene renders first.
    const t = setTimeout(() => setShowPlayer(true), 500);
    return () => clearTimeout(t);
  }, []);

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
        "*"
      );
    } catch {
      // If postMessage fails, reload the iframe with the new mute state
      iframeRef.current.src = buildEmbedUrl(video.videoId, {
        autoplay: true,
        mute: next,
        loop: true,
        controls: false,
      });
    }
  };

  return (
    <section
      aria-label="TMACK48 hero"
      className="relative isolate overflow-hidden min-h-[92dvh] lg:min-h-[100dvh] flex items-center"
    >
      {/* 3D background */}
      <Hero3D className="opacity-90" />

      {/* Ambient gold / diamond particles overlay */}
      <AmbientParticles className="opacity-60" count={80} />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
      <div className="noise-overlay" />

      {/* Background video layer */}
      {showPlayer && (
        <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen">
          <div className="absolute inset-0 scale-110 blur-md">
            <iframe
              ref={iframeRef}
              title="TMACK48 hero background"
              src={`${buildEmbedUrl(video.videoId, {
                autoplay: true,
                mute: true,
                loop: true,
                controls: false,
              })}&enablejsapi=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="h-full w-full"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      <div className="relative container-lux grid gap-10 lg:grid-cols-12 items-center py-16 lg:py-20">
        <div className="lg:col-span-7 relative z-10">
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
            className="mt-4 display-title font-black text-6xl sm:text-7xl lg:text-[9rem] leading-[0.9] tracking-tight"
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
            transition={{ duration: 0.9, delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/videos"
              onClick={() => trackCta("hero_watch_now")}
              className="btn-gold glint text-base"
            >
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
          </motion.div>

          {/* Stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl"
          >
            {[
              { label: "Videos", value: siteConfig.stats.videos },
              { label: "Years", value: siteConfig.stats.years },
              { label: "Fans", value: siteConfig.stats.fans },
              { label: "Moves", value: siteConfig.stats.moves },
            ].map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl px-4 py-3 text-center hover-lift"
              >
                <div className="gold-text display-title text-lg font-black">{s.value}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-platinum/60 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero featured pane */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative z-10"
        >
          <div className="relative rounded-[1.5rem] card-premium overflow-hidden shadow-gold-xl">
            <div className="aspect-video-frame relative overflow-hidden">
              <img
                src={video.thumbnailMaxUrl}
                onError={(e) => (e.currentTarget.src = video.thumbnailHqUrl)}
                alt={video.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <Link
                  to="/videos"
                  onClick={() => trackCta("hero_featured_watch")}
                  aria-label={`Play ${video.title}`}
                  className="grid h-20 w-20 place-items-center rounded-full text-ink-950 hover:scale-110 transition-transform animate-pulseGlow"
                  style={{
                    background: "linear-gradient(135deg,#FFE29A,#D4AF37,#8D7220)",
                  }}
                >
                  <PlayIcon className="h-8 w-8 translate-x-[2px]" />
                </Link>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="chip chip-active">Now Spinning</span>
                <h2 className="mt-2 display-title text-2xl sm:text-3xl font-bold text-platinum drop-shadow">
                  {video.title}
                </h2>
                {video.blurb && <p className="text-sm text-platinum/70 mt-1">{video.blurb}</p>}
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
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.4em] text-platinum/60">
        <span>Scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-gold-400 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
