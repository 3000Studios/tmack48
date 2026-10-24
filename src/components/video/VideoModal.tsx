import { useEffect, useState } from "react";
import type { Video } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import { CloseIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackVideo } from "@/lib/analytics";
import VideoComments from "./VideoComments";

interface Props {
  video: Video | null;
  onClose: () => void;
}

/**
 * Opens only after user gesture (click) — autoplay with sound is allowed.
 * Uses standard youtube.com embed (not nocookie) to reduce forced sign-in.
 *
 * PERF (2026-10-24): was framer-motion AnimatePresence; now CSS
 * (.anim-fade-in / .modal-panel / .anim-fade-out in styles/index.css)
 * with a 160 ms closing fade kept via local render state.
 */
export default function VideoModal({ video, onClose }: Props) {
  const [rendered, setRendered] = useState<Video | null>(video);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (video) {
      setRendered(video);
      setClosing(false);
      return;
    }
    if (rendered) {
      setClosing(true);
      const t = window.setTimeout(() => {
        setRendered(null);
        setClosing(false);
      }, 160);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  useEffect(() => {
    if (!rendered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [rendered, onClose]);

  if (!rendered) return null;
  const v = rendered;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={v.title}
      className={`fixed inset-0 z-[70] grid place-items-center bg-black/85 backdrop-blur-md p-3 sm:p-4 ${closing ? "anim-fade-out" : "anim-fade-in"}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl rounded-3xl glass metal-border overflow-hidden shadow-[0_40px_120px_-30px_rgba(212,175,55,0.45)] ${closing ? "" : "modal-panel"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-platinum hover:text-gold-200 ring-1 ring-white/15"
          aria-label="Close"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <div className="aspect-video-frame w-full bg-black">
          <iframe
            key={v.videoId}
            title={v.title}
            src={buildEmbedUrl(v.videoId, {
              autoplay: true,
              mute: false,
              controls: true,
              enableJsApi: false,
            })}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-white/8">
          <div className="min-w-0">
            <h3 className="display-title text-lg sm:text-xl font-bold text-platinum truncate">
              {v.title}
            </h3>
            {v.blurb && (
              <p className="mt-1 text-xs text-platinum/60 line-clamp-1">{v.blurb}</p>
            )}
          </div>
          <a
            href={v.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackVideo("watch_on_youtube", v.videoId)}
            className="btn-ghost !px-4 !py-2 text-sm shrink-0"
          >
            <YoutubeIcon className="h-4 w-4" /> Watch on YouTube
          </a>
        </div>
        <div className="px-5 pb-5">
          <VideoComments videoId={v.videoId} />
        </div>
      </div>
    </div>
  );
}
