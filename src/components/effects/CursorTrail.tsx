import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useMediaQuery";

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface Props {
  enabled?: boolean;
}

export default function CursorTrail({ enabled = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const caneRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    if (reduced || isTouch || !enabled) return;
    const canvas = canvasRef.current;
    const cane = caneRef.current;
    if (!canvas || !cane) return;
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

    const trail: TrailPoint[] = [];
    let mx = w / 2;
    let my = h / 2;
    let cx = mx;
    let cy = my;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      trail.push({ x: mx, y: my, life: 0 });
      if (trail.length > 40) trail.shift();
      const t = e.target as HTMLElement | null;
      if (t) {
        const isInteractive =
          t.closest("a, button, [role=button], input, textarea, select, [data-cursor='link']") !== null;
        hovering = isInteractive;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cane.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-35%, -82%) rotate(${hovering ? -8 : -15}deg) scale(${hovering ? 1.08 : 1})`;
      cane.style.opacity = hovering ? "1" : "0.95";

      ctx.clearRect(0, 0, w, h);
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life += 1;
        if (trail[i].life > 44) trail.splice(i, 1);
      }

      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1];
          const b = trail[i];
          const alpha = Math.max(0.08, 1 - b.life / 46);
          ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
          ctx.lineWidth = Math.max(1, 4 - b.life / 14);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("cursor-ready");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [reduced, isTouch, enabled]);

  if (reduced || isTouch || !enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 90, mixBlendMode: "screen" }}
        aria-hidden="true"
      />
      <div
        ref={caneRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0"
        style={{
          zIndex: 91,
          fontSize: "2rem",
          filter: "drop-shadow(0 0 8px rgba(212,175,55,0.55))",
          transition: "transform 0.08s linear, opacity 0.2s ease",
          willChange: "transform",
        }}
      >
        🦯
      </div>
    </>
  );
}
