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
              TMACK48 is an artist, a mood, and a movement. Born from late-night studios, chrome dreams, and a
              relentless refusal to be ignored, the catalog blends street authenticity with cinematic presentation.
              Every drop is a statement — every visual a flex of discipline and detail.
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
