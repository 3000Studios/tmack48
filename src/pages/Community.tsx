import { useEffect, useRef, useState } from "react";
import Seo from "@/components/ui/Seo";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sending">("loading");
  const [note, setNote] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

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
        title="Community"
        description="Join the TMACK48 community — drop a greeting, share an idea, and connect with the movement."
      />
      <section className="container-lux py-16 max-w-3xl">
        <header className="mb-10">
          <p className="eyebrow">The Movement</p>
          <h1 className="display-title text-4xl sm:text-5xl font-black platinum-text mt-2">
            Community Wall
          </h1>
          <p className="mt-4 text-platinum/70 leading-relaxed">
            Drop a greeting, share an idea, or shout out the latest drop. Keep it kind — posts are
            public and lightly moderated.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-platinum/60">Name</span>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                placeholder="Anonymous"
                className="mt-1 w-full rounded-lg bg-ink-950/60 border border-white/10 px-3 py-2 text-platinum focus:border-gold-300 focus:outline-none"
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
                className="mt-1 w-full rounded-lg bg-ink-950/60 border border-white/10 px-3 py-2 text-platinum focus:border-gold-300 focus:outline-none resize-y"
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

        <div className="mt-10 space-y-4">
          {status === "loading" && <p className="text-platinum/50">Loading the wall…</p>}
          {status !== "loading" && posts.length === 0 && (
            <p className="text-platinum/50">
              No posts yet — be the first to say hello to the community.
            </p>
          )}
          {posts.map((p) => (
            <article
              key={p.id}
              className="glass rounded-xl border border-white/5 p-4 transition-colors hover:border-gold-300/30"
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
    </>
  );
}
