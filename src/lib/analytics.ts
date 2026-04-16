import { siteConfig } from "@/data/siteConfig";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function initAnalytics(): void {
  if (typeof window === "undefined") return;

  const ga = siteConfig.analytics.gaMeasurementId;
  if (ga && !document.getElementById("ga-script")) {
    const s = document.createElement("script");
    s.async = true;
    s.id = "ga-script";
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as unknown as Window["gtag"];
    window.gtag!("js", new Date());
    window.gtag!("config", ga, { anonymize_ip: true });
  }

  const fb = siteConfig.analytics.metaPixelId;
  if (fb && !document.getElementById("fb-pixel")) {
    const s = document.createElement("script");
    s.id = "fb-pixel";
    s.innerHTML = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${fb}');fbq('track','PageView');
`;
    document.head.appendChild(s);
  }

  const cf = siteConfig.analytics.cfWebAnalyticsToken;
  if (cf && !document.getElementById("cf-analytics")) {
    const s = document.createElement("script");
    s.id = "cf-analytics";
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: cf }));
    document.head.appendChild(s);
  }
}

export function track(event: string, params: Params = {}): void {
  try {
    if (typeof window === "undefined") return;
    if (window.gtag) window.gtag("event", event, params);
    if (window.fbq) window.fbq("trackCustom", event, params);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[track]", event, params);
    }
  } catch {
    /* no-op */
  }
}

export const trackCta = (label: string, extra: Params = {}) => track("cta_click", { label, ...extra });
export const trackVideo = (action: "open" | "play" | "watch_on_youtube", videoId: string) =>
  track("video_" + action, { video_id: videoId });
export const trackDonate = (provider: "cashapp" | "paypal" | "merch") => track("donation_click", { provider });
export const trackOutbound = (url: string, label?: string) => track("outbound_click", { url, label });
export const trackPageView = (path: string) => track("page_view", { path });
