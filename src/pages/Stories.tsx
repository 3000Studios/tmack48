import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import type { StoryFeedResponse } from "@/types/story-feed";

async function fetchStories(): Promise<StoryFeedResponse | null> {
  try {
    const res = await fetch("/api/stories", { credentials: "omit" });
    if (!res.ok) return null;
    return (await res.json()) as StoryFeedResponse;
  } catch {
    return null;
  }
}

export default function Stories() {
  const [data, setData] = useState<StoryFeedResponse | null>(null);

  useEffect(() => {
    fetchStories().then(setData);
    const id = window.setInterval(() => fetchStories().then(setData), 3_600_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <Seo
        path="/stories"
        title="Stories — hourly TMACK48 dispatch"
        description="Hourly editorial feed — luxury visuals, street energy, indexed archive."
      />

      <header className="container-lux pt-16 pb-8">
        <span className="eyebrow">Universe feed</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="gold-text">Stories</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          A new hour, a new dispatch — newest edition leads; older editions stay numbered and linked for
          the full chronological index.
        </p>
      </header>

      <section className="container-lux pb-24">
        {!data ? (
          <p className="text-platinum/60">Loading the hourly wire…</p>
        ) : (
          <Reveal>
            <div className="mb-10 rounded-3xl glass metal-border p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-gold-400">Live wire</p>
              <p className="mt-2 text-platinum/90">
                Latest edition <span className="font-black text-gold-300">#{data.latestEdition}</span> · hour
                UTC {new Date(data.generatedHourUtc).toUTCString()}
              </p>
              <Link
                to={`/stories/${data.latestEdition}`}
                className="mt-4 inline-flex btn-gold text-sm"
              >
                Open latest dispatch
              </Link>
            </div>

            <h2 className="display-title text-2xl sm:text-3xl font-black text-platinum mb-6">
              Chronological index
            </h2>
            <ol className="space-y-3 list-decimal list-inside marker:text-gold-400 marker:font-black">
              {data.stories.map((s) => (
                <li key={s.edition} className="text-platinum/90 pl-1">
                  <Link
                    to={`/stories/${s.edition}`}
                    className="link-rise font-semibold text-platinum hover:text-gold-200 transition-colors"
                  >
                    #{s.edition} — {s.title}
                  </Link>
                  <span className="text-platinum/50 text-sm ml-2">
                    {new Date(s.publishedAt).toUTCString()}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </section>
    </>
  );
}
