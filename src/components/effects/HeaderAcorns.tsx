import { useEffect, useMemo, useRef, useState } from "react";
import { incrementAcornLandingCount } from "@/lib/acornBus";

type Vec = { x: number; y: number; vx: number; vy: number };

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

export default function HeaderAcorns() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  const tiltRef = useRef({ ax: 0, ay: 0 });
  const shakeRef = useRef({ lastT: 0, lastMag: 0 });

  const [motionReady, setMotionReady] = useState(false);
  const [asked, setAsked] = useState(false);

  const [rollers, setRollers] = useState<Vec[]>(() => [
    { x: 18, y: 18, vx: 0, vy: 0 },
    { x: 46, y: 26, vx: 0, vy: 0 },
    { x: 74, y: 20, vx: 0, vy: 0 },
  ]);
  const [fallers, setFallers] = useState<Array<Vec & { id: string }>>([]);

  const acornSrc = useMemo(() => "/golden-acorn.svg", []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;

    // On platforms that don't require permission, start immediately.
    if (!needsMotionPermission()) setMotionReady(true);
  }, []);

  useEffect(() => {
    if (!motionReady) return;

    const onOrient = (e: DeviceOrientationEvent) => {
      // gamma: left/right, beta: front/back
      const gamma = typeof e.gamma === "number" ? e.gamma : 0;
      const beta = typeof e.beta === "number" ? e.beta : 0;
      // Normalize into -1..1
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
      // Tuned for mobile shake; try not to false trigger.
      if (d > 9.5) {
        triggerDrop();
      }
    };

    window.addEventListener("deviceorientation", onOrient, { passive: true });
    window.addEventListener("devicemotion", onMotion, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("devicemotion", onMotion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionReady]);

  const triggerDrop = () => {
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const seeds = rollers.slice(0, 3).map((r, i) => {
      const px = (r.x / 100) * rect.width;
      const py = (r.y / 100) * rect.height;
      const id = `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`;
      return {
        id,
        x: px,
        y: py,
        vx: (r.vx ?? 0) * 0.4,
        vy: 2.5 + Math.random() * 1.5,
      };
    });

    setFallers((prev) => prev.concat(seeds));
  };

  useEffect(() => {
    const tick = (t: number) => {
      const host = hostRef.current;
      const footer = document.querySelector("footer");
      if (!host || !footer) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const hostRect = host.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const dt = lastRef.current ? Math.min(32, t - lastRef.current) : 16;
      lastRef.current = t;

      const tilt = tiltRef.current;
      const ax = tilt.ax;
      const ay = tilt.ay;

      // Rolling acorns are stored as percent positions.
      setRollers((prev) => {
        if (!hostRect.width || !hostRect.height) return prev;
        const w = hostRect.width;
        const h = hostRect.height;
        const padding = 16;
        const next = prev.map((p) => {
          // Convert to px for integration.
          let x = (p.x / 100) * w;
          let y = (p.y / 100) * h;
          let vx = p.vx;
          let vy = p.vy;

          vx += ax * 0.22 * (dt / 16);
          vy += ay * 0.18 * (dt / 16);

          vx *= 0.985;
          vy *= 0.985;

          x += vx * (dt / 16) * 8;
          y += vy * (dt / 16) * 8;

          // Bounce
          const r = 12;
          const minX = padding + r;
          const maxX = w - padding - r;
          const minY = padding + r;
          const maxY = h - padding - r;

          if (x < minX) {
            x = minX;
            vx *= -0.55;
          } else if (x > maxX) {
            x = maxX;
            vx *= -0.55;
          }
          if (y < minY) {
            y = minY;
            vy *= -0.55;
          } else if (y > maxY) {
            y = maxY;
            vy *= -0.55;
          }

          return { x: (x / w) * 100, y: (y / h) * 100, vx, vy };
        });
        return next;
      });

      // Falling acorns are in viewport px.
      setFallers((prev) => {
        if (!prev.length) return prev;
        const gravity = 0.75 * (dt / 16);
        const wind = ax * 0.22 * (dt / 16);
        const keep: typeof prev = [];
        for (const a of prev) {
          let x = a.x;
          let y = a.y;
          let vx = a.vx + wind;
          let vy = a.vy + gravity;

          vx *= 0.995;
          x += vx * (dt / 16) * 10;
          y += vy * (dt / 16) * 10;

          const landed = y >= footerRect.top - 8 && x >= footerRect.left - 40 && x <= footerRect.right + 40;
          if (landed) {
            incrementAcornLandingCount(1);
            continue;
          }
          // Cull if far below viewport
          if (y > window.innerHeight + 120) continue;

          keep.push({ ...a, x, y, vx, vy });
        }
        return keep;
      });

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [rollers]);

  const showEnable = !motionReady && needsMotionPermission();

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {rollers.map((a, i) => (
        <img
          key={`r-${i}`}
          src={acornSrc}
          alt=""
          aria-hidden
          className="absolute h-7 w-7 opacity-80 drop-shadow-[0_12px_22px_rgba(212,175,55,0.45)]"
          style={{
            left: `${a.x}%`,
            top: `${a.y}%`,
            transform: `translate(-50%,-50%) rotate(${(a.vx + a.vy) * 4}deg)`,
            willChange: "transform,left,top",
          }}
        />
      ))}

      {fallers.map((a) => (
        <img
          key={a.id}
          src={acornSrc}
          alt=""
          aria-hidden
          className="fixed h-8 w-8 opacity-90 drop-shadow-[0_18px_32px_rgba(212,175,55,0.55)]"
          style={{
            left: a.x,
            top: a.y,
            transform: `translate(-50%,-50%) rotate(${(a.vx + a.vy) * 7}deg)`,
            willChange: "transform,left,top",
            zIndex: 80,
          }}
        />
      ))}

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

