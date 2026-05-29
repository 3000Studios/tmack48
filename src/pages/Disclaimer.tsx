import Seo from "@/components/ui/Seo";
import { siteConfig } from "@/data/siteConfig";

export default function Disclaimer() {
  return (
    <>
      <Seo
        path="/disclaimer"
        title="Disclaimer"
        description="General disclaimer for the TMACK48 website and its content."
      />
      <article className="container-lux py-16 max-w-3xl text-platinum/80 space-y-6">
        <h1 className="display-title text-4xl sm:text-5xl font-black platinum-text">Disclaimer</h1>
        <p>
          The information and media on {siteConfig.url} are provided for general entertainment and
          informational purposes. While we aim for accuracy, we make no representations or warranties
          of any kind, express or implied, about the completeness, accuracy, reliability, or
          availability of the site or its content.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">No professional advice</h2>
        <p>
          Nothing on this site constitutes financial, legal, medical, or other professional advice.
          Any reliance you place on the content is strictly at your own risk.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">External links & embeds</h2>
        <p>
          This site links to and embeds third-party content (including YouTube videos and payment
          providers). We have no control over the content, policies, or availability of those
          external services and accept no responsibility for them.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Advertising</h2>
        <p>
          Pages may display advertising served by Google AdSense or affiliate links. Ads and
          sponsored placements do not imply endorsement, and we are not responsible for the products
          or claims of third-party advertisers.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Limitation</h2>
        <p>
          To the fullest extent permitted by law, TMACK48 and its operators are not liable for any
          loss or damage arising from use of this site. See our{" "}
          <a className="text-gold-300 link-rise" href="/terms">
            Terms of Use
          </a>{" "}
          for full details.
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50 pt-8">
          Last updated: {new Date().getFullYear()}
        </p>
      </article>
    </>
  );
}
