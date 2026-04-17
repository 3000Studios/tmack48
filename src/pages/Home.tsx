import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Hero from "@/components/hero/Hero";
import FeaturedSpotlight from "@/components/video/FeaturedSpotlight";
import VideoMarquee from "@/components/video/VideoMarquee";
import DropSection from "@/components/video/DropSection";
import VideoGrid from "@/components/video/VideoGrid";
import ShortsRail from "@/components/video/ShortsRail";
import Gallery from "@/components/gallery/Gallery";
import SupportCta from "@/components/support/SupportCta";
import StatsStrip from "@/components/video/StatsStrip";
import VideoModal from "@/components/video/VideoModal";
import Reveal from "@/components/effects/Reveal";
import { useVideos } from "@/hooks/useVideos";
import type { Video } from "@/data/videos";
import { artistSchema, siteSchema } from "@/lib/seo";
import { gallery } from "@/data/gallery";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon, HeartIcon, MailIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

export default function Home() {
  const { videos } = useVideos();
  const [active, setActive] = useState<Video | null>(null);
  const [heroVideo, setHeroVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!videos.length) return;
    const preferred =
      videos.find((v) => v.title.toLowerCase().includes("booty brown")) ??
      videos.find((v) => !v.title.toLowerCase().includes("dirty dirty south")) ??
      videos[0];
    setHeroVideo((prev) => prev ?? preferred);
  }, [videos]);

  const featuredPool = useMemo(() => videos.filter((v) => v.featured), [videos]);

  const dropTrio = useMemo(() => {
    const fallback = videos.slice(0, 3);
    return featuredPool.length >= 3 ? featuredPool.slice(0, 3) : fallback;
  }, [videos, featuredPool]);

  const previewGrid = useMemo(() => videos.slice(0, 6), [videos]);
  const marqueeA = useMemo(() => videos.slice(0, 10), [videos]);
  const marqueeB = useMemo(() => [...videos].reverse().slice(0, 10), [videos]);

  const dropCopy = [
    {
      title: "Fresh Heat",
      copy:
        "The latest TMACK48 drop lands with cinematic visuals, heavy low-end, and the kind of energy that makes a regular Tuesday feel like a main event.",
    },
    {
      title: "The Anthem",
      copy:
        "Built for the playlists you repeat without thinking. Big room, bigger confidence — made to move the crowd and the culture.",
    },
    {
      title: "Cinematic Drop",
      copy:
        "Every frame is curated. Every bar is sharpened. This is how TMACK48 turns tracks into moments you can't forget.",
    },
  ];

  return (
    <>
      <Seo
        path="/"
        title="Official Artist Universe"
        type="music.musician"
        schema={{
          "@context": "https://schema.org",
          "@graph": [siteSchema(), artistSchema()],
        }}
      />

      {heroVideo && <Hero video={heroVideo} />}

      <FeaturedSpotlight pool={featuredPool.length ? featuredPool : videos} />

      {/* Marquees */}
      <section aria-label="Video marquees" className="container-lux overflow-hidden py-8 space-y-5">
        <VideoMarquee videos={marqueeA} direction="left" onOpen={setActive} />
        <VideoMarquee videos={marqueeB} direction="right" speed={55} onOpen={setActive} />
      </section>

      {/* Alternating drops */}
      {dropTrio.map((v, i) => (
        <DropSection
          key={v.id}
          index={i}
          video={v}
          title={dropCopy[i % dropCopy.length].title}
          copy={v.blurb ?? dropCopy[i % dropCopy.length].copy}
          side={i % 2 === 0 ? "left" : "right"}
          onOpen={setActive}
        />
      ))}

      {/* Library preview */}
      <section className="section">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="eyebrow">Library Preview</span>
              <h2 className="mt-2 section-title">
                <span className="platinum-text">The Catalog</span>
              </h2>
              <p className="mt-3 text-platinum/70 max-w-2xl">
                A curated slice of the TMACK48 universe. Dive into the full vault on the Videos page.
              </p>
            </div>
            <Link
              to="/videos"
              onClick={() => trackCta("home_view_all_videos")}
              className="btn-ghost text-sm"
            >
              View all videos <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <VideoGrid videos={previewGrid} onOpen={setActive} />
        </Reveal>
      </section>

      {/* Shorts */}
      <ShortsRail videos={videos} onOpen={setActive} />

      {/* Image / Photo moments */}
      <section className="section">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="eyebrow">Moments</span>
              <h2 className="mt-2 section-title">
                <span className="diamond-text">Visual Diary</span>
              </h2>
              <p className="mt-3 text-platinum/70 max-w-2xl">
                Hover in — the subjects step off the card. A premium peek into the TMACK48 visual language.
              </p>
            </div>
            <Link to="/gallery" className="btn-ghost text-sm">
              Full gallery <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <Gallery items={gallery.slice(0, 8)} />
        </Reveal>
      </section>

      {/* About strip */}
      <section className="section">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 card-premium p-8 sm:p-12">
              <span className="eyebrow">The Artist</span>
              <h2 className="mt-2 display-title text-4xl sm:text-5xl font-black">
                <span className="gold-text">TMACK48</span>
              </h2>
              <p className="mt-5 text-platinum/80 text-lg leading-relaxed text-balance">
                An artist built for the spotlight — blending street tradition, club energy, and
                luxury polish into records that don't ask for attention, they take it. Every release is a
                statement. Every frame is intentional. This is the universe.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/about" className="btn-gold text-sm">
                  Read the story
                </Link>
                <a
                  href={siteConfig.channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-sm"
                >
                  <YoutubeIcon className="h-4 w-4" /> Channel
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <SupportCta variant="banner" />
              <div className="glass rounded-3xl p-6 flex items-center gap-4">
                <MailIcon className="h-10 w-10 text-gold-300" />
                <div className="flex-1">
                  <p className="text-sm text-platinum/70">Booking / press inquiries</p>
                  <Link to="/contact" className="font-semibold text-platinum hover:text-gold-200">
                    Use contact form
                  </Link>
                </div>
                <Link to="/contact" className="btn-ghost !py-2 text-xs">
                  <HeartIcon className="h-4 w-4" /> Contact
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <StatsStrip count={videos.length} />

      {/* Support CTA */}
      <SupportCta />

      {/* Modal */}
      <VideoModal video={active} onClose={() => setActive(null)} />
    </>
  );
}
