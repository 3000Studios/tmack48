import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Video } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import { CloseIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackVideo } from "@/lib/analytics";

interface Props {
  video: Video | null;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: Props) {
  useEffect(() => {
    if (!video) return;
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
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/80 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl rounded-3xl glass metal-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-platinum hover:text-gold-200"
              aria-label="Close"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <div className="aspect-video-frame w-full bg-black">
              <iframe
                title={video.title}
                src={buildEmbedUrl(video.videoId, { autoplay: true })}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <h3 className="display-title text-lg sm:text-xl font-bold text-platinum">{video.title}</h3>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackVideo("watch_on_youtube", video.videoId)}
                className="btn-ghost !px-4 !py-2 text-sm"
              >
                <YoutubeIcon className="h-4 w-4" /> Watch on YouTube
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
