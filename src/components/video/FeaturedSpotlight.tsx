import { useEffect, useMemo, useState } from "react";
import type { Video } from "@/data/videos";
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
  const dragRef = useMemo(() => ({ x0: 0, t0: 0, active: false }), []);

  if (!source.length) return null;
  const safeIdx = ((idx % source.length) + source.length) % source.length;
  const video = source[safeIdx];
  const prev = () => {
    setIdx((v) => v - 1);
  };
  const next = () => {
    setIdx((v) => v + 1);
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((v) => v + 1);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="featured" className="section">
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <div className="mt-4 flex items-center justify-center gap-2">
              <button type="button" onClick={prev} className="btn-ghost !px-4 !py-2.5">
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
              </button>
              <div
                className="relative h-40 w-full max-w-3xl overflow-hidden touch-pan-y"
                onPointerDown={(e) => {
                  dragRef.active = true;
                  dragRef.x0 = e.clientX;
                  dragRef.t0 = performance.now();
                }}
                onPointerUp={(e) => {
                  if (!dragRef.active) return;
                  dragRef.active = false;
                  const dx = e.clientX - dragRef.x0;
                  const dt = performance.now() - dragRef.t0;
                  if (dt < 900 && Math.abs(dx) > 48) {
                    if (dx < 0) next();
                    else prev();
                  }
                }}
                onPointerCancel={() => {
                  dragRef.active = false;
                }}
              >
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
                  trackVideo("play", video.videoId);
                }}
                className="btn-gold"
              >
                <PlayIcon className="h-5 w-5" /> Open Video
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
