import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function AmbientParticles({
  count = 60,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = (c.width = c.clientWidth * dpr);
    let h = (c.height = c.clientHeight * dpr);
    ctx.scale(dpr, dpr);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * (w / dpr),
      y: Math.random() * (h / dpr),
      r: Math.random() * 1.4 + 0.4,
      v: Math.random() * 0.25 + 0.08,
      drift: (Math.random() - 0.5) * 0.2,
      hue: Math.random() < 0.6 ? 48 : 190,
      flick: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      w = c.width = c.clientWidth * dpr;
      h = c.height = c.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", resize);

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w / dpr, h / dpr);
      for (const d of dots) {
        d.y -= d.v;
        d.x += d.drift;
        d.flick += 0.05;
        if (d.y < -5) {
          d.y = h / dpr + 5;
          d.x = Math.random() * (w / dpr);
        }
        if (d.x < -5) d.x = w / dpr + 5;
        if (d.x > w / dpr + 5) d.x = -5;
        const alpha = 0.4 + Math.sin(d.flick) * 0.3;
        const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 6);
        grd.addColorStop(0, `hsla(${d.hue},85%,70%,${alpha})`);
        grd.addColorStop(1, `hsla(${d.hue},85%,60%,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
