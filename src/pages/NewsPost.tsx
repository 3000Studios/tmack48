import { Link, useParams } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import Newsletter from "@/components/support/Newsletter";
import { getPostBySlug, posts } from "@/data/posts";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon } from "@/components/ui/Icon";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function NewsPost() {
  const { slug = "" } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <section className="container-lux py-28 text-center">
        <Seo path={`/news/${slug}`} title="Story not found" noIndex />
        <h1 className="display-title text-4xl font-black text-platinum">Story not found</h1>
        <Link to="/news" className="btn-gold mt-8 inline-flex">
          Back to News
        </Link>
      </section>
    );
  }

  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <Seo
        path={`/news/${post.slug}`}
        title={post.title}
        description={post.excerpt}
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          url: `${siteConfig.url}/news/${post.slug}`,
          author: { "@type": "MusicGroup", name: "TMACK48", url: siteConfig.url },
          publisher: { "@type": "Organization", name: "TMACK48", url: siteConfig.url },
          articleSection: post.category,
          image: `${siteConfig.url}/og-image.png`,
        }}
      />

      <article className="container-lux py-14 pb-24 max-w-3xl">
        <Reveal>
          <Link to="/news" className="link-rise text-sm uppercase tracking-[0.2em] text-gold-400">
            ← News &amp; Stories
          </Link>
          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold-300">
            <span>{post.category}</span>
            <span className="text-platinum/40">·</span>
            <span className="text-platinum/50">{fmt(post.publishedAt)}</span>
            <span className="text-platinum/40">·</span>
            <span className="text-platinum/50">{post.readMinutes} min read</span>
          </div>
          <h1 className="mt-4 display-title text-4xl sm:text-5xl font-black text-balance">
            <span className="gold-text">{post.title}</span>
          </h1>
          <p className="mt-5 text-xl text-platinum/80 text-balance">{post.excerpt}</p>

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-platinum/85">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {post.trackSlug && (
            <Link to={`/music/${post.trackSlug}`} className="btn-gold mt-10 inline-flex">
              Listen to the track <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </Reveal>

        <div className="mt-16">
          <Newsletter source="news-post" />
        </div>

        {more.length > 0 && (
          <Reveal>
            <section className="mt-16">
              <h2 className="display-title text-2xl font-black text-platinum mb-6">More stories</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {more.map((p) => (
                  <Link key={p.slug} to={`/news/${p.slug}`} className="group card-premium p-6 hover-lift">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-gold-300">{p.category}</span>
                    <h3 className="mt-2 display-title text-lg font-bold text-platinum group-hover:text-gold-200">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-platinum/65">{p.excerpt}</p>
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
