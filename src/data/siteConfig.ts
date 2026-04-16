const envOr = (v: string | undefined, fallback = ""): string => (v && v.trim() ? v.trim() : fallback);

export const siteConfig = {
  name: "TMACK48",
  tagline: "Official Artist Universe",
  description:
    "TMACK48 — Premium flashy universe of music, videos, and moments. Watch the latest drops, subscribe on YouTube, and support the movement.",
  url: envOr(import.meta.env.VITE_SITE_URL, "https://tmack48.com"),
  locale: "en-US",

  channel: {
    id: envOr(import.meta.env.VITE_YOUTUBE_CHANNEL_ID, "UCoshH9Hn9nCEC0z8BS6WdIQ"),
    handle: envOr(import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE, "TMACK48SONGS"),
    url:
      "https://www.youtube.com/@" +
      envOr(import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE, "TMACK48SONGS"),
    subscribeUrl:
      "https://www.youtube.com/@" +
      envOr(import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE, "TMACK48SONGS") +
      "?sub_confirmation=1",
    channelIdUrl:
      "https://www.youtube.com/channel/" +
      envOr(import.meta.env.VITE_YOUTUBE_CHANNEL_ID, "UCoshH9Hn9nCEC0z8BS6WdIQ"),
  },

  contact: {
    email: envOr(import.meta.env.VITE_CONTACT_EMAIL, "booking@tmack48.com"),
  },

  support: {
    paypal: envOr(import.meta.env.VITE_PAYPAL_URL),
    cashapp: envOr(import.meta.env.VITE_CASHAPP_URL),
    donationText: envOr(import.meta.env.VITE_DONATION_TEXT, "Support the movement"),
    merch: envOr(import.meta.env.VITE_MERCH_URL),
  },

  social: {
    instagram: envOr(import.meta.env.VITE_INSTAGRAM_URL),
    facebook: envOr(import.meta.env.VITE_FACEBOOK_URL),
    tiktok: envOr(import.meta.env.VITE_TIKTOK_URL),
    x: envOr(import.meta.env.VITE_X_URL),
    youtube:
      "https://www.youtube.com/@" +
      envOr(import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE, "TMACK48SONGS"),
  },

  analytics: {
    gaMeasurementId: envOr(import.meta.env.VITE_GA_MEASUREMENT_ID),
    metaPixelId: envOr(import.meta.env.VITE_META_PIXEL_ID),
    cfWebAnalyticsToken: envOr(import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN),
  },

  youtubeApiKey: envOr(import.meta.env.VITE_YOUTUBE_API_KEY),

  stats: {
    videos: "20+",
    years: "Active",
    fans: "Growing",
    moves: "Unstoppable",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const nav = {
  primary: [
    { label: "Home", href: "/" },
    { label: "Videos", href: "/videos" },
    { label: "Shorts", href: "/shorts" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Press", href: "/press" },
    { label: "Support", href: "/support" },
    { label: "Contact", href: "/contact" },
  ],
  footer: [
    { label: "Links", href: "/links" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/support" },
  ],
};
