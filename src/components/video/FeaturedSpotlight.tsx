import { useEffect, useState } from "react";
import type { Video } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import Reveal from "@/components/effects/Reveal";
import { ArrowRightIcon, HeartIcon, PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta, trackVideo } from "@/lib/analytics";
import { Link } from "react-router-dom";

export default function FeaturedSpotlight({
  pool,
}: {
  pool: Video[];
}) {
  const [video, setVideo] = useState<Video | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!pool.length) return;
    const featured = pool.filter((v) => v.featured);
    const source = featured.length ? featured : pool;
    const interval = setInterval(() => {
      setVideo((v) => {
        const idx = v ? source.findIndex((x) => x.videoId === v.videoId) : -1;
        const next = source[(idx + 1) % source.length];
        return next;
      });
      setPlaying(false);
    }, 9000);
    setVideo(source[Math.floor(Math.random() * source.length)]);
    return () => clearInterval(interval);
  }, [pool]);

  if (!video) return null;

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
                      onError={(e) => (e.currentTarget.src = video.thumbnailHqUrl)}
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
