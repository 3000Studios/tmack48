import { siteConfig } from "@/data/siteConfig";

export interface SeoInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "music.musician" | "video.other" | "article";
}

export interface SeoData {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: SeoInput["type"];
}

export function seo(input: SeoInput = {}): SeoData {
  const title = input.title ? `${input.title} — TMACK48` : "TMACK48 — Official Artist Universe";
  const description = input.description ?? siteConfig.description;
  const canonical = `${siteConfig.url.replace(/\/$/, "")}${input.path ?? "/"}`;
  const image = input.image ?? `${siteConfig.url.replace(/\/$/, "")}/og-image.svg`;
  const type = input.type ?? "website";
  return { title, description, canonical, image, type };
}

export const artistSchema = () => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "TMACK48",
  url: siteConfig.url,
  sameAs: [
    siteConfig.social.youtube,
    siteConfig.social.instagram,
    siteConfig.social.facebook,
    siteConfig.social.tiktok,
    siteConfig.social.x,
  ].filter(Boolean),
  image: `${siteConfig.url}/og-image.svg`,
  description: siteConfig.description,
});

export const siteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
});
