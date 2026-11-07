import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Space Water — the SAME interactive liquid surface as 3000studios.space
 * (3000-space-water, © Jeremy William Swain): a real height-field
 * simulation (two-buffer wave propagation, two sub-steps per frame,
 * 0.994 damping).
 *
 * Boss order 2026-11-07: the water is CLEAR and the ripples are GOLD.
 * The flat surface renders fully transparent so the alley wallpaper
 * beneath shows straight through; only moving water — specular glints,
 * caustic crest sparkle and slope energy — catches the gold of the
 * TMACK48 wall sign (deep gold #C4962C up to hot highlight #FFEAA6),
 * with alpha proportional to that light. Colors are matched to the
 * wallpaper scene (rainy night, gold sign) so the surface blends in.
 * Ambient rain drops keep it barely alive; moving a pointer (or finger)
 * anywhere on the page throws bright gold ripples.
 *
 * Boss order 2026-11-07 (afternoon): the water fills the WHOLE PAGE on
 * every page — it mounts as the top layer of PageBackdrop, above the
 * alley film and below every element (nav, content, footer all sit on
 * higher stacking layers). It supersedes the earlier header/footer-band
 * placement. Reduced-motion gets one still (clear) frame.
 */
export default function LiquidWater() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let visible = true;
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // --- height-field grid, sized from the viewport (cell ≈ 4px) ---
    let GW = 160;
    let GH = 120;
    let cur = new Float32Array(0);
    let prev = new Float32Array(0);
    const off = document.createElement("canvas");
    const ox = off.getContext("2d");
    let img: ImageData | null = null;

    const buildGrid = () => {
      GW = Math.max(160, Math.min(640, Math.round(W / 4)));
      GH = Math.max(120, Math.min(400, Math.round(H / 4)));
      cur = new Float32Array(GW * GH);
      prev = new Float32Array(GW * GH);
      off.width = GW;
      off.height = GH;
      img = ox ? ox.createImageData(GW, GH) : null;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      buildGrid();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const NOISE = new Uint8Array(256);
    for (let n = 0; n < 256; n++) {
      const sv = Math.sin(n * 127.1) * 43758.5453;
      NOISE[n] = Math.floor((sv - Math.floor(sv)) * 256);
    }

    const disturb = (cx: number, cy: number, str: number) => {
      const rect = canvas.getBoundingClientRect();
      const gx = Math.round(((cx - rect.left) / Math.max(1, rect.width)) * GW);
      const gy = Math.round(((cy - rect.top) / Math.max(1, rect.height)) * GH);
      const rC = 3;
      for (let y = -rC; y <= rC; y++) {
        for (let x = -rC; x <= rC; x++) {
          const xx = gx + x;
          const yy = gy + y;
          if (xx < 1 || yy < 1 || xx >= GW - 1 || yy >= GH - 1) continue;
          const d = Math.sqrt(x * x + y * y);
          if (d <= rC) prev[yy * GW + xx] += str * (1 - d / (rC + 1));
        }
      }
    };

    // Pointer ripples — the canvas is pointer-events-none and behind all
    // content, so listeners live on the window: a pointer moving anywhere
    // on the page ripples the water under it, and links stay clickable.
    let lastX = -1;
    let lastY = -1;
    const onDown = (e: PointerEvent) => {
      disturb(e.clientX, e.clientY, 34);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (lastX < 0) {
        disturb(e.clientX, e.clientY, 10);
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const steps = Math.max(1, Math.round(Math.hypot(e.clientX - lastX, e.clientY - lastY) / 16));
      for (let s = 0; s <= steps; s++) {
        disturb(lastX + ((e.clientX - lastX) * s) / steps, lastY + ((e.clientY - lastY) * s) / steps, 13);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onLeave = () => {
      lastX = -1;
      lastY = -1;
    };
    // Finger-drag path (Boss order 2026-11-07 evening): on touch screens a
    // drag usually becomes a page scroll, and the browser fires
    // pointercancel and stops pointermove — so the water also listens to
    // raw touchmove (passive: scrolling is never blocked) and traces the
    // finger's path with the same interpolation as the pointer path. A
    // finger dragged anywhere across the screen trails gold ripples.
    const traceTo = (cx: number, cy: number, str: number) => {
      if (lastX < 0) {
        disturb(cx, cy, str);
        lastX = cx;
        lastY = cy;
        return;
      }
      const steps = Math.max(1, Math.round(Math.hypot(cx - lastX, cy - lastY) / 16));
      for (let s = 0; s <= steps; s++) {
        disturb(lastX + ((cx - lastX) * s) / steps, lastY + ((cy - lastY) * s) / steps, str);
      }
      lastX = cx;
      lastY = cy;
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      disturb(t.clientX, t.clientY, 30);
      lastX = t.clientX;
      lastY = t.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      traceTo(t.clientX, t.clientY, 15);
    };
    const onTouchEnd = () => onLeave();
    if (!reduced) {
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointercancel", onLeave);
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("touchcancel", onTouchEnd);
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    let frameN = 0;
    let rainTimer = 0;
    const draw = () => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden || !img || !ox) return;
      frameN++;

      // ambient rain — a faint gold shimmer before it's touched
      if (!reduced && frameN - rainTimer > 30) {
        rainTimer = frameN;
        if (Math.random() < 0.85) {
          const rect = canvas.getBoundingClientRect();
          disturb(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height, 8);
        }
      }

      // two wave sub-steps per frame at 0.994 damping (the .space recipe)
      for (let sub = 0; sub < 2; sub++) {
        for (let y = 1; y < GH - 1; y++) {
          const row = y * GW;
          for (let x = 1; x < GW - 1; x++) {
            const i = row + x;
            cur[i] = ((prev[i - 1] + prev[i + 1] + prev[i - GW] + prev[i + GW]) / 2 - cur[i]) * 0.994;
          }
        }
        const tmp = prev;
        prev = cur;
        cur = tmp;
      }

      // CLEAR + GOLD shading pass (Boss order 2026-11-07): the flat
      // surface is fully transparent; only moving water catches gold
      // light — specular glints, caustic crest sparkle, slope energy —
      // ramped from deep gold (196,150,44) to hot highlight (255,234,166),
      // alpha proportional to the light so still water disappears.
      const data = img.data;
      const shim = (frameN >> 1) * 7;
      const K = GW / 200;
      for (let y = 0; y < GH; y++) {
        const row = y * GW;
        for (let x = 0; x < GW; x++) {
          const i = row + x;
          const dx = ((x < GW - 1 ? prev[i + 1] : 0) - (x > 0 ? prev[i - 1] : 0)) * K;
          const dy = ((y < GH - 1 ? prev[i + GW] : 0) - (y > 0 ? prev[i - GW] : 0)) * K;
          const h = prev[i];
          const lap =
            ((x > 0 ? prev[i - 1] : h) + (x < GW - 1 ? prev[i + 1] : h) + (y > 0 ? prev[i - GW] : h) + (y < GH - 1 ? prev[i + GW] : h) - 4 * h) *
            K *
            K;
          const o = i * 4;
          // gold light terms, same math family as space-water.js
          const sa = dx * 0.83 + dy * 0.55;
          const su = sa > 0 ? Math.min(1, sa * 0.05) : 0;
          const su2 = su * su;
          const spec = su2 * su2 * 185 + su2 * 34; // specular, 0..~219
          const q = dx * dx + dy * dy;
          const fres = Math.min(0.55, q * 0.0035); // slope sheen, 0..0.55
          let spark = 0;
          const cr = -lap * 0.016;
          if (cr > 0) {
            const cf = cr > 1 ? 1 : cr;
            const nz = NOISE[(x * 31 + y * 57 + shim) & 255] / 255;
            spark = cf * cf * (0.5 + 0.5 * nz) * 118; // caustic sparkle, 0..~118
          }
          const en = Math.min(1, q / 150); // motion energy, 0..1
          const energy = en * en * 105;
          // diffuse tilt — light-facing slopes read a touch brighter
          const dif = 1 + (dx * 0.85 + dy * 0.5) * 0.011;
          const dc = dif < 0.6 ? 0.6 : dif > 1.4 ? 1.4 : dif;
          let glow = (spec / 219) * 0.85 + (spark / 118) * 0.55 + fres * 0.5 + (energy / 105) * 0.45;
          glow *= dc;
          // crests catch a whisper of light even between glints
          if (h > 0) glow += Math.min(0.12, h * 0.0022);
          glow = glow < 0 ? 0 : glow > 1 ? 1 : glow;
          // gamma so faint motion stays faint and real ripples pop
          const lit = glow * glow * (3 - 2 * glow);
          data[o] = 196 + (255 - 196) * lit;
          data[o + 1] = 150 + (234 - 150) * lit;
          data[o + 2] = 44 + (166 - 44) * lit;
          data[o + 3] = Math.round(lit * 238);
        }
      }
      ox.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      if (reduced) running = false; // one still frame for reduced motion
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-space-water="page"
      className="space-water pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
