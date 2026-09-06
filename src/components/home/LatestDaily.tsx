import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Video } from "@/data/videos";
import { posts } from "@/data/posts";
import { tracks } from "@/data/tracks";
import Reveal from "@/components/effects/Reveal";
import { ArrowRightIcon, PlayIcon, SparkleIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

export type DailyItem =
  | { kind: "video"; id: string; title: string; blurb: string; href: string; thumb?: string; meta: string; video: Video }
  | { kind: "news"; id: string; title: string; blurb: string; href: string; meta: string }
  | { kind: "music"; id: string; title: string; blurb: string; href: string; meta: string };

function dayKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function daySeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Auto-populated home rail: newest site content (videos + news + music)
 * with a daily-stable spotlight order so the section "updates" each day.
 */
export default function LatestDaily({
  videos,
  onOpenVideo,
}: {
  videos: Video[];
  onOpenVideo?: (v: Video) => void;
}) {
  const { key, items, headline } = useMemo(() => {
    const key = dayKey();
    const seed = daySeed(key);
    const newestVideos = videos.filter((v) => v.category !== "short").slice(0, 12);
    const shorts = videos.filter((v) => v.category === "short").slice(0, 4);

    const pool: DailyItem[] = [
      ...newestVideos.map((v) => ({
        kind: "video" as const,
        id: v.id,
        title: v.title,
        blurb: v.blurb ?? "Fresh from the TMACK48 vault.",
        href: `/videos`,
        thumb: v.thumbnailHqUrl,
        meta: v.featured ? "Featured video" : "Latest video",
        video: v,
      })),
      ...shorts.map((v) => ({
        kind: "video" as const,
        id: `short-${v.id}`,
        title: v.title,
        blurb: v.blurb ?? "Short-form heat.",
        href: `/shorts`,
        thumb: v.thumbnailHqUrl,
        meta: "Short",
        video: v,
      })),
      ...posts.slice(0, 4).map((p) => ({
        kind: "news" as const,
        id: p.slug,
        title: p.title,
        blurb: p.excerpt,
        href: `/news/${p.slug}`,
        meta: `${p.category} · ${p.readMinutes} min`,
      })),
      ...tracks.slice(0, 4).map((t) => ({
        kind: "music" as const,
        id: t.slug,
        title: t.title,
        blurb: t.blurb ?? "From the music & lyrics hub.",
        href: `/music/${t.slug}`,
        meta: "Music",
      })),
    ];

    // Daily rotation: rotate by seed, then take a polished mix
    const rot = seed % Math.max(1, pool.length);
    const rotated = [...pool.slice(rot), ...pool.slice(0, rot)];
    const picked: DailyItem[] = [];
    const kinds = new Set<string>();
    for (const item of rotated) {
      if (picked.length >= 8) break;
      // keep variety: allow multiple videos but force at least one non-video when available
      if (item.kind !== "video" && kinds.has(item.kind) && picked.filter((p) => p.kind === item.kind).length >= 2) {
        continue;
      }
      picked.push(item);
      kinds.add(item.kind);
    }
    while (picked.length < 8 && picked.length < rotated.length) {
      const next = rotated[picked.length];
      if (next && !picked.includes(next)) picked.push(next);
      else break;
    }

    const headlineVideo = newestVideos[0]?.title ?? "the latest drops";
    return {
      key,
      items: picked,
      headline: headlineVideo,
    };
  }, [videos]);

  const niceDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date());
    } catch {
      return key;
    }
  }, [key]);

  if (!items.length) return null;

  return (
    <section className="section" aria-label="Daily latest from TMACK48">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow inline-flex items-center gap-2">
              <SparkleIcon className="h-4 w-4" /> Daily pulse · {niceDate}
            </span>
            <h2 className="mt-2 section-title">
              <span className="diamond-text">Latest on the site</span>
            </h2>
            <p className="mt-3 text-platinum/70 max-w-2xl">
              Auto-refreshes every day from the live catalog, news, and music pages — today&apos;s
              mix leans into <span className="text-gold-200">{headline}</span> and the newest TMACK48
              content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/videos" className="btn-ghost text-sm" onClick={() => trackCta("daily_videos")}>
              Videos <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link to="/news" className="btn-ghost text-sm" onClick={() => trackCta("daily_news")}>
              News <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, i) => {
            const isHero = i === 0;
            const cardClass = isHero
              ? "sm:col-span-2 xl:col-span-2 xl:row-span-2"
              : "";

            if (item.kind === "video") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    trackCta("daily_open_video", { id: item.video.videoId });
                    onOpenVideo?.(item.video);
                  }}
                  className={`group card-premium relative overflow-hidden text-left p-0 min-h-[200px] ${cardClass} ${
                    isHero ? "min-h-[320px] sm:min-h-[380px]" : ""
                  }`}
                >
                  {item.thumb && (
                    <img
                      src={item.thumb}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading={isHero ? "eager" : "lazy"}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
                    <span className="chip chip-active w-fit">{item.meta}</span>
                    <h3
                      className={`mt-3 display-title font-bold text-platinum ${
                        isHero ? "text-2xl sm:text-3xl" : "text-lg"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-platinum/75 line-clamp-2">{item.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold-200">
                      <PlayIcon className="h-4 w-4" /> Play now
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => trackCta("daily_open_content", { kind: item.kind, id: item.id })}
                className={`group card-premium flex flex-col justify-between p-5 sm:p-6 min-h-[200px] hover-lift ${cardClass}`}
              >
                <div>
                  <span className="chip">{item.meta}</span>
                  <h3 className="mt-3 display-title text-lg font-bold text-platinum group-hover:text-gold-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-platinum/70 line-clamp-3">{item.blurb}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold-300">
                  Open <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
