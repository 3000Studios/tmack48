import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import AmbientParticles from "@/components/effects/AmbientParticles";
import { SparkleIcon, StarIcon, HeartIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

const VIBES = [
  "Anthem / hype",
  "Smooth / late night",
  "Street / hard",
  "Love song",
  "Cinematic / emotional",
  "Party / club",
  "Surprise me",
];

export default function SongRequest() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");
  const [vibe, setVibe] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("company")) return;
    setStatus("submitting");
    setMsg("");
    try {
      const res = await fetch("/api/song-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          vibe: fd.get("vibe"),
          details: fd.get("details"),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; mailto?: string; error?: string };
      if (data.ok) {
        setStatus("success");
        setMsg("Request received — the studio's listening. Keep an eye on the channel.");
        form.reset();
        setVibe("");
        trackCta("song_request_submit");
      } else if (data.mailto) {
        window.location.href = data.mailto;
        setStatus("success");
        setMsg("Opening your email app to send the request…");
        trackCta("song_request_mailto");
      } else {
        setStatus("error");
        setMsg(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <>
      <Seo
        path="/request"
        title="Request a Song"
        description="Tell TMACK48 what to make next. Pick a vibe, drop your idea, and help shape the next drop."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Request a Song from TMACK48",
          description: "Fan song-request hub — submit a vibe or idea for the next TMACK48 release.",
        }}
      />

      <section className="relative isolate overflow-hidden">
        <AmbientParticles className="opacity-30" count={50} />
        <header className="container-lux pt-16 pb-8">
          <Reveal>
            <span className="eyebrow">Your turn</span>
            <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black text-balance">
              <span className="gold-text">Request a Song</span>
            </h1>
            <p className="mt-4 max-w-2xl text-platinum/80 text-lg">
              Got a vibe you want to hear? Tell TMACK48 what to make next. Pick a mood, drop your idea,
              and help shape the next drop — no idea too wild.
            </p>
          </Reveal>
        </header>
      </section>

      <section className="container-lux pb-24 grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <form onSubmit={onSubmit} className="card-premium p-8 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Pick a vibe</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setVibe(v)}
                    aria-pressed={vibe === v}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      vibe === v
                        ? "bg-gold-300 text-ink-950"
                        : "glass text-platinum/80 hover:text-gold-200"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <input type="hidden" name="vibe" value={vibe} />
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Your idea</span>
              <textarea
                name="details"
                rows={5}
                required
                placeholder="A track about… the energy of… a hook that says…"
                className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300 resize-vertical"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Name (optional)</span>
                <input
                  name="name"
                  autoComplete="name"
                  className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">
                  Email (optional, for a shout-out)
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
                />
              </label>
            </div>

            <label className="hidden" aria-hidden="true">
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-gold" disabled={status === "submitting"}>
                <SparkleIcon className="h-5 w-5" />
                {status === "submitting" ? "Sending…" : "Send the request"}
              </button>
              <Link to="/videos" className="btn-ghost">
                Hear the catalog first →
              </Link>
            </div>

            {msg && (
              <p
                role={status === "error" ? "alert" : "status"}
                className={`text-sm ${status === "error" ? "text-red-300" : "text-diamond"}`}
              >
                {msg}
              </p>
            )}
          </form>
        </Reveal>

        <Reveal className="lg:col-span-5 space-y-6">
          <div className="card-premium p-8">
            <StarIcon className="h-8 w-8 text-gold-300" />
            <h3 className="mt-3 display-title text-xl font-bold text-platinum">How it works</h3>
            <ol className="mt-4 space-y-3 text-platinum/75">
              <li className="flex gap-3">
                <span className="font-black text-gold-300">1.</span> Pick a vibe and describe the idea.
              </li>
              <li className="flex gap-3">
                <span className="font-black text-gold-300">2.</span> The best ideas get pulled into the studio.
              </li>
              <li className="flex gap-3">
                <span className="font-black text-gold-300">3.</span> New drops land on the channel — subscribe so you don't miss yours.
              </li>
            </ol>
          </div>
          <div className="glass rounded-3xl p-6 flex items-center gap-4">
            <HeartIcon className="h-9 w-9 text-gold-300" />
            <p className="text-sm text-platinum/75">
              Every request is read. No promises on timing — but the wildest ideas tend to win.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
