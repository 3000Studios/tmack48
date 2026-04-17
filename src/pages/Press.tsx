import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import { siteConfig } from "@/data/siteConfig";
import { featuredVideos, videos } from "@/data/videos";
import { buildEmbedUrl } from "@/lib/youtube";
import { YoutubeIcon } from "@/components/ui/Icon";

export default function Press() {
  const highlight = featuredVideos[0] ?? videos[0];
  const gallery = videos.slice(0, 6);

  return (
    <>
      <Seo
        path="/press"
        title="Press / EPK"
        description="Electronic Press Kit for TMACK48 — bio, featured visuals, and booking contact."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">Electronic Press Kit</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="gold-text">Press / EPK</span>
        </h1>
      </header>

      <section className="container-lux py-10 grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="card-premium p-8">
            <h2 className="display-title text-2xl font-bold text-platinum">Artist Bio</h2>
            <div className="mt-4 space-y-4 text-platinum/80 leading-relaxed">
              <p>
                TMACK48 is an artist whose sound fuses street authenticity with a luxury, cinematic
                presentation. Every record is built for volume — speakers, playlists, venues — while the
                visuals carry a signature flash-meets-polish aesthetic that separates the project from the
                pack.
              </p>
              <p>
                From hard-hitting anthems to laid-back grooves, the catalog moves through moods without
                losing identity. TMACK48 is equally at home on late-night rotation and festival-sized
                stages.
              </p>
              <p>
                The brand is expanding across music, visuals, and merchandise, with each drop reinforcing
                a universe of detail, intentionality, and undeniable energy.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-1">
              <a
                href={siteConfig.channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                <YoutubeIcon className="h-5 w-5" /> YouTube Channel
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5">
          <div className="card-premium overflow-hidden">
            <div className="aspect-video-frame">
              <iframe
                title={highlight.title}
                src={buildEmbedUrl(highlight.videoId)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="p-5">
              <p className="eyebrow">Highlight Reel</p>
              <h3 className="display-title text-lg font-bold text-platinum mt-1">{highlight.title}</h3>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-lux py-6">
        <Reveal>
          <h2 className="display-title text-2xl font-bold text-platinum">Key Visuals</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {gallery.map((v) => (
              <a
                key={v.id}
                href={v.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-video overflow-hidden rounded-2xl metal-border"
              >
                <img
                  src={v.thumbnailHqUrl}
                  alt={v.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-platinum line-clamp-2">
                  {v.title}
                </p>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-lux py-12">
        <div className="card-premium p-8 text-center">
          <h2 className="display-title text-2xl font-bold text-platinum">Official Press</h2>
          <p className="mt-3 text-platinum/70">For inquiries, connect through YouTube and official socials.</p>
        </div>
      </section>
    </>
  );
}
