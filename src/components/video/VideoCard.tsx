import { useEffect, useMemo, useRef, useState } from "react";
import type { Video } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import TiltCard from "@/components/effects/TiltCard";
import { PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackVideo } from "@/lib/analytics";

interface Props {
  video: Video;
  priority?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  onOpen?: (v: Video) => void;
}

export default function VideoCard({ video, priority = false, className = "", size = "md", onOpen }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(priority);
  const [titleKick, setTitleKick] = useState(0);
  const sizeClass =
    size === "sm" ? "rounded-2xl" : size === "lg" ? "rounded-4xl" : "rounded-3xl";

  const titleFx = useMemo(() => {
    const s = `${video.id}:${video.videoId}:${video.title}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 5;
  }, [video.id, video.title, video.videoId]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || inView) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "250px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setTitleKick((v) => v + 1);
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const open = () => {
    trackVideo("open", video.videoId);
    onOpen?.(video);
  };

  return (
    <TiltCard className={`card-premium ${sizeClass} ${className}`}>
      <div ref={hostRef} className="relative aspect-video-frame w-full overflow-hidden rounded-[inherit]">
        <iframe
          title={`${video.title} preview`}
          src={
            inView
              ? buildEmbedUrl(video.videoId, {
                  autoplay: true,
                  mute: true,
                  loop: true,
                  controls: false,
                  enableJsApi: false,
                })
              : ""
          }
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          loading={priority ? "eager" : "lazy"}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />

        <button
          type="button"
          onClick={open}
          className="group absolute inset-0 block h-full w-full text-left focus:outline-none"
          aria-label={`Open ${video.title}`}
        >
          <div className="absolute inset-0 grid place-items-center">
            <span
              className="grid h-16 w-16 place-items-center rounded-full text-ink-950 transition-all group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg,#FFE29A,#D4AF37,#8D7220)",
                boxShadow:
                  "0 20px 60px -15px rgba(212,175,55,0.7), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <PlayIcon className="h-7 w-7 translate-x-[2px]" />
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3
              key={`${video.id}-${titleKick}`}
              className={`video-title video-title-fx-${titleFx} display-title text-lg sm:text-xl font-bold text-platinum drop-shadow-md line-clamp-2`}
            >
              {video.title}
            </h3>
            {video.blurb && (
              <p className="mt-1 hidden sm:block text-xs text-platinum/70 line-clamp-1">{video.blurb}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="chip">{video.category}</span>
              {video.featured && <span className="chip chip-active">Featured</span>}
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 px-5 py-3">
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackVideo("watch_on_youtube", video.videoId)}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-300 hover:text-gold-200"
        >
          <YoutubeIcon className="h-4 w-4" /> Watch on YouTube
        </a>
        <button
          type="button"
          onClick={open}
          className="text-xs font-medium uppercase tracking-[0.2em] text-platinum/70 hover:text-gold-200"
        >
          Open →
        </button>
      </div>
    </TiltCard>
  );
}
