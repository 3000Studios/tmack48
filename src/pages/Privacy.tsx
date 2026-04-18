import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import { siteConfig } from "@/data/siteConfig";

export default function Privacy() {
  return (
    <>
      <Seo path="/privacy" title="Privacy Policy" description="TMACK48 privacy policy." />
      <article className="container-lux py-16 prose-premium max-w-3xl text-platinum/80 space-y-6">
        <h1 className="display-title text-4xl sm:text-5xl font-black gold-text">Privacy Policy</h1>
        <p>
          This site (&quot;{siteConfig.url}&quot;) is the official web presence for TMACK48. We respect your
          privacy and aim to keep data collection minimal.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Disclaimer of liability</h2>
        <p>
          Use of this site is at your sole risk. TMACK48 is not liable for any losses or damages arising from
          your use of the site, reliance on automated feeds or embedded media, or interactions with third
          parties (payment processors, streaming platforms, analytics vendors). See{" "}
          <Link to="/terms" className="text-gold-300 link-rise">
            Terms of Use
          </Link>{" "}
          for full limitations and the all-sales-final / no-refunds policy where applicable.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Information we collect</h2>
        <p>
          We only collect anonymous analytics data (page views, clicks, device type) when consent-compatible
          analytics are enabled. We do not sell personal data.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Third-party embeds</h2>
        <p>
          Videos are embedded from YouTube. When you interact with embeds, YouTube&apos;s own privacy policy
          applies. We use privacy-enhanced mode (<em>youtube-nocookie.com</em>) where possible.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Cookies</h2>
        <p>
          The site uses minimal cookies, mostly for performance and optional analytics. Disabling cookies will
          not break core functionality.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Contact</h2>
        <p>
          For privacy-related questions, email{" "}
          <a className="text-gold-300 link-rise" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{" "}
          or use the{" "}
          <Link to="/contact" className="text-gold-300 link-rise">
            Contact
          </Link>{" "}
          page.
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50 pt-8">
          Last updated: {new Date().getFullYear()}
        </p>
      </article>
    </>
  );
}
