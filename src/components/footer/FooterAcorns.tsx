import { useEffect, useRef } from "react";

type Acorn = { x: number; y: number; vx: number; vy: number; r: number };

export default function FooterAcorns() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const acorns = useRef<Acorn[]>([]);
  const tilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const seed = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      acorns.current = Array.from({ length: 8 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.45,
        vx: (Math.random() - 0.5) * 1.8,
        vy: Math.random() * 1.2,
        r: 14 + Math.random() * 6,
      }));
    };
    seed();

    const onResize = () => seed();
    window.addEventListener("resize", onResize);

    const onOrientation = (e: DeviceOrientationEvent) => {
      tilt.current.x = (e.gamma ?? 0) / 35;
      tilt.current.y = (e.beta ?? 0) / 50;
    };
    window.addEventListener("deviceorientation", onOrientation);

    const onShake = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      const mag = Math.abs(acc?.x ?? 0) + Math.abs(acc?.y ?? 0) + Math.abs(acc?.z ?? 0);
      if (mag > 26) {
        acorns.current.forEach((a) => {
          a.vx += (Math.random() - 0.5) * 3.5;
          a.vy -= Math.random() * 2.5;
        });
      }
    };
    window.addEventListener("devicemotion", onShake);

    const kick = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      acorns.current.forEach((a) => {
        const dx = a.x - x;
        const dy = a.y - y;
        const d = Math.max(14, Math.hypot(dx, dy));
        const force = 8 / d;
        a.vx += dx * force;
        a.vy += dy * force;
      });
    };

    const onPointer = (e: PointerEvent) => kick(e.clientX, e.clientY);
    wrap.addEventListener("pointerdown", onPointer);

    let raf = 0;
    const loop = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const nodes = wrap.querySelectorAll<HTMLSpanElement>("[data-acorn]");
      acorns.current.forEach((a, i) => {
        a.vx += tilt.current.x * 0.08;
        a.vy += 0.08 + tilt.current.y * 0.03;
        a.vx *= 0.98;
        a.vy *= 0.985;
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < a.r) {
          a.x = a.r;
          a.vx *= -0.65;
        }
        if (a.x > w - a.r) {
          a.x = w - a.r;
          a.vx *= -0.65;
        }
        if (a.y > h - a.r) {
          a.y = h - a.r;
          a.vy *= -0.58;
        }
        if (a.y < a.r) {
          a.y = a.r;
          a.vy *= -0.58;
        }
        const n = nodes[i];
        if (n) n.style.transform = `translate(${a.x - a.r}px, ${a.y - a.r}px) rotate(${a.vx * 5}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onShake);
      wrap.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-auto absolute inset-x-0 bottom-0 h-14 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} data-acorn className="absolute text-xl select-none drop-shadow-[0_0_6px_rgba(212,175,55,0.55)]">
          🌰
        </span>
      ))}
    </div>
  );
}

