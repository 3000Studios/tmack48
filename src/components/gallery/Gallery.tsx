import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gallery as defaultGallery, type GalleryItem } from "@/data/gallery";
import { CloseIcon } from "@/components/ui/Icon";
import TiltCard from "@/components/effects/TiltCard";

export default function Gallery({ items = defaultGallery }: { items?: GalleryItem[] }) {
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [deadIds, setDeadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, i) => {
          if (deadIds.has(item.id)) return null;
          return (
          <TiltCard key={item.id} className="card-premium">
            <button
              type="button"
              onClick={() => setActive(item)}
              className="group relative block w-full aspect-square overflow-hidden rounded-[inherit] focus:outline-none"
              aria-label={item.alt}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700
                           group-hover:scale-[1.18] group-hover:drop-shadow-[0_20px_40px_rgba(212,175,55,0.45)]"
                onLoad={(e) => {
                  if (e.currentTarget.naturalWidth <= 120) {
                    setDeadIds((prev) => new Set(prev).add(item.id));
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute left-0 right-0 bottom-0 p-4 translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition">
                <p className="text-sm font-semibold text-platinum drop-shadow">{item.caption}</p>
              </div>
              <span className="absolute top-3 right-3 chip chip-active opacity-0 group-hover:opacity-100">
                View
              </span>
            </button>
          </TiltCard>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={active.alt}
            className="fixed inset-0 z-[70] grid place-items-center bg-black/85 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.figure
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[90dvh] max-w-5xl w-full rounded-3xl overflow-hidden metal-border glass"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-platinum hover:text-gold-200"
                aria-label="Close"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              <img src={active.src} alt={active.alt} className="h-auto w-full object-contain" />
              <figcaption className="p-5">
                <p className="display-title text-xl text-platinum">{active.caption}</p>
                {active.href && (
                  <a
                    href={active.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-sm uppercase tracking-[0.3em] text-gold-300 hover:text-gold-200"
                  >
                    Watch on YouTube →
                  </a>
                )}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
