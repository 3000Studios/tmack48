# tmack48.com — Optimization Receipt — 2026-11-08

Scope: smoothness/perf pass + nav hover effects (Scope 1 + 2), plus Boss additions
A (bot microphone), B (bot UI cropping), C (footer nuts physics), D (bot conversation).
Tree: `~/workspace/fleet-acss-2026-10-25/tmack48` (3000Studios/tmack48, main).
Budget: $0.00. Base commit: `222dde4`.

## Gates (final integrated run, this tree, all passes combined)

- `npm run lint` → **exit 0**
- `npm run build` → **exit 0** (tsc + vite + prerender, 58 routes)
- Commit: see "Ship" section at the bottom (hash recorded after push).

## Scope 1 — Smoothness

What was heavy: multiple full-screen canvas rigs each running their own
requestAnimationFrame loop at uncapped devicePixelRatio (up to 2–3× on phones),
a water simulation recomputing layout (`getBoundingClientRect`) on every pointer
event and every rain drop, and a header audio-lines loop that ran even when the
header was off-screen.

Changes:
- **LiquidWater.tsx** (header/footer water): DPR capped at 1.5 desktop / 1 on
  mobile; simulation grid cell 5px on <768px (~35% fewer cells); canvas bounding
  rect cached on resize (+scroll refresh) instead of per-event
  `getBoundingClientRect`. Before: every pointermove/touchmove and every rain
  drop paid a layout read; after: zero layout reads in the hot path.
- **AmbientParticles.tsx** (splash gold stardust): DPR ≤1.5; particle count
  ×0.55 under 640px width.
- **CursorTrail.tsx**: DPR ≤1.5.
- **AudioLines.tsx**: IntersectionObserver gate — the loop pauses while the
  header is off-screen (it previously ran for the whole page lifetime).
- **MobileMenuWallpaper.tsx**: DPR 1.5; 28 particles under 640px (was 48);
  pauses when the tab is hidden.
- **SpotlightBackdrop.tsx**: DPR 1.25 mobile / 1.5 desktop +
  IntersectionObserver pause. Note: this component is not currently mounted
  anywhere (dead code) — changes are consistency-only if it is re-mounted.
- All loops already paused on `visibilitychange` / honored reduced-motion via
  the existing patterns; the stylesheet's global reduced-motion rule already
  flattens animation durations. No layout-property animations were found in the
  hot paths (transform/opacity only). One judgment call: `.card-premium::after`
  carries a static `width: 55%` beside a transform shimmer — deliberately left
  (changing it would alter the look; it is not an animated layout property).
- Look: identical — no visual parameters changed, only cost.

## Scope 2 — Nav hover effects (TaylorMade gold)

- **index.css**: new nav-hover kit —
  `.nav-hover-underline`: 2px gold gradient underline with glow, scaleX sweep
  in 0.28s on hover/focus-visible, stays lit on the active route
  (`[aria-current="page"]`); `.nav-link-label`: letter-spacing ease +0.035em
  over 0.26s; active route gets gold color + glow; `:focus-visible` parity on
  the existing `.nav-shine` sheen sweep; footer links get `.link-u` (sheen band
  + glow sweep + focus underline/outline). Reduced-motion fallbacks included.
- **NavIdleLink.tsx**: desktop links carry the label/shine/underline spans;
  `transition-all` replaced with explicit transition lists (transition-all
  would have animated letter-spacing through layout).
- **Navbar.tsx**: admin-editor extra links got the same treatment.
- **Footer.tsx**: all three link columns (Explore / More / Social) carry
  `link-u` — footer inherits the sweep.

## A — Chat bot microphone (fixed properly)

Root causes found: (1) Android Chrome double-request — the old flow awaited a
`getUserMedia` pre-flight, stopped its tracks, then started recognition, which
re-requested the mic → dead mic; (2) bare `{audio:true}` constraints with every
failure collapsed into one "denied" message; (3) `recognition.start()` fired
after an await, outside the tap's call stack on some browsers.

Fix (`src/lib/botVoice.ts`, both bots):
- Mic handlers are plain non-async; `startListeningSession()` runs in the
  tap's synchronous call stack: `getUserMedia` + `permissions.query` +
  `enumerateDevices` fire concurrently and `rec.start()` runs synchronously in
  the same block.
- One session-held mic stream for the whole session (tracks stop only when the
  session ends) — no double prompt, no dead mic.
- Constraint fallback (enhanced → bare `{audio:true}`) and precise failure
  classification: `denied` vs `no-device` vs `unsupported` vs `error`, each with
  distinct visible copy (reusing the existing RECOGNITION_ERRORS wording).
- A persistent mic-status line (`role="status"`, aria-live) sits above the
  input in BOTH bot panels — never a silent dead button. Speech-to-text flow
  unchanged (interim → draft, final → send); spoken replies (ElevenLabs
  `/api/tts` first, browser-voice fallback) untouched.
- Verification: lint/build exit 0; code-level call-order + grep evidence in
  `/tmp/mic-evidence.md` (getUserMedia / enumerateDevices / permissions.query
  call sites and the distinct status copy). A real permission prompt can only
  be exercised in a live browser — the desk verified the code path end-to-end.

## B — Chat bot UI (nothing cropped)

