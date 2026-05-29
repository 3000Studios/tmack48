import { useState } from "react";
import { MailIcon, SparkleIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

interface NewsletterProps {
  /** "card" = full bordered block (default); "inline" = compact row for footer. */
  variant?: "card" | "inline";
  source?: string;
  className?: string;
}

export default function Newsletter({ variant = "card", source = "site", className }: NewsletterProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("company")) return; // honeypot
    const email = String(fd.get("email") ?? "");
    setStatus("submitting");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as { ok?: boolean; mailto?: string; error?: string };
      if (data.ok) {
        setStatus("success");
        setMsg("You're on the list. Welcome to the movement.");
        form.reset();
        trackCta("newsletter_subscribe");
      } else if (data.mailto) {
        window.location.href = data.mailto;
        setStatus("success");
        setMsg("Opening your email app to confirm…");
        trackCta("newsletter_subscribe_mailto");
      } else {
        setStatus("error");
        setMsg(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  const field = (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor={`nl-email-${variant}`}>
        Email address
      </label>
      <input
        id={`nl-email-${variant}`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@email.com"
        className="min-w-0 flex-1 glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
      />
      <label className="hidden" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" className="btn-gold justify-center whitespace-nowrap" disabled={status === "submitting"}>
        {status === "submitting" ? "Joining…" : "Join the list"}
      </button>
    </form>
  );

  const status_el = msg ? (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`mt-3 text-sm ${status === "error" ? "text-red-300" : "text-diamond"}`}
    >
      {msg}
    </p>
  ) : null;

  if (variant === "inline") {
    return (
      <div className={className}>
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-platinum/70">Get the drop first</p>
        {field}
        {status_el}
      </div>
    );
  }

  return (
    <div className={`card-premium p-8 sm:p-10 ${className ?? ""}`}>
      <div className="flex items-center gap-3 text-gold-300">
        <SparkleIcon className="h-6 w-6" />
        <span className="eyebrow !mt-0">Stay in the universe</span>
      </div>
      <h2 className="mt-3 display-title text-3xl sm:text-4xl font-black">
        <span className="gold-text">Never miss a drop</span>
      </h2>
      <p className="mt-3 max-w-xl text-platinum/75">
        New videos, releases, and moments — straight to your inbox. No spam, just the movement.
      </p>
      <div className="mt-6 max-w-xl">{field}</div>
      {status_el}
      <p className="mt-4 flex items-center gap-2 text-xs text-platinum/50">
        <MailIcon className="h-4 w-4" /> Unsubscribe anytime. We respect your inbox.
      </p>
    </div>
  );
}
