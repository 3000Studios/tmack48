import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useMediaQuery";

interface Diamond {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  spin: number;
  hue: number;
}

interface Props {
  enabled?: boolean;
}

/**
 * Default system cursor stays visible.
 * Smooth gold/diamond particle trails follow the pointer (desktop only).
 */
export default function CursorTrail({ enabled = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    if (reduced || isTouch || !enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.body.classList.add("cursor-trail-active");

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

    const diamonds: Diamond[] = [];
    let mx = w / 2;
    let my = h / 2;
    let lx = mx;
    let ly = my;
    let spawnAccum = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const drawDiamond = (
      x: number,
      y: number,
      size: number,
      rot: number,
      alpha: number,
      hue: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.62, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.62, 0);
      ctx.closePath();

      const g = ctx.createLinearGradient(-size, -size, size, size);
      if (hue < 0.45) {
        g.addColorStop(0, `rgba(255, 226, 154, ${alpha})`);
        g.addColorStop(0.5, `rgba(212, 175, 55, ${alpha * 0.95})`);
        g.addColorStop(1, `rgba(185, 242, 255, ${alpha * 0.75})`);
      } else {
        g.addColorStop(0, `rgba(185, 242, 255, ${alpha})`);
        g.addColorStop(0.55, `rgba(229, 228, 226, ${alpha * 0.9})`);
        g.addColorStop(1, `rgba(212, 175, 55, ${alpha * 0.7})`);
      }
      ctx.fillStyle = g;
      ctx.shadowColor = hue < 0.45 ? "rgba(212,175,55,0.55)" : "rgba(127,219,255,0.45)";
      ctx.shadowBlur = 10 * alpha;
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    const loop = () => {
      const dx = mx - lx;
      const dy = my - ly;
      const dist = Math.hypot(dx, dy);
      lx += dx * 0.28;
      ly += dy * 0.28;

      spawnAccum += dist;
      while (spawnAccum > 10 && diamonds.length < 72) {
        spawnAccum -= 10;
        diamonds.push({
          x: lx + (Math.random() - 0.5) * 6,
          y: ly + (Math.random() - 0.5) * 6,
          life: 0,
          maxLife: 28 + Math.random() * 22,
          size: 2.2 + Math.random() * 4.2,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.18,
          hue: Math.random(),
        });
      }

      ctx.clearRect(0, 0, w, h);

      // Soft connecting ribbon
      if (diamonds.length > 2) {
        ctx.beginPath();
        for (let i = 0; i < diamonds.length; i++) {
          const d = diamonds[i];
          if (i === 0) ctx.moveTo(d.x, d.y);
          else ctx.lineTo(d.x, d.y);
        }
        ctx.strokeStyle = "rgba(212, 175, 55, 0.12)";
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      for (let i = diamonds.length - 1; i >= 0; i--) {
        const d = diamonds[i];
        d.life += 1;
        d.rot += d.spin;
        d.y += 0.15;
        const t = d.life / d.maxLife;
        if (t >= 1) {
          diamonds.splice(i, 1);
          continue;
        }
        const alpha = Math.pow(1 - t, 1.35) * 0.92;
        const size = d.size * (1 - t * 0.35);
        drawDiamond(d.x, d.y, size, d.rot, alpha, d.hue);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("cursor-trail-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [reduced, isTouch, enabled]);

  if (reduced || isTouch || !enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 90, mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
