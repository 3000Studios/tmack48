import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import Newsletter from "@/components/support/Newsletter";
import { getTrackBySlug, relatedTracks } from "@/data/tracks";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon, PlayIcon, YoutubeIcon, HeartIcon } from "@/components/ui/Icon";
import { trackVideo } from "@/lib/analytics";

export default function TrackPage() {
  const { slug = "" } = useParams();
  const track = getTrackBySlug(slug);
  const [playing, setPlaying] = useState(false);

  if (!track) {
    return (
      <section className="container-lux py-28 text-center">
        <Seo path={`/music/${slug}`} title="Track not found" noIndex />
        <h1 className="display-title text-4xl font-black text-platinum">Track not found</h1>
        <p className="mt-4 text-platinum/70">This one isn't in the catalog (yet).</p>
        <Link to="/music" className="btn-gold mt-8 inline-flex">
          Back to Music
        </Link>
      </section>
    );
  }

  const related = relatedTracks(track.slug, 3);

  return (
    <>
      <Seo
        path={`/music/${track.slug}`}
        title={track.title}
        description={track.blurb ?? `${track.title} — a track from the TMACK48 universe.`}
        image={track.thumbnailMaxUrl}
        type="video.other"
        schema={{
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          name: track.title,
          byArtist: { "@type": "MusicGroup", name: "TMACK48", url: siteConfig.url },
          url: `${siteConfig.url}/music/${track.slug}`,
          image: track.thumbnailMaxUrl,
          description: track.blurb,
          genre: track.tags,
          sameAs: track.watchUrl,
        }}
      />

      <article className="container-lux py-14 pb-24 max-w-4xl">
        <Reveal>
          <Link to="/music" className="link-rise text-sm uppercase tracking-[0.2em] text-gold-400">
            ← Music &amp; Lyrics
          </Link>
          <span className="mt-6 block text-[11px] uppercase tracking-[0.35em] text-gold-300">
            {track.category}
          </span>
          <h1 className="mt-2 display-title text-4xl sm:text-5xl lg:text-6xl font-black text-balance">
            <span className="gold-text">{track.title}</span>
          </h1>
          {track.blurb && <p className="mt-4 text-lg text-platinum/80 text-balance">{track.blurb}</p>}

          <div className="mt-8 overflow-hidden rounded-3xl border border-gold-300/20 bg-black aspect-video">
            {playing ? (
              <iframe
                title={track.title}
                src={`${track.embedUrl}${track.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPlaying(true);
                  trackVideo("play", track.videoId);
                }}
                className="group relative h-full w-full"
                aria-label={`Play ${track.title}`}
              >
                <img src={track.thumbnailMaxUrl} alt={track.title} className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/35 transition group-hover:bg-black/20">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-300 text-ink-950 shadow-gold-xl">
                    <PlayIcon className="h-7 w-7" />
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={track.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackVideo("watch_on_youtube", track.videoId)}
              className="btn-ghost"
            >
              <YoutubeIcon className="h-5 w-5" /> Watch on YouTube
            </a>
            <Link to="/support" className="btn-diamond">
              <HeartIcon className="h-5 w-5" /> Support
            </Link>
          </div>
        </Reveal>

        {/* Lyrics */}
        <Reveal>
          <section className="mt-14">
            <h2 className="display-title text-2xl sm:text-3xl font-black text-platinum">Lyrics</h2>
            {track.lyrics.length ? (
              <div className="mt-5 space-y-3 whitespace-pre-line text-lg leading-relaxed text-platinum/85">
                {track.lyrics.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="mt-5 card-premium p-8">
                <p className="text-platinum/75">
                  Lyrics for <span className="text-gold-200">{track.title}</span> are being transcribed
                  and will land here soon. In the meantime, hit play above and ride the vibe.
                </p>
                <p className="mt-3 text-sm text-platinum/50">
                  Want them faster? Drop a comment on the video and let TMACK48 know.
                </p>
              </div>
            )}
          </section>
        </Reveal>

        {/* Newsletter */}
        <div className="mt-16">
          <Newsletter source="track-page" />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <Reveal>
            <section className="mt-16">
              <h2 className="display-title text-2xl font-black text-platinum mb-6">Keep listening</h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} to={`/music/${r.slug}`} className="group card-premium overflow-hidden hover-lift">
                    <img
                      src={r.thumbnailHqUrl}
                      alt={r.title}
                      loading="lazy"
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-4">
                      <h3 className="display-title text-base font-bold text-platinum group-hover:text-gold-200">
                        {r.title}
                      </h3>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-gold-300">
                        Open <ArrowRightIcon className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </article>
    </>
  );
}
