# PERF-RECEIPT — tmack48.com load-time & glitch fixes
TASK_ID: TMACK-PERF-20261024 · Budget: $0.00 · Date: 2026-10-24
Status: **Built and verified locally. NOT landed/deployed — parent lands via GitHub connector and live-verifies.**
Build evidence: `npm run build` (tsc -b --noEmit + vite build + prerender) passes; **59 prerendered routes**; `eslint . --max-warnings 0` passes clean.

---

## Headline numbers (measured in build output, not estimated)

Eager payload of the homepage route (entry script + modulepreloads + CSS, parsed from `dist/index.html`):

| | Before | After | Δ |
|---|---|---|---|
| Eager JS (raw) | 493,188 B | 366,958 B | **−126,230 B (−25.6%)** |
| Eager JS+CSS (raw) | 559,585 B | 435,012 B | −124,573 B (−22.3%) |
| Eager set (gzip) | 167,505 B | 127,154 B | −40,351 B (−24.1%) |
| motion chunk | 133,348 B on every route | **eliminated — no motion chunk in dist** | — |
| CSS | 66,397 B | 68,054 B | +1,657 B (the CSS animation kit that replaces motion) |

Eager chunk list after: index 108,664 · react 230,672 · Seo 18,626 · videos-data 7,990 · rolldown-runtime 567 · useReducedMotion 439 · CSS 68,054.
Note: the react chunk grew 222,804 → 230,672 B (+7.9 KB) — rolldown re-attributes shared helpers that used to sit in the motion chunk. Net eager JS is still −126 KB.

