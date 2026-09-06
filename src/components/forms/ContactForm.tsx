import { useState } from "react";
import { siteConfig } from "@/data/siteConfig";
import { MailIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("company")) return;
    setStatus("submitting");
    setErrMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          type: fd.get("type"),
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as { ok?: boolean; mailto?: string };
      if (data.ok) {
        setStatus("success");
        form.reset();
        trackCta("contact_submit_ok");
      } else if (data.mailto) {
        window.location.href = data.mailto;
        setStatus("success");
        trackCta("contact_submit_mailto_fallback");
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className={`card-premium p-6 sm:p-8 space-y-5 ${className}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Inquiry type</span>
        <select
          name="type"
          className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
          defaultValue="Booking"
        >
          <option>Booking</option>
          <option>Press</option>
          <option>Feature / Collaboration</option>
          <option>Partnership</option>
          <option>Fan Mail</option>
          <option>Other</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Subject</span>
        <input
          name="subject"
          required
          className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.3em] text-platinum/70">Message</span>
        <textarea
          name="message"
          rows={5}
          required
          className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300 resize-vertical"
        />
      </label>
      <label className="hidden" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-gold" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send Message"}
        </button>
        <a
          href={siteConfig.channel.subscribeUrl}
          className="btn-ghost"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCta("contact_subscribe_direct")}
        >
          <MailIcon className="h-5 w-5" /> YouTube
        </a>
      </div>

      {status === "success" && (
        <p role="status" className="text-sm text-diamond">
          Message received — thank you. We&apos;ll respond as soon as possible.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-300">
          {errMsg || "Something went wrong."} Please try again shortly.
        </p>
      )}
    </form>
  );
}
