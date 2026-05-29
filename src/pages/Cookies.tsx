import Seo from "@/components/ui/Seo";
import { siteConfig } from "@/data/siteConfig";

export default function Cookies() {
  return (
    <>
      <Seo
        path="/cookies"
        title="Cookie Policy"
        description="How TMACK48 uses cookies and similar technologies."
      />
      <article className="container-lux py-16 max-w-3xl text-platinum/80 space-y-6">
        <h1 className="display-title text-4xl sm:text-5xl font-black platinum-text">Cookie Policy</h1>
        <p>
          This Cookie Policy explains how {siteConfig.url} uses cookies and similar technologies when
          you visit the site.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">What cookies we use</h2>
        <p>
          We use a small number of cookies and local storage entries for essential functionality
          (such as remembering whether you have dismissed the intro), basic analytics, and — where
          enabled — advertising provided by Google AdSense. Advertising partners may set their own
          cookies to measure and personalize ads in line with their policies.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Managing cookies</h2>
        <p>
          You can control or delete cookies through your browser settings at any time. Disabling
          cookies may affect some site features. For Google’s advertising cookies, you can review and
          adjust your preferences at{" "}
          <a className="text-gold-300 link-rise" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          .
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Third-party content</h2>
        <p>
          Embedded content (such as YouTube players) may set cookies or collect data governed by the
          respective provider’s privacy and cookie policies.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Contact</h2>
        <p>
          Questions about cookies? Email{" "}
          <a className="text-gold-300 link-rise" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>
          .
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50 pt-8">
          Last updated: {new Date().getFullYear()}
        </p>
        <p className="text-xs text-platinum/40">
          {/* This policy is provided for general information and is not legal advice. Have an attorney review before relying on it. */}
        </p>
      </article>
    </>
  );
}
