import { useState } from "react";
import { motion } from "framer-motion";
import Seo from "@/components/ui/Seo";
import { useVideos } from "@/hooks/useVideos";
import type { Video } from "@/data/videos";
import VideoModal from "@/components/video/VideoModal";
import { siteConfig } from "@/data/siteConfig";
import { PlayIcon, YoutubeIcon } from "@/components/ui/Icon";
import SupportCta from "@/components/support/SupportCta";
import { trackOutbound, trackVideo } from "@/lib/analytics";

export default function Shorts() {
  const { videos } = useVideos();
  const [active, setActive] = useState<Video | null>(null);
  const shortsOnly = videos.filter((v) => v.tags.includes("short") || v.category === "short");
  const stack = (shortsOnly.length ? shortsOnly : videos).slice(0, 18);

  return (
    <>
      <Seo
        path="/shorts"
        title="Shorts"
        description="Vertical TMACK48 moments — short, loud, unforgettable."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">Quick Hits</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="diamond-text">Shorts</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          Swipe the vault. Every short is a crown moment — small frame, loud impact.
        </p>
      </header>

      <section className="container-lux py-10">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stack.map((v, i) => (
            <motion.button
              key={v.id}
              type="button"
              onClick={() => {
                trackVideo("open", v.videoId);
                setActive(v);
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative aspect-[9/16] overflow-hidden rounded-3xl metal-border focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              aria-label={`Open ${v.title}`}
            >
              <img
                src={v.thumbnailHqUrl}
                alt={v.title}
                loading={i < 5 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.src = "/golden-acorn.svg";
                }}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="grid h-14 w-14 place-items-center rounded-full opacity-90 group-hover:opacity-100 group-hover:scale-110 transition"
                  style={{ background: "linear-gradient(135deg,#B9F2FF,#7FDBFF,#48A9C5)" }}
                >
                  <PlayIcon className="h-6 w-6 text-ink-950 translate-x-[2px]" />
                </span>
              </div>
              <div className="absolute left-0 right-0 bottom-0 p-3">
                <p className="text-sm font-semibold text-platinum line-clamp-2 drop-shadow">{v.title}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={siteConfig.channel.url + "/shorts"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutbound(siteConfig.channel.url + "/shorts", "shorts_more")}
            className="btn-gold"
          >
            <YoutubeIcon className="h-5 w-5" /> Watch more shorts on YouTube
          </a>
        </div>
      </section>

      <SupportCta />

      <VideoModal video={active} onClose={() => setActive(null)} />
    </>
  );
}
