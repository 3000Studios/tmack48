import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import { siteConfig } from "@/data/siteConfig";
import { isSupportedLink } from "@/lib/utils";
import { HeartIcon, YoutubeIcon } from "@/components/ui/Icon";
import { trackCta, trackOutbound } from "@/lib/analytics";

export default function Merch() {
  const merch = siteConfig.support.merch;

  return (
    <>
      <Seo
        path="/merch"
        title="Merch"
        description="Official TMACK48 merch — wear the universe. Links go live when the store opens."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">Wear the Crown</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="gold-text">Merch</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          Premium drops ship with the same energy as the music — bold, polished, unmistakably TMACK48.
        </p>
      </header>

      <section className="container-lux pb-20">
        <Reveal>
          <div className="card-premium max-w-2xl p-10">
            {isSupportedLink(merch) ? (
              <>
                <p className="text-platinum/80 leading-relaxed">
                  The official store is live. Tap below to shop the latest TMACK48 pieces.
                </p>
                <a
                  href={merch}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOutbound(merch, "merch_store")}
                  className="btn-gold mt-8 inline-flex"
                >
                  Open merch store
                </a>
              </>
            ) : (
              <>
                <p className="text-platinum/80 leading-relaxed">
                  The merch line is being finalized. Until the store link is published here, the fastest
                  way to back the movement is through support and subscriptions.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/support" onClick={() => trackCta("merch_support")} className="btn-gold">
                    <HeartIcon className="h-5 w-5" /> Support
                  </Link>
                  <a
                    href={siteConfig.channel.subscribeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutbound(siteConfig.channel.subscribeUrl, "merch_subscribe")}
                    className="btn-ghost"
                  >
                    <YoutubeIcon className="h-5 w-5" /> Subscribe
                  </a>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
