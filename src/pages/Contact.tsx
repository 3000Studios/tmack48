import { useState } from "react";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import { siteConfig } from "@/data/siteConfig";
import { FacebookIcon, InstagramIcon, MailIcon, TiktokIcon, XIcon, YoutubeIcon } from "@/components/ui/Icon";
import { isSupportedLink } from "@/lib/utils";
import { trackCta } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const socials = [
    { href: siteConfig.social.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: siteConfig.social.tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: siteConfig.social.x, label: "X", Icon: XIcon },
  ].filter((s) => isSupportedLink(s.href));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Honeypot
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
        // Fallback: open user's email client
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
    <>
      <Seo
        path="/contact"
        title="Contact"
        description="Reach TMACK48 for booking, press, partnerships, and collaborations."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">Get in Touch</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="platinum-text">Contact</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          Booking, press, features, partnerships — send it straight. Serious inquiries get serious replies.
        </p>
      </header>

      <section className="container-lux py-8 grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <form onSubmit={onSubmit} className="card-premium p-8 space-y-5">
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
                rows={6}
                required
                className="mt-2 w-full glass rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300 resize-vertical"
              />
            </label>
            {/* Honeypot */}
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
                <MailIcon className="h-5 w-5" /> Subscribe directly
              </a>
            </div>

            {status === "success" && (
              <p role="status" className="text-sm text-diamond">
                Message received — thank you. We'll respond as soon as possible.
              </p>
            )}
            {status === "error" && (
              <p role="alert" className="text-sm text-red-300">
                {errMsg || "Something went wrong."} Please try again shortly.
              </p>
            )}
          </form>
        </Reveal>

        <Reveal className="lg:col-span-5 space-y-6">
          <div className="card-premium p-8">
            <MailIcon className="h-8 w-8 text-gold-300" />
            <h3 className="mt-3 display-title text-xl font-bold text-platinum">Direct follow</h3>
            <a
              href={siteConfig.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-lg text-gold-200 hover:text-gold-100"
            >
              TMACK48 YouTube Channel
            </a>
          </div>

          <div className="card-premium p-8">
            <h3 className="display-title text-xl font-bold text-platinum">Follow the moves</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full glass text-platinum hover:text-gold-300 hover:ring-gold transition-all"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
