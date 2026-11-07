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
import Newsletter from "@/components/support/Newsletter";
import { useVideos } from "@/hooks/useVideos";
import { useSiteOverrides, type CustomSection } from "@/lib/siteOverrides";
import type { Video } from "@/data/videos";
import { artistSchema, siteSchema } from "@/lib/seo";
import { gallery } from "@/data/gallery";
import { siteConfig } from "@/data/siteConfig";
import LatestDaily from "@/components/home/LatestDaily";
import { ArrowRightIcon, HeartIcon, MailIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

/** Sections added from the admin editor — rendered at the chosen spot. */
function CustomSections({ position }: { position: CustomSection["position"] }) {
  const ov = useSiteOverrides();
  const sections = ov.sections.filter((s) => s.position === position);
  if (!sections.length) return null;
  return (
    <>
      {sections.map((s) => (
        <section key={s.id} className="section" aria-label={s.heading}>
          <Reveal>
            <div className="card-premium overflow-hidden">
              {s.imageUrl && (
                <img src={s.imageUrl} alt="" className="h-56 w-full object-cover sm:h-72" loading="lazy" />
              )}
              <div className="p-8 sm:p-10">
                <h2 className="display-title text-3xl font-black sm:text-4xl">
                  <span className="gold-text">{s.heading}</span>
                </h2>
                {s.body && (
                  <p className="mt-4 max-w-3xl whitespace-pre-line text-platinum/80 leading-relaxed">{s.body}</p>
                )}
                {s.linkUrl && (
                  <a
                    href={s.linkUrl}
                    target={s.linkUrl.startsWith("http") ? "_blank" : undefined}
                    rel={s.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="btn-gold mt-6 inline-flex text-sm"
                  >
                    {s.linkLabel || "Check it out"} <ArrowRightIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      ))}
    </>
  );
}

export default function Home() {
  const { videos } = useVideos();
  const ov = useSiteOverrides();
  const [active, setActive] = useState<Video | null>(null);
  const [heroVideo, setHeroVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!videos.length) return;
    // Admin editor can pin the lead video; otherwise it rotates hourly.
    const pinned = ov.heroVideoId ? videos.find((v) => v.videoId === ov.heroVideoId) : undefined;
    if (pinned) {
      setHeroVideo(pinned);
      return;
    }
    const hour = Math.floor(Date.now() / (1000 * 60 * 60));
    setHeroVideo(videos[hour % videos.length]);
  }, [videos, ov.heroVideoId]);

  const featuredPool = useMemo(() => videos.filter((v) => v.featured), [videos]);

  // Hero carousel pool — the TOP videos: featured first, then the rest of
  // the long-form catalog, with the hourly hero pick guaranteed a seat.
  // Capped at 10 so the U stays readable (Boss order 2026-11-07).
  const topPool = useMemo(() => {
    const longsAll = videos.filter((v) => v.category !== "short");
    const ordered = [...featuredPool, ...longsAll.filter((v) => !v.featured)];
    const withHero =
      heroVideo && !ordered.some((v) => v.id === heroVideo.id)
        ? [heroVideo, ...ordered]
        : ordered;
    return withHero.slice(0, 10);
  }, [videos, featuredPool, heroVideo]);

  const dropTrio = useMemo(() => {
    const fallback = videos.slice(0, 3);
    if (featuredPool.length >= 6) return featuredPool.slice(3, 6);
    return featuredPool.length >= 3 ? featuredPool.slice(0, 3) : fallback;
  }, [videos, featuredPool]);

  // Section pools are windowed so the same faces don't repeat down the page:
  // LatestDaily owns the newest 12 longs; marquees and the catalog preview
  // draw from deeper in the catalog, and the preview rotates daily.
  const longs = useMemo(() => videos.filter((v) => v.category !== "short"), [videos]);
  const previewGrid = useMemo(() => {
    if (longs.length <= 6) return longs;
    const start = (Math.floor(Date.now() / 86400000) * 6) % longs.length;
    return [...longs.slice(start), ...longs.slice(0, start)].slice(0, 6);
  }, [longs]);
  const marqueeA = useMemo(() => longs.slice(12, 20), [longs]);
  const marqueeB = useMemo(() => [...longs.slice(20, 28)].reverse(), [longs]);

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

      {/* home-bob: home-screen cards float on the water (see index.css) */}
      <div className="home-bob">
      {heroVideo && <Hero video={heroVideo} playlist={topPool} />}

      <CustomSections position="after-hero" />

      {/* Daily auto-populated latest content from the site catalog */}
      <LatestDaily videos={videos} onOpenVideo={setActive} />

      <FeaturedSpotlight pool={featuredPool.length ? featuredPool : videos} />

      <CustomSections position="mid-page" />

      {/* Marquees — thumbnails only (click opens modal player) */}
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
                  <Link to="/support#contact" className="font-semibold text-platinum hover:text-gold-200">
                    Use contact form
                  </Link>
                </div>
                <Link to="/support#contact" className="btn-ghost !py-2 text-xs">
                  <HeartIcon className="h-4 w-4" /> Contact
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <StatsStrip count={videos.length} />

      {/* Join the list + request a song */}
      <section className="section">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7">
              <Newsletter source="home" className="h-full" />
            </div>
            <div className="lg:col-span-5">
              <div className="card-premium flex h-full flex-col justify-between p-8">
                <div>
                  <span className="eyebrow">Your turn</span>
                  <h2 className="mt-2 display-title text-3xl font-black">
                    <span className="diamond-text">Request a song</span>
                  </h2>
                  <p className="mt-3 text-platinum/75">
                    Got a vibe you want to hear? Tell TMACK48 what to make next — pick a mood, drop
                    your idea, and help shape the next drop.
                  </p>
                </div>
                <Link
                  to="/community#request"
                  onClick={() => trackCta("home_request_song")}
                  className="btn-gold mt-6 self-start"
                >
                  Request a song <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <CustomSections position="before-footer" />

      {/* Support CTA */}
      <SupportCta />
      </div>

      {/* Modal */}
      <VideoModal video={active} onClose={() => setActive(null)} />
    </>
  );
}
