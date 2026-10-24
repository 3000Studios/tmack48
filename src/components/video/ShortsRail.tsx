import { Link } from "react-router-dom";
import type { Video } from "@/data/videos";
import { PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackVideo } from "@/lib/analytics";
import { useInViewport } from "@/hooks/useInViewport";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * PERF (2026-10-24): cards used framer-motion whileInView — now the
 * .rail-card CSS transition driven by useInViewport (same rise, same
 * 0.05s-per-card stagger), so the motion library leaves the bundle.
 */
function ShortCard({
  v,
  i,
  onOpen,
}: {
  v: Video;
  i: number;
  onOpen?: (v: Video) => void;
}) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLButtonElement>(
    { threshold: 0.3 },
    true,
  );
  const shown = reduced || inView;
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        trackVideo("open", v.videoId);
        onOpen?.(v);
      }}
      className={`${reduced ? "" : "rail-card"} ${shown ? "in" : ""} group relative shrink-0 w-48 sm:w-56 aspect-[9/16] rounded-3xl overflow-hidden metal-border snap-start`}
      style={reduced ? undefined : { transitionDelay: `${i * 0.05}s` }}
      aria-label={`Open ${v.title}`}
    >
      <img
        src={v.thumbnailHqUrl}
        alt={v.title}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = "/golden-acorn.svg";
        }}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-full"
          style={{
            background: "linear-gradient(135deg,#B9F2FF,#7FDBFF,#48A9C5)",
          }}
        >
          <PlayIcon className="h-6 w-6 text-ink-950 translate-x-[2px]" />
        </span>
      </div>
      <div className="absolute left-0 right-0 bottom-0 p-3">
        <p className="text-sm font-semibold text-platinum line-clamp-2 drop-shadow">{v.title}</p>
        <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-platinum/60">
          <YoutubeIcon className="h-3.5 w-3.5" /> Short
        </div>
      </div>
    </button>
  );
}

export default function ShortsRail({
  videos,
  onOpen,
}: {
  videos: Video[];
  onOpen?: (v: Video) => void;
}) {
  const tagged = videos.filter((v) => v.tags.includes("short") || v.category === "short");
  const shorts = (tagged.length ? tagged : videos).slice(0, 8);
  return (
    <section className="section">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow">Shorts / Reels</span>
          <h2 className="mt-2 section-title">
            <span className="diamond-text">Quick Hits</span>
          </h2>
        </div>
        <Link to="/videos#shorts" className="btn-ghost text-sm">
          All Shorts →
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory mask-fade-both -mx-2 px-2">
        {shorts.map((v, i) => (
          <ShortCard key={v.id} v={v} i={i} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
