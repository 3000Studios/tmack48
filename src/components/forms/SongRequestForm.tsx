import { useState } from "react";
import { Link } from "react-router-dom";
import { SparkleIcon } from "@/components/ui/Icon";
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

export default function SongRequestForm({ className = "" }: { className?: string }) {
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
    <form onSubmit={onSubmit} className={`card-premium p-6 sm:p-8 space-y-6 ${className}`}>
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Pick a vibe</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setVibe(v)}
              aria-pressed={vibe === v}
              className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
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
          rows={4}
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
          <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Email (optional)</span>
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
          Hear the catalog →
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
  );
}
