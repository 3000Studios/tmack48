import { siteConfig } from "@/data/siteConfig";
import { isSupportedLink } from "@/lib/utils";
import { HeartIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackDonate, trackOutbound } from "@/lib/analytics";
import Reveal from "@/components/effects/Reveal";

export default function SupportCta({ variant = "section" }: { variant?: "section" | "banner" }) {
  const { paypal, cashapp, merch, donationText } = siteConfig.support;
  const any = isSupportedLink(paypal) || isSupportedLink(cashapp) || isSupportedLink(merch);

  if (variant === "banner") {
    return (
      <div className="glass-gold metal-border rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <p className="eyebrow flex items-center gap-2">
            <HeartIcon className="h-4 w-4" /> {donationText}
          </p>
          <h3 className="mt-1 display-title text-xl sm:text-2xl font-bold text-platinum">
            Fuel the next drop.
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSupportedLink(cashapp) && (
            <a
              href={cashapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackDonate("cashapp")}
              className="btn-gold !py-2.5 text-sm"
            >
              Cash App
            </a>
          )}
          {isSupportedLink(paypal) && (
            <a
              href={paypal}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackDonate("paypal")}
              className="btn-diamond !py-2.5 text-sm"
            >
              PayPal
            </a>
          )}
          <a
            href={siteConfig.channel.subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutbound(siteConfig.channel.subscribeUrl, "support_subscribe")}
            className="btn-ghost !py-2.5 text-sm"
          >
            <YoutubeIcon className="h-4 w-4" /> Subscribe
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <Reveal>
        <div className="relative overflow-hidden card-premium p-8 sm:p-14 text-center">
          <div className="noise-overlay" />
          <span className="eyebrow">
            <HeartIcon className="h-4 w-4 inline -translate-y-0.5 mr-1" />
            {donationText}
          </span>
          <h2 className="mt-3 section-title">
            <span className="gold-text">Support the Movement</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-platinum/80 text-lg leading-relaxed text-balance">
            Every tip, subscription, and share fuels the studio, the visuals, and the next drop.
            Join the real ones pushing TMACK48 to the top.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isSupportedLink(cashapp) && (
              <a
                href={cashapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackDonate("cashapp")}
                className="btn-gold"
              >
                <HeartIcon className="h-5 w-5" /> Cash App
              </a>
            )}
            {isSupportedLink(paypal) && (
              <a
                href={paypal}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackDonate("paypal")}
                className="btn-diamond"
              >
                <HeartIcon className="h-5 w-5" /> PayPal
              </a>
            )}
            {isSupportedLink(merch) && (
              <a
                href={merch}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackDonate("merch")}
                className="btn-ghost"
              >
                Shop Merch
              </a>
            )}
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutbound(siteConfig.channel.subscribeUrl, "support_subscribe")}
              className="btn-ghost"
            >
              <YoutubeIcon className="h-5 w-5" /> Subscribe
            </a>
          </div>

          {!any && (
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-platinum/50">
              Support links coming soon — subscribe to the channel in the meantime.
            </p>
          )}
        </div>
      </Reveal>
    </section>
  );
}
