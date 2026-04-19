import { useMemo, useRef, useState } from "react";
import Seo from "@/components/ui/Seo";
import VideoGrid from "@/components/video/VideoGrid";
import VideoModal from "@/components/video/VideoModal";
import FeaturedSpotlight from "@/components/video/FeaturedSpotlight";
import SupportCta from "@/components/support/SupportCta";
import { useVideos } from "@/hooks/useVideos";
import type { Video, VideoCategory } from "@/data/videos";
import { videoCategories } from "@/data/videos";
import Reveal from "@/components/effects/Reveal";
import { SearchIcon } from "@/components/ui/Icon";

type SortKey = "featured" | "title" | "order";

export default function Videos() {
  const { videos, loading, source } = useVideos();
  const [cat, setCat] = useState<VideoCategory | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [active, setActive] = useState<Video | null>(null);
  const [page, setPage] = useState(0);
  const dragRef = useRef({ x0: 0, t0: 0, active: false });

  const filtered = useMemo(() => {
    let list = videos;
    if (cat !== "all") list = list.filter((v) => v.category === cat);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (v) => v.title.toLowerCase().includes(s) || v.tags.some((t) => t.toLowerCase().includes(s))
      );
    }
    const copy = [...list];
    if (sort === "title") copy.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "featured")
      copy.sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
    else copy.sort((a, b) => a.order - b.order);
    return copy;
  }, [videos, cat, q, sort]);

  const paged = useMemo(() => {
    const per = 9;
    const pages = Math.max(1, Math.ceil(filtered.length / per));
    const safe = ((page % pages) + pages) % pages;
    const start = safe * per;
    return { pages, safe, items: filtered.slice(start, start + per) };
  }, [filtered, page]);

  return (
    <>
      <Seo
        path="/videos"
        title="Videos"
        description="The full TMACK48 video catalog — singles, anthems, and official drops. Play on-site or watch on YouTube."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">The Vault</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="gold-text">Videos</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          Every official drop, signature anthem, and catalog staple. Filter, search, play.
        </p>
      </header>

      <FeaturedSpotlight pool={videos} />

      <section className="container-lux py-10">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              {videoCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  className={`chip ${cat === c.id ? "chip-active" : ""}`}
                  aria-pressed={cat === c.id}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum/50" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search titles…"
                  className="glass rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gold-300"
                  aria-label="Search videos"
                />
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="glass rounded-full px-3 py-2 text-sm outline-none"
                aria-label="Sort videos"
              >
                <option value="featured">Featured</option>
                <option value="order">Order</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
          {source === "api" && (
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gold-300">Live from YouTube</p>
          )}
          {loading && (
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-platinum/50">Loading latest…</p>
          )}
        </Reveal>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-platinum/50">
              Page {paged.safe + 1} / {paged.pages}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost !px-4 !py-2.5" onClick={() => setPage((p) => p - 1)}>
                Prev
              </button>
              <button type="button" className="btn-ghost !px-4 !py-2.5" onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
          <div
            className="touch-pan-y"
            onPointerDown={(e) => {
              dragRef.current.active = true;
              dragRef.current.x0 = e.clientX;
              dragRef.current.t0 = performance.now();
            }}
            onPointerUp={(e) => {
              const st = dragRef.current;
              if (!st.active) return;
              st.active = false;
              const dx = e.clientX - st.x0;
              const dt = performance.now() - st.t0;
              if (dt < 900 && Math.abs(dx) > 52) {
                if (dx < 0) setPage((p) => p + 1);
                else setPage((p) => p - 1);
              }
            }}
            onPointerCancel={() => {
              dragRef.current.active = false;
            }}
          >
            <VideoGrid videos={paged.items} onOpen={setActive} />
          </div>
        </div>
      </section>

      <SupportCta />

      <VideoModal video={active} onClose={() => setActive(null)} />
    </>
  );
}
