import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import type { StoryPayload } from "@/types/story-feed";

export default function StoryEdition() {
  const { edition } = useParams();
  const num = Number(edition);
  const [story, setStory] = useState<StoryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(num) || num < 0) {
      setError("invalid");
      return;
    }
    let cancelled = false;
    fetch(`/api/stories?edition=${num}`, { credentials: "omit" })
      .then(async (res) => {
        const data = (await res.json()) as { story?: StoryPayload; error?: string };
        if (!res.ok) {
          setError(data.error ?? "notfound");
          return;
        }
        if (!cancelled && data.story) setStory(data.story);
      })
      .catch(() => {
        if (!cancelled) setError("fetch");
      });
    return () => {
      cancelled = true;
    };
  }, [num]);

  if (!Number.isFinite(num) || num < 0) {
    return (
      <section className="container-lux py-24">
        <p className="text-platinum/70">Invalid edition.</p>
        <Link to="/stories" className="link-rise mt-4 inline-block text-gold-300">
          ← Back to index
        </Link>
      </section>
    );
  }

  return (
    <>
      <Seo
        path={`/stories/${num}`}
        title={story ? story.title : `Story #${num}`}
        description={story?.excerpt ?? "TMACK48 hourly dispatch."}
      />

      <article className="container-lux py-16 pb-28 max-w-3xl">
        {error === "fetch" && (
          <p className="text-platinum/70">
            Could not load this edition. Run <code className="text-gold-300">wrangler pages dev</code> or use
            the production site for the Stories API.
          </p>
        )}
        {error === "notfound" && (
          <p className="text-platinum/70">This edition is not published yet.</p>
        )}
        {error === "invalid" && null}

        {story && (
          <Reveal>
            <Link to="/stories" className="link-rise text-sm uppercase tracking-[0.2em] text-gold-400">
              ← Chronological index
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.35em] text-platinum/50">
              Edition #{story.edition} · {new Date(story.publishedAt).toUTCString()}
            </p>
            <h1 className="mt-4 display-title text-4xl sm:text-5xl font-black text-platinum">{story.title}</h1>
            <p className="mt-4 text-lg text-platinum/80">{story.excerpt}</p>

            <div className="mt-10 rounded-3xl overflow-hidden card-premium aspect-video-frame bg-black">
              <video
                key={story.videoUrl}
                className="h-full w-full object-cover"
                src={story.videoUrl}
                autoPlay
                muted
                playsInline
                loop
                controls
              />
            </div>
            <p className="mt-3 text-xs text-platinum/50">{story.mediaCredit}</p>

            <div className="mt-10 space-y-6 text-platinum/85 leading-relaxed whitespace-pre-line">
              {story.body}
            </div>
          </Reveal>
        )}
      </article>
    </>
  );
}
