import { useCallback, useEffect, useRef, useState } from "react";
import type { Video } from "@/data/videos";
import { buildEmbedUrl, YOUTUBE_EMBED_MESSAGE_ORIGIN } from "@/lib/youtube";
import { PlayIcon, SoundOffIcon, SoundOnIcon } from "@/components/ui/Icon";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackVideo } from "@/lib/analytics";

const AUTOPLAY_MS = 4600;
const RESUME_MS = 3200;

/**
 * Now Playing — U-shaped hero carousel (Boss order 2026-11-07 evening).
 *
 * All the top videos ride a shallow U: the center card sits in the dip,
 * lifted, gold-ringed and PLAYING (muted autoplay iframe); its neighbors
 * rise up the arms of the U as thumbnails. The carousel auto-scrolls on
 * its own, stops the moment a finger or mouse touches it, and is fully
 * swipeable/draggable — tap any card and it glides to the center, lifts,
 * and plays. When a video ends, the next one rolls in.
 */
export default function HeroCarousel({
  pool,
  initialIndex = 0,
}: {
  pool: Video[];
  initialIndex?: number;
}) {
  const reduced = useReducedMotion();
  const n = pool.length;
  const [active, setActive] = useState(() =>
    n ? Math.min(Math.max(initialIndex, 0), n - 1) : 0
  );
  const [muted, setMuted] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [holding, setHolding] = useState(false);
  const [dragDx, setDragDx] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const dragRef = useRef<{ startX: number; down: boolean; moved: boolean }>({
    startX: 0,
    down: false,
    moved: false,
  });
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    setActive(n ? Math.min(Math.max(initialIndex, 0), n - 1) : 0);
  }, [initialIndex, n]);

  // Delay the iframe mount so the page paints first (hero perf pattern).
  useEffect(() => {
    const t = window.setTimeout(() => setShowPlayer(true), 280);
    return () => window.clearTimeout(t);
  }, []);

  const current = pool[active] ?? pool[0];

  const go = useCallback(
    (next: number) => {
      if (!n) return;
      setActive(((next % n) + n) % n);
    },
    [n]
  );

  // Auto-scroll — pauses while held/touched/hovered, resumes after.
  useEffect(() => {
    if (reduced || holding || n < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setActive((v) => (v + 1) % n);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, holding, n]);

  const hold = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    setHolding(true);
  }, []);
  const release = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setHolding(false), RESUME_MS);
  }, []);

  // Video ended → roll to the next card.
  useEffect(() => {
    if (!showPlayer) return;
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== YOUTUBE_EMBED_MESSAGE_ORIGIN &&
        event.origin !== "https://www.youtube-nocookie.com"
      ) {
        return;
      }
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      if ((data as { event?: string }).event !== "onStateChange") return;
      if ((data as { info?: number }).info !== 0) return;
      setActive((v) => (n ? (v + 1) % n : v));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [n, showPlayer]);

  const embedSrc = current
    ? buildEmbedUrl(current.videoId, {
        autoplay: true,
        mute: muted,
        loop: false,
        controls: false,
        enableJsApi: true,
      })
    : "";

  useEffect(() => {
    if (!showPlayer || !iframeRef.current || !embedSrc) return;
    iframeRef.current.src = embedSrc;
  }, [embedSrc, showPlayer]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: [] }),
        YOUTUBE_EMBED_MESSAGE_ORIGIN
      );
    } catch {
      // the src effect reloads with the new mute state as a fallback
    }
  };

  // --- drag / swipe ---
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, down: true, moved: false };
    hold();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.down) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 6) dragRef.current.moved = true;
    setDragDx(dx);
  };
  const endDrag = () => {
    if (!dragRef.current.down) return;
    dragRef.current.down = false;
    if (Math.abs(dragDx) > 46) {
      go(active - Math.round(dragDx / 110));
    }
    setDragDx(0);
    release();
    // keep `moved` readable for the click that follows pointerup
    window.setTimeout(() => {
      dragRef.current.moved = false;
    }, 50);
  };

  const select = (i: number) => {
    if (dragRef.current.moved) return;
    if (i === active) return;
    trackVideo("play", pool[i].videoId);
    hold();
    go(i);
    release();
  };

  if (!current) return null;

  const offsetFor = (i: number) => {
    let o = i - active;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  };

  return (
    <div className="w-full">
      {/* U-stage */}
      <div
        role="region"
        aria-label="Now playing — top videos carousel"
        className="relative mx-auto h-[268px] w-full max-w-[560px] cursor-grab touch-pan-y select-none overflow-visible active:cursor-grabbing sm:h-[308px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={hold}
        onMouseLeave={release}
      >
        {pool.map((v, i) => {
          const o = offsetFor(i);
          const ao = Math.abs(o);
          const visible = ao <= 2;
          // U-curve: center dips lowest (24px), arms rise to 0 at ±2.
          const dip = ao <= 2 ? 24 * (1 - (o / 2) * (o / 2)) : 0;
          const lift = o === 0 ? -14 : 0;
          const scale = o === 0 ? 1.05 : ao === 1 ? 0.88 : 0.76;
          const isCenter = o === 0;
          return (
            <div
              key={v.id}
              className="absolute left-1/2 top-1/2 aspect-video-frame w-[min(74vw,380px)] sm:w-[min(74vw,420px)]"
              style={{
                transform: `translate(calc(-50% + ${o * 62}% + ${dragDx}px), calc(-50% + ${dip + lift}px)) scale(${scale})`,
                transition:
                  dragDx !== 0
                    ? "none"
                    : "transform 0.65s cubic-bezier(.22,1,.36,1), opacity 0.5s ease",
                zIndex: 10 - ao,
                opacity: visible ? (ao === 2 ? 0.78 : 1) : 0,
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              <div
                className={
                  isCenter
                    ? "relative h-full w-full overflow-hidden rounded-[1.25rem] card-premium shadow-gold-xl ring-2 ring-gold-400 ring-offset-4 ring-offset-black"
                    : "video-bob relative h-full w-full overflow-hidden rounded-[1.25rem] metal-border shadow-2xl"
                }
                style={isCenter ? undefined : { animationDelay: `${(i % 5) * -1.4}s` }}
              >
                {isCenter && showPlayer ? (
                  <>
                    <iframe
                      key={v.videoId}
                      ref={iframeRef}
                      title={v.title}
                      src={embedSrc}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="block h-full w-full border-0"
                    />
                    {/* drag shield — the player has no controls, so swipes
                        that start on the playing card still steer the
                        carousel instead of dying inside the iframe */}
                    <div className="absolute inset-0" aria-hidden />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => select(i)}
                    className="group relative block h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                    aria-label={`Play ${v.title}`}
                  >
                    <img
                      src={v.thumbnailMaxUrl}
                      onError={(e) => {
                        e.currentTarget.src = v.thumbnailHqUrl;
                      }}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-gold-300 ring-1 ring-gold-400/70 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <PlayIcon className="ml-0.5 h-5 w-5" />
                      </span>
                    </span>
                    <span className="absolute inset-x-0 bottom-0 line-clamp-1 px-3 pb-2.5 text-[13px] font-semibold text-platinum">
                      {v.title}
                    </span>
                  </button>
                )}
                {isCenter && (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                      <span className="chip chip-active">Now Playing</span>
                      <h2 className="mt-1.5 line-clamp-1 display-title text-lg font-bold text-platinum drop-shadow sm:text-xl">
                        {v.title}
                      </h2>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* controls row */}
      <div className="mx-auto mt-1 flex max-w-[560px] items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={() => go(active - 1)}
          className="btn-ghost !px-3 !py-2 text-xs uppercase tracking-[0.18em]"
          aria-label="Previous video"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-1.5">
          {pool.map((v, i) => (
            <button
              key={v.id}
              type="button"
              tabIndex={-1}
              onClick={() => select(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-gold-400" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to ${v.title}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-platinum/80 hover:text-gold-200"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <SoundOffIcon className="h-4 w-4" /> : <SoundOnIcon className="h-4 w-4" />}
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            className="btn-ghost !px-3 !py-2 text-xs uppercase tracking-[0.18em]"
            aria-label="Next video"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
