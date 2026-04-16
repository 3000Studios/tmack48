# TMACK48 — Official Artist Universe

A cinematic, luxury-flashy, production-grade promotional website for the **TMACK48** YouTube music brand. Built to promote the channel hard, preserve YouTube view credit via embeds, and deploy globally on Cloudflare.

Live: **[tmack48.com](https://tmack48.com)**
YouTube: **[@TMACK48SONGS](https://www.youtube.com/@TMACK48SONGS)**

---

## Feature summary

- 3D/animated hero with floating gold/platinum "TMACK48" emblem (React Three Fiber), cinematic lighting, particles
- Random featured hero video on each refresh, muted autoplay (browser-safe), unmute control
- Rotating featured-spotlight, alternating **drop** sections, bidirectional **video marquees**, video **grid** preview
- Dedicated **Videos**, **Shorts**, **About**, **Support**, **Contact**, **Press/EPK**, **Gallery**, **Privacy**, **Terms**, **404** pages
- Premium interactions: custom cursor/particle trail, 3D tilt cards, glint/shimmer, reveal-on-scroll, animated marquees, glass/metallic styling
- Custom gold-themed scrollbar, sticky mobile CTA, back-to-top
- Static video fallback catalog (always works) + optional live YouTube API merge via Cloudflare Pages Function (`/api/youtube/*`) using a server-side key
- Live channel stats (subscribers, views, videoCount) when API key is present
- Full SEO: per-page titles, descriptions, canonical, OG/Twitter, `sitemap.xml`, `robots.txt`, JSON-LD (`MusicGroup` + `WebSite`)
- Accessibility: keyboard navigation, focus rings, reduced-motion, aria labels, semantic headings
- Performance: code splitting, lazy page loads, thumbnail-first videos (iframe on interaction), manual vendor chunks, immutable asset headers, preconnects
- Cloudflare-ready: `wrangler.toml`, Pages build output, `_headers`, `_redirects`, Pages Functions for API & contact form with mailto fallback
- Analytics ready: Google Analytics, Meta Pixel, Cloudflare Web Analytics — env-driven, optional
- Graceful fallbacks everywhere: missing env links hide elegantly, 3D degrades on low-power devices, reduced motion respected

---

## Local setup

```bash
npm install
cp .env.example .env            # fill in any vars you want (all optional)
cp .dev.vars.example .dev.vars  # server-side YouTube key (optional)
npm run dev
```

Open http://localhost:5173 — the site works out of the box with the static video catalog.

### Using the YouTube API (optional)

Two layers:

1. **Client-side (`VITE_YOUTUBE_API_KEY`)** — exposed to the browser. Convenient for local dev, but key is visible.
2. **Server-side (`YOUTUBE_API_KEY`)** — read by Cloudflare Pages Functions under `/api/youtube/*`. **Recommended** for production.

If neither is set, the site uses the static catalog (20 hand-seeded videos). Nothing breaks.

---

## Environment variables

See `.env.example` for the full list and descriptions.

| Var | Scope | Purpose |
| --- | ----- | ------- |
| `VITE_YOUTUBE_API_KEY` | browser | Optional direct client-side fetch |
| `YOUTUBE_API_KEY` | server (Pages Function) | Preferred — private |
| `VITE_SITE_URL` | browser | Canonical site URL |
| `VITE_YOUTUBE_CHANNEL_ID` | browser | Defaults to TMACK48 channel |
| `VITE_YOUTUBE_CHANNEL_HANDLE` | browser | Defaults to TMACK48SONGS |
| `VITE_PAYPAL_URL` / `VITE_CASHAPP_URL` | browser | Support buttons — hide if blank |
| `VITE_DONATION_TEXT` | browser | Support heading text |
| `VITE_CONTACT_EMAIL` | browser | Booking / press email |
| `VITE_INSTAGRAM_URL` / `VITE_FACEBOOK_URL` / `VITE_TIKTOK_URL` / `VITE_X_URL` | browser | Social icons — hide if blank |
| `VITE_MERCH_URL` | browser | Merch button — hide if blank |
| `VITE_GA_MEASUREMENT_ID` / `VITE_META_PIXEL_ID` / `VITE_CF_WEB_ANALYTICS_TOKEN` | browser | Optional analytics |
| `CONTACT_FORWARD_URL` | server | Optional: webhook that the contact form forwards to (Zapier, Formspree, etc.) |

---

## Build & deploy

### Build

```bash
npm run build         # type-checks & bundles to ./dist
npm run preview       # local preview of the built site
```

### Deploy to Cloudflare Pages (Wrangler)

```bash
# One-time
wrangler login

# Deploy (creates the project on first run)
npm run deploy
# => wrangler pages deploy dist --project-name=tmack48 --branch=main
```

To set the server-side YouTube key:

```bash
wrangler pages secret put YOUTUBE_API_KEY --project-name=tmack48
```

### Custom domain (tmack48.com)

The domain is already on Cloudflare. Once the first `pages deploy` creates the `tmack48` project, add the custom domain in the Cloudflare dashboard:

**Pages → tmack48 → Custom domains → Set up a custom domain → `tmack48.com`** (and optionally `www.tmack48.com`).

Cloudflare automatically adds the DNS records since the domain is in the same account.

---

## How video loading works

1. Static catalog (`src/data/videos.ts`) ships with the bundle — site always works.
2. On first render, `useVideos()` calls `/api/youtube/videos` (Pages Function). If the function has `YOUTUBE_API_KEY`, it returns the latest uploads and the client merges them **onto** the static catalog (same `videoId` → updated title/thumbnail; new `videoId` → appended).
3. If that fails AND `VITE_YOUTUBE_API_KEY` is set, the client falls back to a direct call.
4. Channel stats load the same way via `/api/youtube/stats`.
5. All playback uses `youtube-nocookie.com` embeds — YouTube gets the views. Every card exposes a **Watch on YouTube** button, too.

---

## Add a new video

Open `src/data/videos.ts`, add an entry to `SEED`:

```ts
{ videoId: "abc123DEF45", title: "New Drop", category: "single", tags: ["new"], featured: true, blurb: "Short blurb" }
```

Thumbnails come from `i.ytimg.com/vi/<id>/hqdefault.jpg` automatically. No other edits required.

## Update support / social links

Edit `.env` (or the Cloudflare Pages project env vars) — missing ones hide their buttons automatically.

## Add gallery images

Drop images into `/public/images/` and replace `src/data/gallery.ts` with an array of `{ id, src, alt, caption }`. Until then the gallery uses curated YouTube thumbnails that link to each track.

---

## Project structure

```
public/            # static assets + _headers, _redirects, sitemap.xml, robots.txt
functions/         # Cloudflare Pages Functions (YouTube proxy, contact)
src/
  data/            # videos, siteConfig, gallery
  lib/             # youtube, analytics, seo, utils
  hooks/           # useVideos, useReducedMotion, useMediaQuery, useInViewport, useScrollDirection
  components/
    effects/       # Hero3D, CursorTrail, AmbientParticles, TiltCard, Reveal
    navigation/    # Navbar
    footer/        # Footer
    layout/        # Layout (outlet + nav + footer + cursor + sticky CTA + back-to-top)
    hero/          # Hero (3D, video, stats)
    video/         # VideoCard, VideoGrid, VideoMarquee, VideoModal, FeaturedSpotlight, DropSection, ShortsRail, StatsStrip
    gallery/       # Gallery (grid + lightbox)
    support/       # SupportCta
    ui/            # Logo, Icon, Seo, BackToTop, StickyCta
  pages/           # Home, Videos, Shorts, About, Support, Contact, Press, GalleryPage, Privacy, Terms, NotFound
  styles/index.css
  App.tsx
  main.tsx
```

---

## Troubleshooting

- **`wrangler pages deploy` fails with "project not found"** — run once with `--project-name=tmack48` to create it, or create it in the Cloudflare dashboard.
- **YouTube API 403 quota exceeded** — the site silently falls back to the static catalog. Request a quota increase in Google Cloud, or rotate to a fresh key.
- **3D background missing on older devices** — this is intentional: the hero auto-falls-back to a static gold gradient. No action needed.
- **Hero muted and won't unmute** — browsers block auto-unmute; the "Unmute" button hooks the YouTube postMessage API and reloads the iframe with `mute=0` if needed.

---

Built with ❤️, gold, and platinum.
