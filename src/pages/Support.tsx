import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import SupportCta from "@/components/support/SupportCta";
import Reveal from "@/components/effects/Reveal";
import ContactForm from "@/components/forms/ContactForm";
import { siteConfig } from "@/data/siteConfig";
import { isSupportedLink } from "@/lib/utils";
import {
  FacebookIcon,
  HeartIcon,
  InstagramIcon,
  MailIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/ui/Icon";
import { trackDonate, trackOutbound } from "@/lib/analytics";

const faqs = [
  {
    q: "How does my support help?",
    a: "Every tip keeps the studio rolling — production, visuals, mixing, mastering, and promo. It directly fuels the next drop.",
  },
  {
    q: "Are tips refundable?",
    a: "Tips are non-refundable contributions. You're backing the art, not buying a physical product.",
  },
  {
    q: "Is merch available?",
    a: isSupportedLink(siteConfig.support.merch)
      ? "Yes — official merch drops link from this page. Grab a piece of the universe."
      : "Official merch is in production. Subscribe on YouTube to be the first to know when it drops.",
  },
  {
    q: "Can I book TMACK48?",
    a: "Absolutely. Use the contact form below — bookings and partnerships are read personally.",
  },
];

export default function Support() {
  const loc = useLocation();
  const contactRef = useRef<HTMLElement | null>(null);
  const { paypal, cashapp, merch } = siteConfig.support;
  const cards = [
    {
      Icon: HeartIcon,
      title: "Cash App",
      subtitle: "Quick, clean, instant.",
      href: cashapp,
      cta: "Tip on Cash App",
      provider: "cashapp" as const,
    },
    {
      Icon: HeartIcon,
      title: "PayPal",
      subtitle: "International-friendly.",
      href: paypal,
      cta: "Tip via PayPal",
      provider: "paypal" as const,
    },
    {
      Icon: HeartIcon,
      title: "Official Merch",
      subtitle: "Rep the universe.",
      href: merch,
      cta: "Shop Merch",
      provider: "merch" as const,
    },
  ].filter((c) => isSupportedLink(c.href));

  const socials = [
    { href: siteConfig.social.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: siteConfig.social.tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: siteConfig.social.x, label: "X", Icon: XIcon },
  ].filter((s) => isSupportedLink(s.href));

  useEffect(() => {
    if (loc.hash === "#contact") {
      const t = window.setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(t);
    }
  }, [loc.hash]);

  return (
    <>
      <Seo
        path="/support"
        title="Connect"
        description="Support TMACK48 and get in touch — tips, merch, booking, press, and partnerships."
      />

      <header className="page-header">
        <span className="eyebrow">Connect Hub</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="gold-text">Support</span>
          <span className="platinum-text"> &amp; Contact</span>
        </h1>
        <p className="page-lede">
          Back the movement, shop the vibe, or send a booking / press note — all in one place.
        </p>
      </header>

      <section className="container-lux py-6 sm:py-8">
        {cards.length ? (
          <Reveal>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
              {cards.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDonate(c.provider)}
                  className="card-premium p-6 sm:p-8 text-center hover-lift active:scale-[0.98] transition-transform"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full glass-gold text-gold-300 mb-4">
                    <c.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="display-title text-xl font-bold text-platinum">{c.title}</h3>
                  <p className="mt-1 text-sm text-platinum/70">{c.subtitle}</p>
                  <div className="mt-6 btn-gold text-sm pointer-events-none">{c.cta}</div>
                </a>
              ))}
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="card-premium p-8 sm:p-10 text-center">
              <p className="text-platinum/70">
                Tip links are being finalized. In the meantime, the biggest support is to
                <a
                  href={siteConfig.channel.subscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 text-gold-300 hover:text-gold-200 underline-offset-4 hover:underline"
                  onClick={() => trackOutbound(siteConfig.channel.subscribeUrl, "support_empty_subscribe")}
                >
                  subscribe on YouTube
                </a>
                and share the drops.
              </p>
            </div>
          </Reveal>
        )}
      </section>

      <SupportCta variant="banner" />

      <section className="section">
        <Reveal>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="card-premium p-5 sm:p-6">
                <h3 className="display-title text-lg font-bold text-platinum">{f.q}</h3>
                <p className="mt-2 text-platinum/70 text-sm sm:text-base">{f.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section
        id="contact"
        ref={contactRef}
        className="container-lux pb-20 scroll-mt-24 grid gap-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <Reveal>
            <div className="mb-5">
              <span className="eyebrow">Get in touch</span>
              <h2 className="mt-2 display-title text-3xl sm:text-4xl font-black">
                <span className="platinum-text">Contact</span>
              </h2>
              <p className="mt-3 text-platinum/75">
                Booking, press, features, partnerships — send it straight.
              </p>
            </div>
            <ContactForm />
          </Reveal>
        </div>
        <div className="lg:col-span-5 space-y-5">
          <Reveal>
            <div className="card-premium p-6 sm:p-8">
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
          </Reveal>
          <div className="card-premium p-6 sm:p-8">
            <h3 className="display-title text-xl font-bold text-platinum">Follow the moves</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full glass text-platinum hover:text-gold-300 hover:ring-1 hover:ring-gold-300/50 active:scale-95 transition-all"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
