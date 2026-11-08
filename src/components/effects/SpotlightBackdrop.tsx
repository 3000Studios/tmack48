import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Spotlight wallpaper — the page body's living background.
 *
 * MUSIC-RESPONSIVE: a band engine drives the rig like an EQ — a 116 BPM
 * beat clock whose bass pulse fattens and brightens the cones, whose mid
 * band steers their sweep, and whose high band throws sparkle off the beams.
 * (YouTube's iframe audio is sealed off by the browser, so the rig dances
 * to the beat engine itself — it never sits still and never needs a file.)
 *
 * MOUSE / HOVER-RESPONSIVE: the beams bend toward the pointer, the nearest
 * cone leans in hardest, and hovering any link, button or tile flares a
 * spotlight onto it. Touch works the same way.
 *
 * Perf: one canvas, DPR-capped, ~5 gradient cones per frame, pauses in a
 * hidden tab; reduced-motion visitors get one still, softly lit frame.
 * (2026-11-08: DPR cap tightened to 1.25 on small screens / 1.5 on desktop
 * and an IntersectionObserver pauses the loop while the canvas is
 * off-screen, matching the rest of the effects kit.)
 */

type Spot = {
  anchorX: number; // fraction of width along the top rig
  hue: [number, number, number]; // rgb
  phase: number;
  lean: number; // current target x (px)
  leanV: number;
  width: number; // base cone half-width at the floor (px)
};

const PALETTE: [number, number, number][] = [
  [255, 205, 92], // gold
  [127, 219, 255], // ice
  [240, 244, 255], // platinum
  [212, 175, 55], // deep gold
  [168, 140, 255], // violet accent
];