Prerender word counts (strip-tags method, same method before/after): home 427 → 427 · /videos 621 → 621 · /music 529 → 529 · /privacy 252 → 252 · **/contact 37 → 167 · /request 38 → 164**. No spot-checked route lost content. (The task brief's "home ~660w" used a different counter; counts here are internally consistent and unchanged where they should be.)

Live timings were **not** re-measured: the live site still serves the old build until this lands, and Paige's baseline timings came through the egress proxy (comparative only). All improvement claims above are bundle measurements from the build output.

---

## VERIFIED glitches found (exact code) and fixed

1. **framer-motion (~133 KB) was preloaded on every one of the 59 routes.** `Navbar` (in the Layout, so every page) imported `motion`/`AnimatePresence` just for the mobile menu; `Reveal` (21 consumer files), `Hero`, `DropSection`, `ShortsRail`, `FeaturedSpotlight`, `VideoModal`, `Gallery` imported it too. → All 8 components converted to CSS equivalents (kit in `src/styles/index.css`); `framer-motion` removed from `package.json`/`package-lock.json` (npm uninstall, 3 packages incl. motion-dom/motion-utils). Zero imports remain.
2. **`Reveal` animated `filter: blur(8px)`** over whole sections on scroll entry — a per-frame repaint of the largest layers on the page. → CSS version animates opacity/transform only (compositor). The blur-in is the one visual nuance dropped; fade/rise/easing/delays are preserved.
3. **`.card-premium` ran an infinite 14 s `gradientShift` background-position animation** on every card — continuous repaint, forever. → Animation removed; the gradient itself (colors/stops) is unchanged, now static.
4. **`.video-title { will-change: transform, filter, opacity, letter-spacing; }`** pinned compositor layers for every video title permanently. → Removed.
5. **`AmbientParticles` rAF loop kept scheduling frames even when off-screen** (it early-returned but never stopped the loop). → Loop now stops scheduling while not intersecting; the IntersectionObserver restarts it.
6. **`FeaturedSpotlight` auto-advance `setInterval` (8 s) re-rendered even in hidden tabs** and for reduced-motion users. → Skips hidden-tab ticks; disabled entirely under `prefers-reduced-motion`.
7. **Below-fold images loading eagerly:** `DropSection` thumbnails and `FeaturedSpotlight` carousel images had no `loading` attribute. → `loading="lazy"` + `decoding="async"` added. (VideoCard, VideoMarquee, ShortsRail, Gallery already had lazy loading, and all image containers already carry aspect-ratio classes, so CLS was already mitigated there.)
8. **Google Fonts payload:** 4 families / 19 weights on every page, including **JetBrains Mono, which has zero references anywhere in `src/`**. → Trimmed to the weights the code actually uses (Playfair 700 only — its sole use is the footer credit; Source Sans 400/500/600/700/900; Unbounded 500/700/900) and the unused family removed. `display=swap` was already set and is kept.

## SUSPECTED (not verified — no real-browser profiler available here)
- **Vortex backdrop:** two fixed pseudo-element layers (160vmax / 110vmax) rotating conic gradients with `mix-blend-mode: screen` on every page (`PageBackdrop` + `.vortex-layer`). Plausible scroll-jank contributor on low-end GPUs; left untouched — it is the site's signature background and removing/altering it is a design call for the Boss. Candidate mitigation if he agrees: drop the smaller ::after layer under 640 px.
- **Hero YouTube iframe** autoplays (muted) 280 ms after mount by design; the YouTube player payload dwarfs the site's own JS. A click-to-play facade would be the biggest remaining LCP win but changes the design/behavior — not done.

## Content fixes applied (from the autopsy list)
- **`public/_redirects`: added `/privacy-policy  /privacy  301`** as the first rule (before the SPA catch-all). Verified present as line 1 of `dist/_redirects` after build.
- **`/contact` fleshed out (37 → 167 words)** in `scripts/prerender.mjs` — facts only from the repo: the ContactForm's inquiry types (Booking, Press, Feature/Collaboration, Partnership, Fan Mail, Other) and required fields (name, email, subject, message), the Support FAQ's own booking answer ("bookings and partnerships are read personally"), and the form's own confirmation copy ("Message received — thank you. We'll respond as soon as possible."). No prices, dates, or response-time promises invented.
- **`/request` fleshed out (38 → 164 words)** in `scripts/prerender.mjs` — the Fans hub's own copy: Community.tsx "How it works" steps and "Every request is read. No promises on timing…" card, plus SongRequestForm's vibe list (7 vibes), its idea prompt, optional name/email, and its confirmation message. The live app serves the same content at /community#request, which is where /request redirects.

## Files changed
- `src/styles/index.css` — CSS animation kit (fade/hero-in/menu/modal/reveal/drop/rail), card-premium infinite animation removed, .video-title will-change removed.
- `src/components/effects/Reveal.tsx` — rewritten: IntersectionObserver + CSS, same props API; reduced-motion path preserved (plain tag).
- `src/components/navigation/Navbar.tsx` — mobile menu converted to CSS (entrance stagger preserved per-item; close keeps a 180 ms whole-menu fade via mounted/closing state; route change closes instantly). Also fixed a pre-existing lint warning (unused `prev` arg in the idle-FX updater).
- `src/components/hero/Hero.tsx` — 4 motion entrances → `.hero-in` CSS with same durations/delays (h1 blur-in dropped, see #2).
- `src/components/video/DropSection.tsx` — motion variants → `.drop-card`/`.drop-copy` CSS driven by its existing useInViewport hook; thumbnail lazy/async.
- `src/components/video/ShortsRail.tsx` — per-card CSS entrance (extracted `ShortCard`, same 0.3 viewport amount, 0.05 s stagger); image decoding async.
- `src/components/video/FeaturedSpotlight.tsx` — carousel motion.button → plain button with computed CSS transform/transition (same offsets/rotations/scale/opacity); images lazy/async; interval guards (see #6).
- `src/components/video/VideoModal.tsx` — AnimatePresence → CSS fade/pop with 160 ms closing fade via local render state; Escape/scroll-lock behavior unchanged.
- `src/components/gallery/Gallery.tsx` — lightbox converted the same way; removed an unused eslint-disable directive.
- `src/components/effects/AmbientParticles.tsx` — rAF loop stops off-screen (see #5).
- `index.html` — Google Fonts URL trimmed (see #8).
- `public/_redirects` — /privacy-policy 301 (see above).
- `scripts/prerender.mjs` — /contact and /request builders fleshed out (see above).
- `package.json`, `package-lock.json` — framer-motion (+ motion-dom, motion-utils) removed.
- `public/sitemap.xml` — regenerated by the build's own prebuild step (same 59 URLs; lastmod = build date). Transparency note: during this session a transient filesystem EPERM briefly truncated `public/sitemap.xml` and `public/robots.txt`; both were restored byte-identical from the intact `dist/` copies of the last good build before the final build ran, and robots.txt content was verified (Allow: / + Mediapartners-Google + sitemap line).

## Found but NOT fixed (with reasons)
- **`three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` are dead dependencies** — zero imports in `src/` (the old WebGL backdrop was removed 2026-10-18 per PageBackdrop's own comment) and no three chunk ships in dist, so page-weight impact is zero today. Left in place to keep this change surgical; recommend a separate cleanup commit.
- **Seo chunk (18.6 KB) eager on every page** (react-helmet-async + seo lib). Every page uses it; splitting risks per-page meta regressions for a modest gain. Left.
- **Service worker `CACHE_VERSION = "tmack48-v1"` is never bumped.** Navigations are network-first and assets are content-hashed, so online staleness risk is low. Left — a deploy-tooling decision, not page perf.
- **Navbar idle-FX interval (5 s)** causes tiny state updates on desktop nav forever. It is the site's designed idle sparkle (CSS-class effects); cost is negligible. Left.
- **Mobile menu exit animation:** items no longer stagger out individually (the whole menu fades in 180 ms). Entrance stagger is preserved. Micro-difference, accepted for the 133 KB saving.
- **Hero `useReducedMotion` wiring:** the hook exists and is honored by Reveal, DropSection, CursorTrail, AmbientParticles, TiltCard, and now FeaturedSpotlight's rotation; Hero's CSS entrances are neutralized by the global `prefers-reduced-motion` block in index.css (durations forced to ~0). No change needed.

## Landing checklist for parent
1. Commit all files above (dist/ is build output — follow the repo's existing convention).
2. Deploy via the usual Cloudflare Pages path.
3. Live-verify: homepage eager JS (no motion chunk), `/privacy-policy` → 301 → `/privacy`, /contact and /request word counts, mobile menu open/close, video modal open/close, gallery lightbox.
