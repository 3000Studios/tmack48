import Seo from "@/components/ui/Seo";
import { siteConfig } from "@/data/siteConfig";

export default function Terms() {
  return (
    <>
      <Seo path="/terms" title="Terms of Use" description="TMACK48 terms of use — liability, refunds, purchases." />
      <article className="container-lux py-16 max-w-3xl text-platinum/80 space-y-6">
        <h1 className="display-title text-4xl sm:text-5xl font-black platinum-text">Terms of Use</h1>
        <p>
          By accessing or using {siteConfig.url}, you agree to the following terms. If you do not agree,
          please do not use the site.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">No liability</h2>
        <p>
          The site, all pages, embeds, links, downloads, merchandise flows, donation buttons, and related
          materials are provided strictly <strong className="text-platinum">“as is”</strong> and{" "}
          <strong className="text-platinum">“as available.”</strong> To the fullest extent permitted by law,
          TMACK48 and its operators disclaim all warranties (express or implied). You accept full
          responsibility for how you use the site. TMACK48 is not liable for direct, indirect, incidental,
          consequential, special, punitive, exemplary, or any other damages arising from use of — or
          inability to use — this site or any third-party service linked or embedded here, including without
          limitation downtime, playback issues, checkout flows hosted by payment providers, data loss,
          unauthorized access, or reliance on editorial or automated feeds (including Stories).
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Content ownership</h2>
        <p>
          All music, videos, imagery, logos, typography, naming, trade dress, and branding displayed on this
          site are owned by TMACK48 and/or respective rights holders. Unauthorized reproduction,
          redistribution, sampling for commercial use, or exploitation without permission is prohibited.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Fair use & sharing</h2>
        <p>
          Sharing official YouTube embeds, links, and social posts is encouraged where permitted by platform
          rules. Please credit TMACK48 where reasonable.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Payments, merch, donations</h2>
        <p>
          Tips, donations, digital goods, merchandise purchases, subscriptions, or any checkout processed
          through third-party providers (including but not limited to PayPal, Cash App, Stripe, Shopify, or
          similar) may be subject to those providers’ terms in addition to these Terms.{" "}
          <strong className="text-platinum">
            All transactions are final. No refunds for any reason
          </strong>{" "}
          unless otherwise required by applicable law that cannot be waived and enforced in your jurisdiction.
          Digital goods and creative services are inherently consumable upon delivery or attempt at delivery.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Stories & automated feeds</h2>
        <p>
          Editorial or automated feeds (including hourly Stories) may include embedded stock or library media
          used under applicable licenses. Such media is provided for atmosphere only and does not imply
          endorsement by any rights holder.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Contact</h2>
        <p>
          Questions? Email{" "}
          <a className="text-gold-300 link-rise" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{" "}
          or use the Contact page for support and policy requests.
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50 pt-8">
          Last updated: {new Date().getFullYear()}
        </p>
      </article>
    </>
  );
}
