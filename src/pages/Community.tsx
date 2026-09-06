import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import SongRequestForm from "@/components/forms/SongRequestForm";
import { HeartIcon, SparkleIcon, StarIcon } from "@/components/ui/Icon";

interface Post {
  id: string;
  author: string;
  body: string;
  createdAt: number;
}

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function Community() {
  const loc = useLocation();
  const requestRef = useRef<HTMLElement | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sending">("loading");
  const [note, setNote] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (loc.hash === "#request") {
      const t = window.setTimeout(() => {
        requestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(t);
    }
  }, [loc.hash]);

  useEffect(() => {
    let alive = true;
    fetch("/api/community")
      .then((r) => r.json())
      .then((data: { ok: boolean; posts?: Post[]; storage?: string }) => {
        if (!alive) return;
        setPosts(data.posts ?? []);
        setReadOnly(data.storage !== "kv");
        setStatus("idle");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("idle");
        setNote("Couldn't load the wall right now — please try again shortly.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 2 || status === "sending") return;
    setStatus("sending");
    setNote(null);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, body }),
      });
      const data = (await res.json()) as { ok: boolean; posts?: Post[]; error?: string };
      if (data.ok && data.posts) {
        setPosts(data.posts);
        setBody("");
        setNote("Posted — thanks for joining the conversation!");
      } else {
        setNote(data.error ?? "Couldn't post right now. Please try again.");
      }
    } catch {
      setNote("Network hiccup — please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <>
      <Seo
        path="/community"
        title="Fans"
        description="TMACK48 fans hub — community wall and song requests in one place."
      />

      <header className="page-header">
        <span className="eyebrow">Fans Hub</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="platinum-text">Community</span>
          <span className="gold-text"> &amp; Requests</span>
        </h1>
        <p className="page-lede">
          Drop a message on the wall or send a song idea straight to the studio — the movement runs on
          real fans.
        </p>
      </header>

      <section className="container-lux pb-12 max-w-3xl">
        <Reveal>
          <form
            onSubmit={submit}
            className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <SparkleIcon className="h-5 w-5 text-gold-300" />
              <h2 className="display-title text-xl font-bold text-platinum">Community Wall</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-platinum/60">Name</span>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={40}
                  placeholder="Anonymous"
                  className="mt-1 w-full rounded-lg bg-ink-950/60 border border-white/10 px-3 py-2.5 text-platinum focus:border-gold-300 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-platinum/60">Message</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={600}
                  rows={3}
                  required
                  placeholder="Say something to the community…"
                  className="mt-1 w-full rounded-lg bg-ink-950/60 border border-white/10 px-3 py-2.5 text-platinum focus:border-gold-300 focus:outline-none resize-y"
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-platinum/40">{body.length}/600</span>
              <button
                type="submit"
                disabled={status === "sending" || body.trim().length < 2}
                className="btn-gold !px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Posting…" : "Post"}
              </button>
            </div>
            {readOnly && (
              <p className="text-xs text-gold-300/80">
                Posting is read-only until a KV namespace named COMMUNITY_KV is bound in Cloudflare
                Pages. Existing posts still display.
              </p>
            )}
            {note && (
              <p ref={liveRef} aria-live="polite" className="text-sm text-platinum/80">
                {note}
              </p>
            )}
          </form>
        </Reveal>

        <div className="mt-8 space-y-4">
          {status === "loading" && <p className="text-platinum/50">Loading the wall…</p>}
          {status !== "loading" && posts.length === 0 && (
            <p className="text-platinum/50">No posts yet — be the first to say hello.</p>
          )}
          {posts.map((p) => (
            <article
              key={p.id}
              className="glass rounded-xl border border-white/5 p-4 transition-colors hover:border-gold-300/30 active:border-gold-300/50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-gold-200">{p.author}</span>
                <time className="text-xs text-platinum/40" dateTime={new Date(p.createdAt).toISOString()}>
                  {fmt(p.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-platinum/80 whitespace-pre-wrap break-words">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="request"
        ref={requestRef}
        className="container-lux pb-20 scroll-mt-24 grid gap-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <Reveal>
            <div className="mb-5">
              <span className="eyebrow">Your turn</span>
              <h2 className="mt-2 display-title text-3xl sm:text-4xl font-black">
                <span className="gold-text">Request a Song</span>
              </h2>
              <p className="mt-3 text-platinum/75 max-w-xl">
                Pick a vibe, drop your idea, and help shape the next drop.
              </p>
            </div>
            <SongRequestForm />
          </Reveal>
        </div>
        <div className="lg:col-span-5 space-y-5">
          <Reveal>
            <div className="card-premium p-6 sm:p-8">
              <StarIcon className="h-8 w-8 text-gold-300" />
              <h3 className="mt-3 display-title text-xl font-bold text-platinum">How it works</h3>
              <ol className="mt-4 space-y-3 text-platinum/75 text-sm sm:text-base">
                <li className="flex gap-3">
                  <span className="font-black text-gold-300">1.</span> Pick a vibe and describe the idea.
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-gold-300">2.</span> The best ideas get pulled into the studio.
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-gold-300">3.</span> New drops land on the channel — subscribe so you
                  don&apos;t miss yours.
                </li>
              </ol>
            </div>
          </Reveal>
          <div className="glass rounded-3xl p-6 flex items-center gap-4">
            <HeartIcon className="h-9 w-9 text-gold-300 shrink-0" />
            <p className="text-sm text-platinum/75">
              Every request is read. No promises on timing — but the wildest ideas tend to win.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
