import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import SupportCta from "@/components/support/SupportCta";
import { tracks } from "@/data/tracks";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon, PlayIcon } from "@/components/ui/Icon";

export default function Music() {
  return (
    <>
      <Seo
        path="/music"
        title="Music & Lyrics"
        description="Every TMACK48 track — watch the video, read along, and dive into the full catalog."
        schema={{
          "@context": "https://schema.org",
          "@type": "MusicPlaylist",
          name: "TMACK48 — Music & Lyrics",
          url: `${siteConfig.url}/music`,
          numTracks: tracks.length,
        }}
      />

      <header className="container-lux pt-16 pb-8">
        <Reveal>
          <span className="eyebrow">The Catalog</span>
          <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
            <span className="platinum-text">Music &amp; Lyrics</span>
          </h1>
          <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
            Every track in the TMACK48 universe. Tap in to watch the video and follow along — lyrics
            roll out track by track.
          </p>
        </Reveal>
      </header>

      <section className="container-lux pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t, i) => (
            <Reveal key={t.slug} delay={Math.min(i * 0.03, 0.3)}>
              <Link
                to={`/music/${t.slug}`}
                className="group card-premium block overflow-hidden hover-lift"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={t.thumbnailHqUrl}
                    alt={t.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-300 text-ink-950">
                      <PlayIcon className="h-5 w-5" />
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold-300">{t.category}</span>
                  <h2 className="mt-1 display-title text-lg font-bold text-platinum group-hover:text-gold-200">
                    {t.title}
                  </h2>
                  {t.blurb && <p className="mt-1 line-clamp-2 text-sm text-platinum/65">{t.blurb}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-gold-300">
                    {t.lyrics.length ? "Read lyrics" : "View track"} <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <SupportCta />
    </>
  );
}
