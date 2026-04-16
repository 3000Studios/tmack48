import type { Video } from "@/data/videos";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackVideo } from "@/lib/analytics";

interface Props {
  videos: Video[];
  direction?: "left" | "right";
  speed?: number;
  onOpen?: (v: Video) => void;
}

export default function VideoMarquee({ videos, direction = "left", speed = 50, onOpen }: Props) {
  const reduced = useReducedMotion();
  const items = [...videos, ...videos];
  const anim = direction === "left" ? "marquee" : "marquee-reverse";

  return (
    <div className="relative mask-fade-both overflow-hidden">
      <ul
        className="flex w-max gap-6 py-2 will-change-transform"
        style={{
          animation: reduced ? undefined : `${anim} ${speed}s linear infinite`,
        }}
        onMouseEnter={(e) => {
          if (!reduced) (e.currentTarget as HTMLUListElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          if (!reduced) (e.currentTarget as HTMLUListElement).style.animationPlayState = "running";
        }}
      >
        {items.map((v, i) => (
          <li key={`${v.id}-${i}`} className="shrink-0">
            <button
              type="button"
              onClick={() => {
                trackVideo("open", v.videoId);
                onOpen?.(v);
              }}
              className="group relative block w-64 sm:w-72 overflow-hidden rounded-2xl metal-border focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              aria-label={`Open ${v.title}`}
            >
              <div className="aspect-video-frame relative overflow-hidden">
                <img
                  src={v.thumbnailHqUrl}
                  alt={v.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="text-sm font-semibold text-platinum drop-shadow line-clamp-2">
                    {v.title}
                  </span>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
