/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_YOUTUBE_CHANNEL_ID?: string;
  readonly VITE_YOUTUBE_CHANNEL_HANDLE?: string;
  readonly VITE_PAYPAL_URL?: string;
  readonly VITE_CASHAPP_URL?: string;
  readonly VITE_DONATION_TEXT?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_TIKTOK_URL?: string;
  readonly VITE_X_URL?: string;
  readonly VITE_MERCH_URL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_CF_WEB_ANALYTICS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
