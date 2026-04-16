import { useState } from "react";
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
  const [playing, setPlaying] = useState(false);
  const sizeClass =
    size === "sm" ? "rounded-2xl" : size === "lg" ? "rounded-4xl" : "rounded-3xl";

  const play = () => {
    setPlaying(true);
    trackVideo("open", video.videoId);
    onOpen?.(video);
  };

  return (
    <TiltCard className={`card-premium ${sizeClass} ${className}`}>
      <div className="relative aspect-video-frame w-full overflow-hidden rounded-[inherit]">
        {!playing ? (
          <button
            type="button"
            onClick={play}
            className="group block h-full w-full text-left focus:outline-none"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={video.thumbnailHqUrl}
              alt={video.title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== video.thumbnailUrl) img.src = video.thumbnailUrl;
              }}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

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
              <h3 className="display-title text-lg sm:text-xl font-bold text-platinum drop-shadow-md line-clamp-2">
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
        ) : (
          <iframe
            title={video.title}
            src={buildEmbedUrl(video.videoId, { autoplay: true })}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="h-full w-full"
          />
        )}
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
        {!playing && (
          <button
            type="button"
            onClick={play}
            className="text-xs font-medium uppercase tracking-[0.2em] text-platinum/70 hover:text-gold-200"
          >
            Play here →
          </button>
        )}
      </div>
    </TiltCard>
  );
}
