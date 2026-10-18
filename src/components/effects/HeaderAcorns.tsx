import { useEffect, useRef, useState } from "react";
import { incrementAcornLandingCount } from "@/lib/acornBus";

type Vec = { x: number; y: number; vx: number; vy: number; r: number };
type Faller = Vec & { id: string };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function needsMotionPermission() {
  const anyWin = window as unknown as {
    DeviceMotionEvent?: { requestPermission?: () => Promise<"granted" | "denied"> };
    DeviceOrientationEvent?: { requestPermission?: () => Promise<"granted" | "denied"> };
  };
  return !!(anyWin.DeviceMotionEvent?.requestPermission || anyWin.DeviceOrientationEvent?.requestPermission);
}

async function requestMotionPermission(): Promise<boolean> {
  const anyWin = window as unknown as {
    DeviceMotionEvent?: { requestPermission?: () => Promise<"granted" | "denied"> };
    DeviceOrientationEvent?: { requestPermission?: () => Promise<"granted" | "denied"> };
  };
  try {
    const motionReq = anyWin.DeviceMotionEvent?.requestPermission;
    if (motionReq) {
      const res = await motionReq();
      if (res !== "granted") return false;
    }
    const orientReq = anyWin.DeviceOrientationEvent?.requestPermission;
    if (orientReq) {
      const res = await orientReq();
      if (res !== "granted") return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Draw one acorn in 2D: gold body, darker cap, stem. (x, y) = center, r = radius, spin = rotation rad. */
function drawAcorn(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  // body
  const bodyGrad = ctx.createLinearGradient(-r, -r, r, r);
  bodyGrad.addColorStop(0, "#ffe29a");
  bodyGrad.addColorStop(0.55, "#d4af37");
  bodyGrad.addColorStop(1, "#9a7b24");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.18, r * 0.82, r, 0, 0, Math.PI * 2);
  ctx.fill();
  // cap
  ctx.fillStyle = "#8d7220";
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.52, r * 0.88, r * 0.5, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  // stem
  ctx.strokeStyle = "#6a4a1f";
  ctx.lineWidth = Math.max(1.5, r * 0.14);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.95);
  ctx.quadraticCurveTo(r * 0.18, -r * 1.2, r * 0.38, -r * 1.22);
  ctx.stroke();
  ctx.restore();
}

/**
 * Header acorns — PERF (2026-10-18): previously a Three.js WebGL renderer
 * PLUS a second perpetual physics rAF loop on every page. Now a single 2D
 * canvas loop (merged physics + draw) with the same behavior: acorns roll
 * with device tilt, a shake drops them, and landings in the footer still
 * increment the acorn-landing counter. No three.js, no WebGL context.
 */
export default function HeaderAcorns() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tiltRef = useRef({ ax: 0, ay: 0 });
  const shakeRef = useRef({ lastT: 0, lastMag: 0 });

  const [motionReady, setMotionReady] = useState(false);
  const [asked, setAsked] = useState(false);

  const rollersRef = useRef<Vec[]>([
    { x: 18, y: 22, vx: 0, vy: 0, r: 12 },
    { x: 46, y: 32, vx: 0, vy: 0, r: 12 },
    { x: 74, y: 24, vx: 0, vy: 0, r: 12 },
  ]);
  const fallersRef = useRef<Faller[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;
    if (!needsMotionPermission()) setMotionReady(true);
  }, []);

  const triggerDropRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!motionReady) return;

    const onOrient = (e: DeviceOrientationEvent) => {
      const gamma = typeof e.gamma === "number" ? e.gamma : 0;
      const beta = typeof e.beta === "number" ? e.beta : 0;
      tiltRef.current.ax = clamp(gamma / 35, -1, 1);
      tiltRef.current.ay = clamp(beta / 35, -1, 1);
    };

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const x = a.x ?? 0;
      const y = a.y ?? 0;
      const z = a.z ?? 0;
      const mag = Math.sqrt(x * x + y * y + z * z);
      const t = nowMs();
      const prev = shakeRef.current;
      const dt = t - prev.lastT;
      if (dt < 16) return;
      const d = Math.abs(mag - prev.lastMag);
      shakeRef.current = { lastT: t, lastMag: mag };
      if (d > 9.5) triggerDropRef.current();
    };

    window.addEventListener("deviceorientation", onOrient, { passive: true });
    window.addEventListener("devicemotion", onMotion, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, [motionReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // PERF: cache layout rects. Reading getBoundingClientRect() every frame
    // (plus a querySelector('footer') per frame) forces synchronous layout
    // 60x/sec — Lighthouse flagged this 2.5 KB file as a top CPU consumer
    // for exactly that reason. Rects now refresh on resize/scroll only,
    // plus a slow safety refresh while acorns are falling.
    let hostRect = host.getBoundingClientRect();
    let footerRect: DOMRect | null = null;
    const refreshRects = () => {
      hostRect = host.getBoundingClientRect();
      const footer = document.querySelector("footer");
      footerRect = footer ? footer.getBoundingClientRect() : null;
    };
    const resize = () => {
      refreshRects();
      canvas.width = Math.max(1, Math.floor(hostRect.width * dpr));
      canvas.height = Math.max(1, Math.floor(hostRect.height * dpr));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    window.addEventListener("scroll", refreshRects, { passive: true });
    window.addEventListener("resize", refreshRects);

    triggerDropRef.current = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const seeds = rollersRef.current.slice(0, 3).map((r, i) => {
        const px = (r.x / 100) * rect.width;
        const py = (r.y / 100) * rect.height;
        return {
          id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
          x: px,
          y: py,
          vx: (r.vx ?? 0) * 2.2,
          vy: 8 + Math.random() * 6,
          r: 14,
        };
      });
      fallersRef.current = fallersRef.current.concat(seeds).slice(-24);
    };

    let raf = 0;
    let last = 0;
    let running = true;
    let frame = 0;

    const tick = (t: number) => {
      if (!running) return;
      raf = window.requestAnimationFrame(tick);
      frame += 1;
      // Safety: while acorns are falling, refresh cached rects ~1x/sec in
      // case layout moved without a scroll/resize event.
      if (fallersRef.current.length && frame % 60 === 0) refreshRects();

      const w = hostRect.width || 1;
      const h = hostRect.height || 1;
      const dt = last ? Math.min(32, t - last) : 16;
      last = t;
      const step = dt / 16;
      const tilt = tiltRef.current;

      // --- physics: rollers (percent positions within host) ---
      const padding = 14;
      rollersRef.current = rollersRef.current.map((p) => {
        let x = (p.x / 100) * w;
        let y = (p.y / 100) * h;
        let vx = p.vx;
        let vy = p.vy;
        vx += tilt.ax * 0.22 * step;
        vy += tilt.ay * 0.18 * step;
        vx *= 0.985;
        vy *= 0.985;
        x += vx * step * 8;
        y += vy * step * 8;
        const minX = padding + p.r;
        const maxX = w - padding - p.r;
        const minY = padding + p.r;
        const maxY = h - padding - p.r;
        if (x < minX) { x = minX; vx *= -0.55; } else if (x > maxX) { x = maxX; vx *= -0.55; }
        if (y < minY) { y = minY; vy *= -0.55; } else if (y > maxY) { y = maxY; vy *= -0.55; }
        return { ...p, x: (x / w) * 100, y: (y / h) * 100, vx, vy };
      });

      // --- physics: fallers (viewport px) ---
      if (fallersRef.current.length) {
        const gravity = 0.75 * step;
        const wind = tilt.ax * 0.22 * step;
        const keep: Faller[] = [];
        for (const a of fallersRef.current) {
          let { x, y, vx } = a;
          const vy = a.vy + gravity;
          vx = (vx + wind) * 0.995;
          x += vx * step * 10;
          y += vy * step * 10;
          const landed =
            footerRect &&
            y >= footerRect.top - 8 &&
            x >= footerRect.left - 40 &&
            x <= footerRect.right + 40;
          if (landed) {
            incrementAcornLandingCount(1);
            continue;
          }
          if (y > window.innerHeight + 160) continue;
          keep.push({ ...a, x, y, vx, vy });
        }
        fallersRef.current = keep;
      }

      // --- draw ---
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const a of rollersRef.current) {
        drawAcorn(ctx, (a.x / 100) * w, (a.y / 100) * h, a.r, (a.vx + a.vy) * 0.12);
      }
      for (const a of fallersRef.current) {
        const x = a.x - hostRect.left;
        const y = a.y - hostRect.top;
        if (x < -60 || x > w + 60 || y < -60 || y > h + window.innerHeight + 200) continue;
        drawAcorn(ctx, x, y, a.r, (a.vx + a.vy) * 0.08);
      }
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", refreshRects);
      window.removeEventListener("resize", refreshRects);
    };
  }, []);

  const showEnable = !motionReady && typeof window !== "undefined" && needsMotionPermission();

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {showEnable && (
        <div className="pointer-events-auto absolute right-3 top-3">
          <button
            type="button"
            className="btn-ghost !px-3 !py-2 text-[10px] uppercase tracking-[0.22em]"
            onClick={async () => {
              if (asked) return;
              setAsked(true);
              const ok = await requestMotionPermission();
              setMotionReady(ok);
            }}
          >
            Enable Motion
          </button>
        </div>
      )}
    </div>
  );
}
