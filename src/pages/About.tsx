import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import SupportCta from "@/components/support/SupportCta";
import { siteConfig } from "@/data/siteConfig";
import { DiamondIcon, SparkleIcon, StarIcon, YoutubeIcon } from "@/components/ui/Icon";
import AmbientParticles from "@/components/effects/AmbientParticles";

const milestones = [
  { year: "Origin", title: "The Vision", copy: "A sound built on grit, polish, and late-night ambition." },
  { year: "Build", title: "Catalog in Motion", copy: "A run of singles, anthems, and visuals that made a name." },
  { year: "Rise", title: "Global Stream", copy: "Fans on every map pin. Playlists across every mood." },
  { year: "Now", title: "The Universe", copy: "Cinematic drops, a premium brand, and an unmistakable identity." },
];

export default function About() {
  return (
    <>
      <Seo
        path="/about"
        title="About"
        description="The story behind TMACK48 — the artist, the sound, and the visual universe."
      />

      <section className="relative isolate overflow-hidden">
        <AmbientParticles className="opacity-30" count={50} />
        <div className="container-lux pt-16 pb-20">
          <Reveal>
            <span className="eyebrow">The Artist</span>
            <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-8xl font-black text-balance">
              <span className="gold-text">Meet TMACK48</span>
            </h1>
            <p className="mt-6 max-w-3xl text-platinum/85 text-lg sm:text-xl leading-relaxed text-balance">
              TMACK48 is a recording artist out of the 3000 Studios camp — a high-output rapper and songwriter whose records hit with zero warm-up. No long intros, no slow build. The music comes on and it's already moving, which is exactly how his fans like it.
            </p>
            <p className="mt-6 max-w-3xl text-platinum/85 text-lg sm:text-xl leading-relaxed text-balance">
              Raised on Southern rap and shaped by years of writing, recording, and re-recording until every bar landed right, TMACK48 built his sound the old-fashioned way: repetition, pressure, and honesty. His style sits somewhere between street-ready trap and motivational anthems — heavy drums, direct lyrics, hooks that stick after one listen. The subject matter stays close to real life: grinding through the 9-to-5, staying disciplined when nobody's watching, loyalty, setbacks, and the moments where you either level up or fold.
            </p>
            <p className="mt-6 max-w-3xl text-platinum/85 text-lg sm:text-xl leading-relaxed text-balance">
              The sound: A TMACK48 record is built for motion. The beats are hard and percussive, engineered to carry through big speakers — car-audio culture runs deep in the 3000 Studios family, and these mixes are tuned with that in mind. The vocal delivery is aggressive but controlled: clear diction, stacked ad-libs, and hooks written to be shouted back. Songs typically run short and punchy, cutting the fat and getting to the point.
            </p>
            <p className="mt-6 max-w-3xl text-platinum/85 text-lg sm:text-xl leading-relaxed text-balance">
              Releases and videos: TMACK48 releases through 3000 Studios with distribution across the major streaming platforms. His catalog spans solo singles, concept tracks, and high-energy anthems, each paired with official music videos published to the 3000 Studios YouTube channel. New music lands on a steady schedule, and every release ships with the full treatment: mixed and mastered audio, cover art, and a video.
            </p>
            <p className="mt-6 max-w-3xl text-platinum/85 text-lg sm:text-xl leading-relaxed text-balance">
              The work ethic behind the catalog: Sessions run long, revisions run deep, and no record gets released until it clears every check — the mix, the master, the car test, and the gut test. Fans know that when a new TMACK48 single drops, it's going to be finished, polished, and ready to play loud.
            </p>
            <p className="mt-6 max-w-3xl text-platinum/85 text-lg sm:text-xl leading-relaxed text-balance">
              Where to listen: The full catalog is streaming on Spotify, Apple Music, and every major platform, with official videos on the 3000 Studios YouTube channel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={siteConfig.channel.subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                <YoutubeIcon className="h-5 w-5" /> Subscribe on YouTube
              </a>
              <Link to="/videos" className="btn-ghost">
                Explore the Videos →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-4">
            {milestones.map((m, i) => (
              <div key={m.title} className="card-premium p-6 hover-lift">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold-300">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>•</span>
                  <span>{m.year}</span>
                </div>
                <h3 className="mt-3 display-title text-xl font-bold text-platinum">{m.title}</h3>
                <p className="mt-2 text-platinum/70">{m.copy}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: SparkleIcon,
                title: "Luxury, on purpose",
                copy: "Gold, platinum, diamond — the visual DNA is premium by design, not by accident.",
              },
              {
                Icon: StarIcon,
                title: "Songs that stick",
                copy: "Hooks built for repeat. Bars built for conviction. Production built for speakers.",
              },
              {
                Icon: DiamondIcon,
                title: "Always in motion",
                copy: "New drops, new visuals, new moves. The catalog is a living thing.",
              },
            ].map((c) => (
              <div key={c.title} className="card-premium p-8">
                <c.Icon className="h-8 w-8 text-gold-300" />
                <h3 className="mt-4 display-title text-xl font-bold text-platinum">{c.title}</h3>
                <p className="mt-2 text-platinum/70">{c.copy}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <SupportCta />
    </>
  );
}
