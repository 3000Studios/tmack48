import Seo from "@/components/ui/Seo";
import { siteConfig } from "@/data/siteConfig";

export default function Terms() {
  return (
    <>
      <Seo path="/terms" title="Terms of Use" description="TMACK48 terms of use." />
      <article className="container-lux py-16 max-w-3xl text-platinum/80 space-y-6">
        <h1 className="display-title text-4xl sm:text-5xl font-black platinum-text">Terms of Use</h1>
        <p>
          By accessing or using {siteConfig.url}, you agree to the following terms. If you do not agree,
          please do not use the site.
        </p>
        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Content ownership</h2>
        <p>
          All music, videos, imagery, and branding are owned by TMACK48 and/or its respective rights
          holders. Unauthorized reproduction, redistribution, or commercial use without permission is
          prohibited.
        </p>
        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Fair use</h2>
        <p>
          Sharing official YouTube embeds, links, and social posts is encouraged. Please credit TMACK48.
        </p>
        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Support & donations</h2>
        <p>
          Tips and donations are voluntary contributions. They are non-refundable and do not constitute
          purchase of a product.
        </p>
        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Limitations</h2>
        <p>
          The site is provided "as is" without warranties. We are not liable for any indirect damages
          resulting from your use of the site.
        </p>
        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Contact</h2>
        <p>Questions? Use the Contact page form for support and policy questions.</p>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50 pt-8">
          Last updated: {new Date().getFullYear()}
        </p>
      </article>
    </>
  );
}
