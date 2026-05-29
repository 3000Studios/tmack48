import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import Newsletter from "@/components/support/Newsletter";
import { posts } from "@/data/posts";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon } from "@/components/ui/Icon";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function News() {
  const [lead, ...rest] = posts;

  return (
    <>
      <Seo
        path="/news"
        title="News & Stories"
        description="The latest from the TMACK48 universe — releases, behind-the-scenes, and announcements."
        schema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "TMACK48 News",
          url: `${siteConfig.url}/news`,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.publishedAt,
            url: `${siteConfig.url}/news/${p.slug}`,
          })),
        }}
      />

      <header className="container-lux pt-16 pb-8">
        <Reveal>
          <span className="eyebrow">The Wire</span>
          <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
            <span className="gold-text">News &amp; Stories</span>
          </h1>
          <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
            Releases, behind-the-scenes, and announcements straight from the TMACK48 universe.
          </p>
        </Reveal>
      </header>

      {lead && (
        <section className="container-lux pb-10">
          <Reveal>
            <Link
              to={`/news/${lead.slug}`}
              className="group card-premium block p-8 sm:p-12 hover-lift"
            >
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold-300">
                <span>{lead.category}</span>
                <span>·</span>
                <span className="text-platinum/50">{fmt(lead.publishedAt)}</span>
              </div>
              <h2 className="mt-4 display-title text-3xl sm:text-4xl font-black text-platinum group-hover:text-gold-200">
                {lead.title}
              </h2>
              <p className="mt-4 max-w-2xl text-platinum/75 text-lg">{lead.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-gold-300">
                Read story <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <section className="container-lux pb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={Math.min(i * 0.05, 0.3)}>
                <Link to={`/news/${p.slug}`} className="group card-premium flex h-full flex-col p-6 hover-lift">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold-300">
                    <span>{p.category}</span>
                    <span className="text-platinum/40">· {p.readMinutes} min</span>
                  </div>
                  <h3 className="mt-3 display-title text-xl font-bold text-platinum group-hover:text-gold-200">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-platinum/65">{p.excerpt}</p>
                  <span className="mt-4 text-xs text-platinum/45">{fmt(p.publishedAt)}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-lux pb-24">
        <Newsletter source="news" />
      </section>
    </>
  );
}
