import { useEffect, useRef } from "react";

/** Live animated canvas wallpaper for the mobile nav drawer. */
export default function MobileMenuWallpaper() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.4,
      sp: 0.15 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
      gold: Math.random() > 0.45,
    }));

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Deep base
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#030303");
      bg.addColorStop(0.45, "#0a0804");
      bg.addColorStop(1, "#02060a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Vortex-ish conic wash
      const cx = w * 0.5 + Math.sin(t * 0.35) * 40;
      const cy = h * 0.42 + Math.cos(t * 0.28) * 30;
      const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.75);
      g.addColorStop(0, "rgba(212,175,55,0.22)");
      g.addColorStop(0.35, "rgba(127,219,255,0.08)");
      g.addColorStop(0.7, "rgba(212,175,55,0.04)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Rotating beams
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.25);
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        const beam = ctx.createLinearGradient(0, 0, 0, -Math.max(w, h));
        beam.addColorStop(0, "rgba(255,226,154,0.18)");
        beam.addColorStop(0.4, "rgba(212,175,55,0.05)");
        beam.addColorStop(1, "transparent");
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(18, 0);
        ctx.lineTo(90, -Math.max(w, h) * 0.9);
        ctx.lineTo(-90, -Math.max(w, h) * 0.9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Particles
      for (const p of particles) {
        const px = p.x * w + Math.sin(t * p.sp + p.ph) * 24;
        const py = ((p.y + t * p.sp * 0.04) % 1.1) * h;
        const a = 0.35 + 0.45 * Math.sin(t * 2 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = p.gold
          ? `rgba(212,175,55,${a})`
          : `rgba(185,242,255,${a * 0.85})`;
        ctx.shadowColor = p.gold ? "rgba(212,175,55,0.6)" : "rgba(127,219,255,0.5)";
        ctx.shadowBlur = 12;
        // diamond
        ctx.moveTo(px, py - p.r * 2);
        ctx.lineTo(px + p.r, py);
        ctx.lineTo(px, py + p.r * 2);
        ctx.lineTo(px - p.r, py);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Bottom vignette
      const vig = ctx.createLinearGradient(0, h * 0.5, 0, h);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
