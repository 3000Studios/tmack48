import { useEffect, useMemo, useState } from "react";
import type { Video } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import Reveal from "@/components/effects/Reveal";
import { ArrowRightIcon, HeartIcon, PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta, trackVideo } from "@/lib/analytics";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FeaturedSpotlight({
  pool,
}: {
  pool: Video[];
}) {
  const source = useMemo(() => {
    const featured = pool.filter((v) => v.featured);
    return featured.length ? featured : pool;
  }, [pool]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (!source.length) return null;
  const safeIdx = ((idx % source.length) + source.length) % source.length;
  const video = source[safeIdx];
  const prev = () => {
    setIdx((v) => v - 1);
    setPlaying(false);
  };
  const next = () => {
    setIdx((v) => v + 1);
    setPlaying(false);
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((v) => v + 1);
      setPlaying(false);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="featured" className="section">
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <div className="card-premium overflow-hidden shadow-gold-xl">
              <div className="aspect-video-frame relative">
                {!playing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(true);
                      trackVideo("play", video.videoId);
                    }}
                    className="group absolute inset-0"
                    aria-label={`Play ${video.title}`}
                  >
                    <img
                      src={video.thumbnailMaxUrl}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== video.thumbnailHqUrl) {
                          img.src = video.thumbnailHqUrl;
                        } else {
                          img.src = "/golden-acorn.svg";
                        }
                      }}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span
                        className="grid h-24 w-24 place-items-center rounded-full animate-pulseGlow"
                        style={{
                          background: "linear-gradient(135deg,#FFE29A,#D4AF37,#8D7220)",
                        }}
                      >
                        <PlayIcon className="h-10 w-10 text-ink-950 translate-x-[3px]" />
                      </span>
                    </span>
                  </button>
                ) : (
                  <iframe
                    key={video.videoId}
                    title={video.title}
                    src={buildEmbedUrl(video.videoId, {
                      autoplay: true,
                      mute: true,
                      controls: true,
                      enableJsApi: true,
                    })}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                  />
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button type="button" onClick={prev} className="btn-ghost !px-4 !py-2.5">
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
              </button>
              <div className="relative h-40 w-full max-w-3xl overflow-hidden">
                <div className="absolute inset-0 grid place-items-center [perspective:1400px]">
                  {[-1, 0, 1].map((offset) => {
                    const cardIndex = ((safeIdx + offset) % source.length + source.length) % source.length;
                    const card = source[cardIndex];
                    const isCenter = offset === 0;
                    return (
                      <motion.button
                        key={`${card.videoId}-${offset}`}
                        type="button"
                        onClick={() => {
                          setIdx(cardIndex);
                          setPlaying(false);
                        }}
                        className="absolute h-32 w-[min(58vw,260px)] sm:w-[min(420px,60vw)] overflow-hidden rounded-2xl border border-gold-300/30 bg-black/60 shadow-[0_18px_55px_-28px_rgba(212,175,55,0.65)]"
                        animate={{
                          x: offset * 192,
                          rotateY: offset * -42,
                          rotateX: isCenter ? 0 : 6,
                          scale: isCenter ? 1.15 : 0.92,
                          opacity: isCenter ? 1 : 0.42,
                          zIndex: isCenter ? 3 : 1,
                        }}
                        transition={{ duration: 0.35 }}
                      >
                        <img
                          src={card.thumbnailHqUrl}
                          alt={card.title}
                          className={`h-full w-full object-cover transition-[filter,transform,opacity] duration-300 ${
                            isCenter ? "scale-[1.02]" : "scale-[0.98] blur-[0.6px] brightness-75 saturate-75"
                          }`}
                        />
                        {!isCenter && (
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <button type="button" onClick={next} className="btn-ghost !px-4 !py-2.5">
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <span className="eyebrow">Featured Spotlight</span>
            <h2 className="mt-2 section-title">
              <span className="gold-text">{video.title}</span>
            </h2>
            <p className="mt-5 text-platinum/80 text-lg leading-relaxed text-balance">
              {video.blurb ??
                "A signature moment from the TMACK48 catalog — cinematic, loud, and unmistakably on-brand."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setPlaying(true);
                  trackVideo("play", video.videoId);
                }}
                className="btn-gold"
              >
                <PlayIcon className="h-5 w-5" /> Play Now
              </button>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackVideo("watch_on_youtube", video.videoId)}
                className="btn-ghost"
              >
                <YoutubeIcon className="h-5 w-5" /> Watch on YouTube
              </a>
              <Link to="/support" onClick={() => trackCta("featured_support")} className="btn-diamond">
                <HeartIcon className="h-5 w-5" /> Support
              </Link>
            </div>

            <Link
              to="/videos"
              onClick={() => trackCta("featured_view_all")}
              className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-gold-300 hover:text-gold-200"
            >
              View all videos <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
