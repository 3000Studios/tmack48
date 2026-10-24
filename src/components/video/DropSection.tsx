import type { Video } from "@/data/videos";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInViewport } from "@/hooks/useInViewport";
import { ArrowRightIcon, PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

interface Props {
  video: Video;
  title: string;
  copy: string;
  side: "left" | "right";
  onOpen?: (v: Video) => void;
  index: number;
}

/**
 * PERF (2026-10-24): the entrance animations were framer-motion variants;
 * they are now the .drop-card / .drop-copy CSS transitions in
 * styles/index.css, driven by the same useInViewport hook — identical
 * hinge-drop and slide-in values, no motion library in the bundle.
 */
export default function DropSection({ video, title, copy, side, onOpen, index }: Props) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>();

  const order = side === "left" ? "" : "lg:[&>div:first-child]:order-2";
  const shown = reduced || inView;

  return (
    <section ref={ref} className="section">
      <div className={`grid gap-10 lg:grid-cols-12 items-center ${order}`}>
        <div
          className={`${reduced ? "" : "drop-card"} ${shown ? "in" : ""} lg:col-span-7 ${side === "right" ? "lg:col-start-6" : ""}`}
        >
          <button
            type="button"
            onClick={() => onOpen?.(video)}
            className="group card-premium aspect-video-frame relative w-full overflow-hidden shadow-gold-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={video.thumbnailMaxUrl}
              onError={(e) => {
                e.currentTarget.src = video.thumbnailHqUrl;
              }}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-grad text-ink-950 shadow-gold-xl transition-transform duration-300 group-hover:scale-110">
                <PlayIcon className="h-7 w-7 translate-x-[2px]" />
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="chip chip-active">Featured drop</span>
              <p className="mt-2 display-title text-xl font-bold text-platinum drop-shadow line-clamp-2">
                {video.title}
              </p>
            </div>
          </button>
        </div>

        <div
          className={`${reduced ? "" : "drop-copy"} ${shown ? "in" : ""} lg:col-span-5 ${side === "right" ? "lg:col-start-1 lg:row-start-1" : ""}`}
          style={reduced ? undefined : ({ "--drop-x": side === "left" ? "40px" : "-40px" } as React.CSSProperties)}
        >
          <span className="eyebrow">Drop {String(index + 1).padStart(2, "0")}</span>
          <h2 className="mt-2 section-title">
            <span className={index % 2 ? "platinum-text" : "gold-text"}>{title}</span>
          </h2>
          <p className="mt-5 text-platinum/80 text-lg leading-relaxed text-balance">{copy}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => onOpen?.(video)} className="btn-gold">
              <PlayIcon className="h-5 w-5" /> Play
            </button>
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("drop_watch_on_youtube", { id: video.videoId })}
              className="btn-ghost"
            >
              <YoutubeIcon className="h-5 w-5" /> Watch on YouTube
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
