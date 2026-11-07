import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Space Water — the SAME interactive liquid surface as 3000studios.space
 * (3000-space-water, © Jeremy William Swain), ported to a header/footer band:
 * a real height-field simulation (two-buffer wave propagation, two sub-steps
 * per frame, 0.994 damping) with the rich shading pass from the original —
 * height-mixed deep-water palette, light-facing diffuse, tight + broad
 * specular, fresnel sky lift, caustic crest sparkle and motion glow.
 * Ambient rain drops keep it alive; moving a pointer (or finger) across the
 * header/footer throws real ripples, exactly like the splash on .space.
 *
 * DESIGN LAW: header and footer ONLY — the page body carries the spotlight
 * wallpaper instead. Pauses off-screen; reduced-motion gets one still frame.
 */
export default function LiquidWater({ variant = "header" }: { variant?: "header" | "footer" }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement ?? canvas;

    let raf = 0;
    let running = true;
    let visible = true;
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // --- height-field grid, sized from the band (cell ≈ 3px like .space) ---
    let GW = 160;
    let GH = 40;
    let cur = new Float32Array(0);
    let prev = new Float32Array(0);
    const off = document.createElement("canvas");
    const ox = off.getContext("2d");
    let img: ImageData | null = null;

    const buildGrid = () => {
      GW = Math.max(120, Math.min(520, Math.round(W / 3)));
      GH = Math.max(24, Math.min(170, Math.round(H / 3)));
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

    // Pointer ripples — listeners on the host band so links stay clickable.
    let lastX = -1;
    let lastY = -1;
    const onDown = (e: PointerEvent) => {
      disturb(e.clientX, e.clientY, 26);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (lastX < 0) {
        disturb(e.clientX, e.clientY, 7);
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const steps = Math.max(1, Math.round(Math.hypot(e.clientX - lastX, e.clientY - lastY) / 16));
      for (let s = 0; s <= steps; s++) {
        disturb(lastX + ((e.clientX - lastX) * s) / steps, lastY + ((e.clientY - lastY) * s) / steps, 9);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onLeave = () => {
      lastX = -1;
      lastY = -1;
    };
    if (!reduced) {
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
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

      // ambient rain — the surface is alive before it's touched
      if (!reduced && frameN - rainTimer > 42) {
        rainTimer = frameN;
        if (Math.random() < 0.8) {
          const rect = canvas.getBoundingClientRect();
          disturb(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height, 11);
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

      // rich shading pass — same math family as space-water.js
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
          let t = 0.5 + h * 0.014;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          let r: number, g: number, b: number;
          if (t < 0.5) {
            const u = t * 2;
            r = 5 + 4 * u;
            g = 11 + 19 * u;
            b = 30 + 38 * u;
          } else {
            const u = (t - 0.5) * 2;
            r = 9 + 19 * u;
            g = 30 + 52 * u;
            b = 68 + 66 * u;
          }
          const dif = 1 + (dx * 0.85 + dy * 0.5) * 0.011;
          const dc = dif < 0.55 ? 0.55 : dif > 1.45 ? 1.45 : dif;
          r *= dc;
          g *= dc;
          b *= dc;
          const sa = dx * 0.83 + dy * 0.55;
          const su = sa > 0 ? Math.min(1, sa * 0.05) : 0;
          const su2 = su * su;
          const spec = su2 * su2 * 185 + su2 * 34;
          r += spec * 0.75;
          g += spec * 0.92;
          b += spec;
          const q = dx * dx + dy * dy;
          const fr = Math.min(0.55, q * 0.0035);
          r += fr * 46;
          g += fr * 88;
          b += fr * 118;
          const cr = -lap * 0.016;
          if (cr > 0) {
            const cf = cr > 1 ? 1 : cr;
            const nz = NOISE[(x * 31 + y * 57 + shim) & 255] / 255;
            const sp = cf * cf * (0.5 + 0.5 * nz) * 118;
            r += sp * 0.8;
            g += sp * 0.95;
            b += sp;
          }
          const en = Math.min(1, q / 150);
          if (en > 0.02) {
            const gl = en * en * 105;
            r += gl * 0.45;
            g += gl * 0.85;
            b += gl;
          }
          if (h < 0) {
            const smc = Math.max(0.62, 1 + h * 0.006);
            r *= smc;
            g *= smc;
            b *= smc;
          }
          data[o] = r < 0 ? 0 : r > 255 ? 255 : r;
          data[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
          data[o + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
          data[o + 3] = 255;
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
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, variant]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-space-water={variant}
      className="space-water pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
