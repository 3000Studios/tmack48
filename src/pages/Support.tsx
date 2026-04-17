import Seo from "@/components/ui/Seo";
import SupportCta from "@/components/support/SupportCta";
import Reveal from "@/components/effects/Reveal";
import { siteConfig } from "@/data/siteConfig";
import { isSupportedLink } from "@/lib/utils";
import { HeartIcon, YoutubeIcon } from "@/components/ui/Icon";
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
    a: "Absolutely. Head to the Contact page and send details — bookings and partnerships are read personally.",
  },
];

export default function Support() {
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

  return (
    <>
      <Seo
        path="/support"
        title="Support"
        description="Support TMACK48 — Cash App, PayPal, merch, and subscriptions. Every move matters."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">Back the Movement</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="gold-text">Support</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          Real ones keep real artists running. Pick your way — every dollar, every follow, every share
          pushes TMACK48 further.
        </p>
      </header>

      <section className="container-lux py-8">
        {cards.length ? (
          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {cards.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDonate(c.provider)}
                  className="card-premium p-8 text-center hover-lift"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full glass-gold text-gold-300 mb-4">
                    <c.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="display-title text-xl font-bold text-platinum">{c.title}</h3>
                  <p className="mt-1 text-sm text-platinum/70">{c.subtitle}</p>
                  <div className="mt-6 btn-gold text-sm">{c.cta}</div>
                </a>
              ))}
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="card-premium p-10 text-center">
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
          <div className="grid gap-6 lg:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="card-premium p-6">
                <h3 className="display-title text-lg font-bold text-platinum">{f.q}</h3>
                <p className="mt-2 text-platinum/70">{f.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <div className="card-premium p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="display-title text-xl font-bold text-platinum">Keep the Momentum</h3>
              <p className="text-platinum/70">Subscribe and share to keep new drops coming every month.</p>
            </div>
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <YoutubeIcon className="h-5 w-5" /> Subscribe
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
