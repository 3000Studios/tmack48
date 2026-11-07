import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Liquid Water wallpaper — canvas waves + sunlit rays.
 * DESIGN LAW: used ONLY inside the site header and footer.
 * The page body stays clean — never mount this elsewhere.
 * Lightweight: one canvas, DPR-capped, pauses off-screen / reduced-motion.
 */
export default function LiquidWater({ variant = "header" }: { variant?: "header" | "footer" }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      // Deep water base
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, "rgba(10,32,44,0.92)");
      base.addColorStop(0.55, "rgba(7,22,36,0.94)");
      base.addColorStop(1, "rgba(4,12,22,0.97)");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // Sunlit rays from the top
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const rayCx = w * (variant === "header" ? 0.72 : 0.28);
      for (let i = 0; i < 5; i++) {
        const sway = reduced ? 0 : Math.sin(t / 2600 + i * 1.7) * 18;
        const x = rayCx + (i - 2) * (w / 7) + sway;
        const grad = ctx.createLinearGradient(x, -10, x + 34, h);
        grad.addColorStop(0, "rgba(255,226,154,0.20)");
        grad.addColorStop(0.5, "rgba(127,219,255,0.07)");
        grad.addColorStop(1, "rgba(127,219,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x - 12, -10);
        ctx.lineTo(x + 26, -10);
        ctx.lineTo(x + 74, h + 10);
        ctx.lineTo(x - 30, h + 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Flowing wave layers
      const layers = [
        { amp: 7, len: 0.012, speed: 0.00055, y: 0.52, color: "rgba(72,169,197,0.20)" },
        { amp: 10, len: 0.009, speed: 0.00038, y: 0.68, color: "rgba(212,175,55,0.13)" },
        { amp: 6, len: 0.016, speed: 0.0008, y: 0.84, color: "rgba(185,242,255,0.16)" },
      ];
      for (const L of layers) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) {
          const phase = reduced ? 0 : t * L.speed;
          const y = h * L.y + Math.sin(x * L.len + phase * 6) * L.amp + Math.sin(x * L.len * 0.5 + phase * 3) * L.amp * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = L.color;
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, variant]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-liquid-water={variant}
      className="liquid-water pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