export default function SpotlightBackdrop() {
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
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5);

    const resize = () => {
      W = Math.max(1, window.innerWidth);
      H = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spots: Spot[] = PALETTE.map((hue, i) => ({
      anchorX: 0.08 + (i / (PALETTE.length - 1)) * 0.84,
      hue,
      phase: i * 1.93,
      lean: 0,
      leanV: 0,
      width: 130 + (i % 3) * 45,
    }));
    spots.forEach((s) => (s.lean = s.anchorX * window.innerWidth));

    // pointer state (lerped) + hover flare target
    const ptr = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0 };
    let flare: { x: number; y: number; until: number } | null = null;

    const onPointer = (e: PointerEvent) => {
      ptr.tx = e.clientX;
      ptr.ty = e.clientY;
      if (ptr.x < -1000) {
        ptr.x = e.clientX;
        ptr.y = e.clientY;
      }
      ptr.energy = Math.min(1.5, ptr.energy + 0.12);
    };
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a,button,[data-tile]");
      if (!el) return;
      const r = (el as HTMLElement).getBoundingClientRect();
      flare = { x: r.left + r.width / 2, y: r.top + r.height / 2, until: performance.now() + 650 };
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    // PERF (2026-11-08): pause while the canvas is off-screen too, not
    // just in a hidden tab.
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    const BPM = 116;
    const draw = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (document.hidden || !visible) return;
      const t = now / 1000;

      // ---- band engine (the "EQ"): bass / mid / high from the beat clock ----
      const beat = (t * BPM) / 60;
      const beatFrac = beat - Math.floor(beat);
      const bass = Math.pow(1 - beatFrac, 2.6) * (Math.floor(beat) % 4 === 3 ? 0.75 : 1); // 4-on-the-floor, softer 4th
      const mid = 0.5 + 0.5 * Math.sin(t * ((BPM / 60) * Math.PI) + 1.3) * Math.sin(t * 0.43);
      const high = Math.pow(0.5 + 0.5 * Math.sin(t * ((BPM / 60) * Math.PI * 4) + Math.sin(t * 2.7) * 2), 3);

      // pointer easing + energy decay
      ptr.x += (ptr.tx - ptr.x) * 0.06;
      ptr.y += (ptr.ty - ptr.y) * 0.06;
      ptr.energy *= 0.96;
      const hasPtr = ptr.x > -1000 && !reduced;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";

      const floorY = H * 1.02;
      spots.forEach((s, i) => {
        // musical sway: mid band steers the sweep, phase offset per beam
        const sway = Math.sin(t * (0.24 + mid * 0.3) + s.phase) * W * 0.16 + Math.sin(t * 0.11 + s.phase * 2.1) * W * 0.05;
        let target = s.anchorX * W + sway;
        // pointer bend: nearer beams lean in harder
        if (hasPtr) {
          const d = Math.abs(ptr.x - s.anchorX * W);
          const pull = Math.max(0, 1 - d / (W * 0.55));
          target += (ptr.x - target) * pull * pull * 0.55;
        }
        if (flare && now < flare.until) {
          const d = Math.abs(flare.x - s.anchorX * W);
          const pull = Math.max(0, 1 - d / (W * 0.6));
          target += (flare.x - target) * pull * 0.7;
        }
        // spring toward target (keeps motion fluid, never snappy)
        s.leanV += (target - s.lean) * 0.012;
        s.leanV *= 0.9;
        s.lean += s.leanV;

        const ax = s.anchorX * W;
        const halfW = s.width * (1 + bass * 0.35) * (W < 640 ? 0.72 : 1);
        const intensity = 0.1 + bass * 0.13 + mid * 0.03 + (hasPtr ? ptr.energy * 0.05 : 0);
        const [r, g, b] = s.hue;

        // cone
        const grad = ctx.createLinearGradient(ax, -20, s.lean, floorY);
        grad.addColorStop(0, `rgba(${r},${g},${b},${(intensity * 1.9).toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(${r},${g},${b},${(intensity * 0.8).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(ax - 7, -20);
        ctx.lineTo(ax + 7, -20);
        ctx.lineTo(s.lean + halfW, floorY);
        ctx.lineTo(s.lean - halfW, floorY);
        ctx.closePath();
        ctx.fill();

        // floor pool where the beam lands
        const pool = ctx.createRadialGradient(s.lean, floorY - H * 0.06, 4, s.lean, floorY - H * 0.06, halfW * 1.25);
        pool.addColorStop(0, `rgba(${r},${g},${b},${(intensity * 1.15).toFixed(3)})`);
        pool.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = pool;
        ctx.beginPath();
        ctx.ellipse(s.lean, floorY - H * 0.06, halfW * 1.25, H * 0.055, 0, 0, Math.PI * 2);
        ctx.fill();

        // high-band sparkle riding the beam
        if (high > 0.55 && !reduced) {
          const sx = ax + (s.lean - ax) * 0.5 + Math.sin(t * 7 + i * 3.1) * 22;
          const sy = H * (0.3 + 0.25 * Math.sin(t * 3.1 + i));
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 26);
          sg.addColorStop(0, `rgba(255,255,255,${((high - 0.55) * 0.5).toFixed(3)})`);
          sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(sx - 26, sy - 26, 52, 52);
        }
      });

      // hover flare — a tight spot pinned to the hovered element
      if (flare && now < flare.until && !reduced) {
        const a = Math.min(1, (flare.until - now) / 220);
        const fg = ctx.createRadialGradient(flare.x, flare.y, 0, flare.x, flare.y, 130);
        fg.addColorStop(0, `rgba(255,226,154,${(0.22 * a).toFixed(3)})`);
        fg.addColorStop(1, "rgba(255,226,154,0)");
        ctx.fillStyle = fg;
        ctx.fillRect(flare.x - 130, flare.y - 130, 260, 260);
      }

      ctx.globalCompositeOperation = "source-over";
      if (reduced) running = false; // still frame
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("mouseover", onOver);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" data-spotlight-wallpaper className="absolute inset-0 h-full w-full" />;
}
