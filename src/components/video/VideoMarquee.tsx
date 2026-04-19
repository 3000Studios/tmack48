import { useEffect, useRef, useState } from "react";
import type { Video } from "@/data/videos";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buildEmbedUrl } from "@/lib/youtube";
import { trackVideo } from "@/lib/analytics";

interface Props {
  videos: Video[];
  direction?: "left" | "right";
  speed?: number;
  onOpen?: (v: Video) => void;
}

export default function VideoMarquee({ videos, direction = "left", speed = 50, onOpen }: Props) {
  const reduced = useReducedMotion();
  const [interacting, setInteracting] = useState(false);
  const items = [...videos, ...videos];
  const anim = direction === "left" ? "marquee" : "marqueeReverse";
  const hostRef = useRef<HTMLUListElement | null>(null);
  const [inView, setInView] = useState(false);

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
      { rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  return (
    <div className="relative mask-fade-both overflow-hidden">
      <ul
        ref={hostRef}
        data-marquee-track="true"
        data-marquee-direction={direction}
        className="flex w-max gap-6 py-2 will-change-transform"
        style={{
          animation: reduced ? undefined : `${anim} ${speed}s linear infinite`,
          animationPlayState: reduced || !interacting ? "running" : "paused",
        }}
        onMouseEnter={() => {
          if (!reduced) setInteracting(true);
        }}
        onMouseLeave={() => {
          if (!reduced) setInteracting(false);
        }}
        onFocus={() => {
          if (!reduced) setInteracting(true);
        }}
        onBlur={() => {
          if (!reduced) setInteracting(false);
        }}
      >
        {items.map((v, i) => {
          return (
          <li key={`${v.id}-${i}`} className="shrink-0">
            <button
              type="button"
              onTouchStart={() => {
                if (!reduced) setInteracting(true);
              }}
              onTouchEnd={() => {
                if (!reduced) setInteracting(false);
              }}
              onTouchCancel={() => {
                if (!reduced) setInteracting(false);
              }}
              onClick={() => {
                trackVideo("open", v.videoId);
                onOpen?.(v);
              }}
              className="group relative block w-[min(85vw,36rem)] sm:w-[36rem] overflow-hidden rounded-2xl metal-border focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              aria-label={`Open ${v.title}`}
            >
              <div className="aspect-video-frame relative overflow-hidden">
                <iframe
                  title={`${v.title} preview`}
                  src={
                    inView
                      ? buildEmbedUrl(v.videoId, {
                          autoplay: true,
                          mute: true,
                          loop: true,
                          controls: false,
                          enableJsApi: false,
                        })
                      : ""
                  }
                  allow="autoplay; encrypted-media; picture-in-picture"
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full border-0"
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
          );
        })}
      </ul>
    </div>
  );
}
