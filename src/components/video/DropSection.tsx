import { motion } from "framer-motion";
import type { Video } from "@/data/videos";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInViewport } from "@/hooks/useInViewport";
import { ArrowRightIcon, PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";
import { buildEmbedUrl } from "@/lib/youtube";

interface Props {
  video: Video;
  title: string;
  copy: string;
  side: "left" | "right";
  onOpen?: (v: Video) => void;
  index: number;
}

export default function DropSection({ video, title, copy, side, onOpen, index }: Props) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>();

  const dropVariant = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: {
          opacity: 0,
          y: 80,
          rotateX: 78,
          transformPerspective: 1000,
          transformOrigin: "bottom center",
          scale: 0.94,
        },
        show: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        },
      };

  const copyVariant = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: side === "left" ? 40 : -40 },
        show: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] } },
      };

  const order = side === "left" ? "" : "lg:[&>div:first-child]:order-2";

  return (
    <section ref={ref} className="section">
      <div className={`grid gap-10 lg:grid-cols-12 items-center ${order}`}>
        <motion.div
          variants={dropVariant}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className={`lg:col-span-7 ${side === "right" ? "lg:col-start-6" : ""}`}
        >
          <div className="card-premium aspect-video-frame relative overflow-hidden shadow-gold-xl">
            {inView ? (
              <iframe
                title={video.title}
                src={buildEmbedUrl(video.videoId, {
                  autoplay: true,
                  mute: true,
                  controls: false,
                  loop: true,
                })}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <img src={video.thumbnailMaxUrl} alt={video.title} className="h-full w-full object-cover" />
            )}
          </div>
        </motion.div>

        <motion.div
          variants={copyVariant}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className={`lg:col-span-5 ${side === "right" ? "lg:col-start-1 lg:row-start-1" : ""}`}
        >
          <span className="eyebrow">Drop {String(index + 1).padStart(2, "0")}</span>
          <h2 className="mt-2 section-title">
            <span className={index % 2 ? "platinum-text" : "gold-text"}>{title}</span>
          </h2>
          <p className="mt-5 text-platinum/80 text-lg leading-relaxed text-balance">{copy}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpen?.(video)}
              className="btn-gold"
            >
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
        </motion.div>
      </div>
    </section>
  );
}
