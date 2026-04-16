import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useMediaQuery";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hue: number;
  size: number;
}

const HUES = [45, 48, 50, 190, 195, 0]; // gold..diamond..silver

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    if (reduced || isTouch) return;
    const canvas = canvasRef.current;
    const ring = ringRef.current;
    if (!canvas || !ring) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.body.classList.add("cursor-ready");

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    let mx = w / 2;
    let my = h / 2;
    let rx = mx;
    let ry = my;
    let hueIndex = 0;
    let hovering = false;

    const spawn = (x: number, y: number, count = 1, boost = 1) => {
      for (let i = 0; i < count; i++) {
        const hue = HUES[hueIndex % HUES.length];
        hueIndex++;
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.7 * boost,
          vy: (Math.random() - 0.5) * 0.7 * boost,
          life: 0,
          max: 45 + Math.random() * 35,
          hue,
          size: 1 + Math.random() * 2.2,
        });
      }
      if (particles.length > 220) particles.splice(0, particles.length - 220);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      spawn(mx, my, 2);
      const t = e.target as HTMLElement | null;
      if (t) {
        const isInteractive =
          t.closest("a, button, [role=button], input, textarea, select, [data-cursor='link']") !== null;
        hovering = isInteractive;
      }
    };
    const onClick = (e: MouseEvent) => {
      spawn(e.clientX, e.clientY, 24, 3.2);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick);

    let raf = 0;
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hovering ? 1.9 : 1})`;
      ring.style.opacity = hovering ? "1" : "0.9";

      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        const t = p.life / p.max;
        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = (1 - t) * 0.9;
        const size = p.size * (1 - t * 0.6);
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 6);
        grd.addColorStop(0, `hsla(${p.hue},90%,70%,${alpha})`);
        grd.addColorStop(1, `hsla(${p.hue},90%,60%,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("cursor-ready");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [reduced, isTouch]);

  if (reduced || isTouch) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 90, mixBlendMode: "screen" }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 h-8 w-8 rounded-full"
        style={{
          zIndex: 91,
          border: "1.5px solid rgba(212,175,55,0.9)",
          boxShadow:
            "0 0 20px rgba(212,175,55,0.55), inset 0 0 8px rgba(255,226,154,0.35)",
          transition: "transform 0.08s linear, opacity 0.2s ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