- Both panels: mobile (<640px) becomes a full-viewport sheet — all four insets
  `max(0.75rem, env(safe-area-inset-*))`, height set by the insets so the panel
  physically cannot exceed the viewport; flex column with the message list
  `flex-1 min-h-0 overflow-y-auto`; input row pinned and `shrink-0`.
- Desktop keeps the floating card, clamped to
  `max-h-[min(640px,calc(100dvh-8rem))]` (public's `max-h-[46vh]` and the
  widget's `max-h-64` removed); all heights in `dvh` so mobile browser chrome
  can't crop. `break-words` + `min-w-0` kill horizontal overflow at 360px.
- Verification: computed checked-at table for 360×640, 390×844, 768×1024,
  1440×900 in `/tmp/bot-ui-evidence.md` (before: public bot cropped ~6px at
  worst-case content, widget cropped 88px with its dev form open; after: both
  fit by construction at all four sizes). Stated honestly as computed
  verification — no live browser was available to the lane.

## C — Footer nuts (physics pile)

- Removed: the lazy giant swaying acorn (`FooterAcornObject` layer) and the
  three floating `/golden-acorn.svg` images from the footer (component file
  kept — the logo/loader still use the motif). Footer bottom bar padding
  `pb-8` → `pb-28` so the pile never covers content.
- New `src/components/footer/FooterNuts.tsx` (React.lazy): **matter-js** rigid
  bodies (circles, restitution 0.25, friction 0.6) resting/piling in a strip at
  the footer bottom (92px desktop / 72px mobile), 14 nuts desktop / 9 mobile,
  custom canvas renderer (DPR ≤1.5) drawing the new high-res sprite
  `public/footer-nut.svg` (hand-authored 256×256 layered-gradient nut with cap,
  stem, specular highlights) with rotation + soft floor shadows.
- Tilt: desktop — pointer position over the footer eases gravity.x; mobile —
  deviceorientation gamma/beta drive gravity, with the iOS permission flow
  behind a small gold "Tilt" pill shown only where `requestPermission` exists.
- Perf: matter-js ships ONLY in the lazy FooterNuts chunk (89,195 B; zero
  eager-bundle cost — verified in build output); IntersectionObserver
  (200px rootMargin) + hidden-tab pause; `prefers-reduced-motion` gets a
  pre-settled static pile with no loop and no tilt listeners.
- Evidence: `/tmp/footer-nuts-evidence.md`.

## D — The bot actually converses

- New `src/lib/conversation.ts`: pure conversation engine — `ConvoState`
  (last 12 turns, `lastSongId`, `lastIntent`, rolling `topicWords`, beef heat
  0–3, greeted), `createConvo()`, `converse(state, raw, persona)`. All catalog
  facts still come from the existing brain — no catalog logic duplicated.
- `bigNutsBrain.ts`: the old `answerQuestion` body is now the stateless
  `answerDirect()` with identical direct-question answers; `answerQuestion()`
  keeps its signature but delegates to `converse()` over a module-level default
  session, so the live site is conversational with zero component changes
  (the per-panel `converse()` integration snippet is documented in
  conversation.ts's header).
- Context carry: follow-ups are rewritten into self-contained direct questions
  ("how long is it" → the last song's length), so pronouns, "play it" after an
  offer, "another one" (kin pick by shared tags/category), and vibe follow-ups
  ("more like that") all resolve against the thread.
- Input-engaged fallbacks: both canned deflections are deleted. The fallback
  echoes the user's own sanitized salient words (profanity stripped, max 5),
  admits the miss in character, and offers a concrete play (top vibe match or
  the newest drop).
- Trash-talk-back: a conservative matcher (20 patterns) fires only on
  bot/music/TMACK-directed disses when there's no clear catalog ask — casual
  profanity with a real request ("play that fucking song X") still plays the
  song. Comeback pools escalate with beef (brush-off → sharper + song flex →
  victory lap with a song as the mic drop). Any friendly turn or real question
  resets beef instantly, with a drop-the-beef line. Guardrails: no slurs, no
  protected-class targeting, no threats; public pool stays profanity-light.
- Verification: lint/build exit 0; honestly-labeled code-traced transcript of
  8 scripted exchanges with the scoring math in `/tmp/conversation-evidence.md`.

## Ship

- Commit: `f01dc35` (single commit, all scopes + A/B/C/D; 21 files,
  +1975/−241). This receipt's final live results ride a receipt-only
  follow-up commit.
- Pushed to `main` → Cloudflare Pages project "tmack48" (git-connected).

### Live verification (https://tmack48.com) — 2026-11-08 ~11:17 EST

All six routes fetched fresh (crawled <1 min before check, after the push)
and serving real content:

- `/` — 200, homepage content live.
- `/videos` — 200, full catalog rendering.
- `/shorts` — 200, full Shorts catalog rendering.
- `/music` — 200, full track catalog rendering.
- `/about` — 200.
- `/contact` — 200.

New-build proof: the live homepage's stylesheet is
`/assets/index-D3Fp7PtD.css` — the exact content hash of the local dist
build from commit `f01dc35` — and the served file contains the new
`.nav-hover-underline` rules (gold gradient, `scaleX` sweep 0.28s,
`:focus-visible` and `[aria-current=page]` states) and the
`.nav-link-label` letter-spacing ease. The new deploy is live, not just
committed.
