import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// FooterNuts — a physics pile of golden nuts along the bottom of the footer.
// matter-js bodies (circles read fine under the round-ish nut sprite) are
// drawn with a hand-rolled canvas renderer (NOT matter's Render) using
// /footer-nut.svg. Lazy-loaded by Footer.tsx so matter-js stays out of the
// eager bundle. The rAF loop follows the house pattern from
// AmbientParticles: IntersectionObserver + document.hidden pause it, DPR
// is capped at 1.5, and everything is torn down on unmount.

const SPRITE_URL = "/footer-nut.svg";
const WALL = 80; // static wall thickness (px)
const FLOOR_INSET = 2; // floor top sits this far above the strip bottom edge

type OrientationEventCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function orientationNeedsPermission(): boolean {
  if (typeof window === "undefined") return false;
  const ctor = window.DeviceOrientationEvent as OrientationEventCtor | undefined;
  return !!ctor && typeof ctor.requestPermission === "function";
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function FooterNuts() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  // iOS 13+: DeviceOrientationEvent.requestPermission() needs a user
  // gesture. The pill renders only on touch devices exposing that API.
  const [showTiltPill, setShowTiltPill] = useState(
    () => orientationNeedsPermission() && isTouchDevice()
  );
  const [orientationReady, setOrientationReady] = useState(
    () => !orientationNeedsPermission()
  );

  const onTiltPillClick = async () => {
    try {
      const ctor = window.DeviceOrientationEvent as OrientationEventCtor;
      const result = await ctor.requestPermission?.();
      if (result === "granted") {
        setOrientationReady(true);
        setShowTiltPill(false);
      }
      // On denial: leave physics on pointer/default gravity, keep the pill
      // out of the way by hiding it (the user declined; don't nag).
      if (result === "denied") setShowTiltPill(false);
    } catch {
      setShowTiltPill(false);
    }
  };

  useEffect(() => {
    const wrapOrNull = wrapRef.current;
    const canvasOrNull = canvasRef.current;
    if (!wrapOrNull || !canvasOrNull) return;
    const wrap: HTMLDivElement = wrapOrNull;
    const canvas: HTMLCanvasElement = canvasOrNull;
    const rawCtx = canvas.getContext("2d");
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let disposed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = wrap.clientWidth;
    let height = wrap.clientHeight;

    const engine = Matter.Engine.create();
    const world = engine.world;
    engine.gravity.x = 0;
    engine.gravity.y = 1;

    let nuts: Matter.Body[] = [];
    let statics: Matter.Body[] = [];

    // Sprite: draw a gold-circle fallback until it loads.
    const img = new Image();
    let imgReady = false;
    img.onload = () => {
      imgReady = true;
      if (reduced) drawFrame();
    };
    img.src = SPRITE_URL;

    const floorTop = () => height - FLOOR_INSET;
    const nutCount = () => (width < 640 ? 9 : 14);
    const baseRadius = () => (width < 640 ? 21 : 25);

    function sizeCanvas() {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    }

    function clearWorld() {
      for (const b of [...nuts, ...statics]) Matter.World.remove(world, b);
      nuts = [];
      statics = [];
    }

    function buildWalls() {
      const opts: Matter.IChamferableBodyDefinition = { isStatic: true, friction: 0.8 };
      const floor = Matter.Bodies.rectangle(
        width / 2,
        floorTop() + WALL / 2,
        width + WALL * 2,
        WALL,
        opts
      );
      const left = Matter.Bodies.rectangle(-WALL / 2 + 1, height / 2, WALL, height * 4, opts);
      const right = Matter.Bodies.rectangle(
        width + WALL / 2 - 1,
        height / 2,
        WALL,
        height * 4,
        opts
      );
      statics = [floor, left, right];
      Matter.World.add(world, statics);
    }

    function makeNut(x: number, y: number): Matter.Body {
      const r = baseRadius() * (0.88 + Math.random() * 0.3);
      return Matter.Bodies.circle(x, y, r, {
        restitution: 0.25,
        friction: 0.6,
        frictionAir: 0.02,
        angle: Math.random() * Math.PI * 2,
      });
    }

    function spawnSettled() {
      // Reduced-motion / resize path: drop nuts just above the floor in a
      // loose double row and step the engine synchronously until they rest.
      const n = nutCount();
      for (let i = 0; i < n; i++) {
        const row = i % 2;
        const col = Math.floor(i / 2);
        const cols = Math.ceil(n / 2);
        const x = width * (0.1 + (0.8 * (cols <= 1 ? 0.5 : col / (cols - 1)))) + (row ? 14 : -6);
        const r = baseRadius();
        const y = floorTop() - r - row * (r * 1.55) - 4;
        const nut = makeNut(clamp(x, r + 4, width - r - 4), y);
        nuts.push(nut);
        Matter.World.add(world, nut);
      }
      for (let s = 0; s < 150; s++) Matter.Engine.update(engine, 1000 / 60);
    }

    function spawnDropQueue(): { pending: number; next: () => void } {
      let spawned = 0;
      const total = nutCount();
      return {
        get pending() {
          return total - spawned;
        },
        next() {
          if (spawned >= total) return;
          const i = spawned++;
          const spread = (i * 0.61803) % 1; // golden-ratio spread across the strip
          const x = width * (0.08 + 0.84 * spread) + (Math.random() - 0.5) * 16;
          const y = -30 - i * 6;
          const nut = makeNut(clamp(x, 30, width - 30), y);
          nuts.push(nut);
          Matter.World.add(world, nut);
        },
      };
    }

    function rebuild(settled: boolean) {
      clearWorld();
      sizeCanvas();
      buildWalls();
      if (settled) {
        spawnSettled();
      }
    }

    function drawFrame() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const ft = floorTop();
      for (const nut of nuts) {
        const r = nut.circleRadius ?? baseRadius();
        const { x, y } = nut.position;
        // Soft ellipse shadow on the floor, shrinking/fading with height.
        const hAbove = Math.max(0, ft - (y + r));
        const sScale = clamp(1 - hAbove / 320, 0.3, 1);
        ctx.save();
        ctx.fillStyle = `rgba(0,0,0,${0.34 * sScale})`;
        ctx.beginPath();
        ctx.ellipse(x, ft + 3, r * 0.95 * sScale, r * 0.3 * sScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // The nut itself, rotated to the body angle. Drawn slightly larger
        // than the physics circle so the pile reads dense and plush.
        const size = r * 2.35;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(nut.angle);
        if (imgReady) {
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
          const g = ctx.createRadialGradient(
            -size * 0.14,
            -size * 0.16,
            size * 0.05,
            0,
            0,
            size * 0.55
          );
          g.addColorStop(0, "#ffe29a");
          g.addColorStop(0.55, "#d4af37");
          g.addColorStop(1, "#8d7220");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    sizeCanvas();
    buildWalls();

    if (reduced) {
      // Static settled pile: precompute, draw once, no loop, no tilt.
      spawnSettled();
      drawFrame();
      const onResize = () => {
        if (Math.abs(wrap.clientWidth - width) > 40 || wrap.clientHeight !== height) {
          rebuild(true);
          drawFrame();
        }
      };
      window.addEventListener("resize", onResize);
      return () => {
        disposed = true;
        window.removeEventListener("resize", onResize);
        img.onload = null;
        Matter.World.clear(world, false);
        Matter.Engine.clear(engine);
      };
    }

    // ---- Animated path ----
    const queue = spawnDropQueue();
    let spawnClock = 0;

    // Gravity targets, eased toward every frame for buttery tilt.
    let targetGX = 0;
    let targetGY = 1;

    const footerEl = wrap.closest("footer");
    const onPointerMove = (e: PointerEvent) => {
      if (!footerEl) return;
      const rect = footerEl.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      targetGX = ratio * 2 - 1;
      targetGY = 1;
    };
    const onPointerLeave = () => {
      targetGX = 0;
      targetGY = 1;
    };
    footerEl?.addEventListener("pointermove", onPointerMove);
    footerEl?.addEventListener("pointerleave", onPointerLeave);

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null && e.beta == null) return;
      if (e.gamma != null) targetGX = clamp(e.gamma / 45, -1, 1);
      if (e.beta != null) targetGY = clamp(e.beta / 45, 0.4, 1.6);
    };
    if (orientationReady) {
      window.addEventListener("deviceorientation", onOrientation);
    }

    // Pause offscreen (IO) + when the tab is hidden — house pattern.
    let visible = false;
    let running = false;
    let raf = 0;
    let last = 0;

    const loop = (t: number) => {
      if (disposed || !visible || document.hidden) {
        running = false;
        return;
      }
      const delta = last ? Math.min(t - last, 33) : 1000 / 60;
      last = t;
      // Staggered spawn: one nut every ~90ms until the pile is complete.
      spawnClock += delta;
      while (queue.pending > 0 && spawnClock >= 90) {
        spawnClock -= 90;
        queue.next();
      }
      if (queue.pending === 0) spawnClock = 0;
      // Ease gravity toward the tilt target.
      engine.gravity.x += (targetGX - engine.gravity.x) * 0.06;
      engine.gravity.y += (targetGY - engine.gravity.y) * 0.06;
      Matter.Engine.update(engine, delta);
      // Safety clamp: no nut ever escapes the strip.
      for (const nut of nuts) {
        const r = nut.circleRadius ?? baseRadius();
        if (nut.position.y > height + 60 || nut.position.x < -60 || nut.position.x > width + 60) {
          Matter.Body.setPosition(nut, {
            x: clamp(nut.position.x, r + 2, width - r - 2),
            y: floorTop() - r - 2,
          });
          Matter.Body.setVelocity(nut, { x: 0, y: 0 });
        }
      }
      drawFrame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || disposed) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      if (!document.hidden && visible) start();
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((en) => en.isIntersecting);
        if (visible) start();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(wrap);
    document.addEventListener("visibilitychange", onVisibility);

    // Resize: rebuild on a real width change so walls/pile stay correct.
    let lastWidth = width;
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      if (Math.abs(w - lastWidth) > 40) {
        lastWidth = w;
        clearWorld();
        sizeCanvas();
        buildWalls();
        spawnSettled(); // settle fast rather than re-dropping on resize
        drawFrame();
      }
    });
    ro.observe(wrap);

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      footerEl?.removeEventListener("pointermove", onPointerMove);
      footerEl?.removeEventListener("pointerleave", onPointerLeave);
      if (orientationReady) window.removeEventListener("deviceorientation", onOrientation);
      img.onload = null;
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [reduced, orientationReady]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[72px] sm:h-[92px]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
      {showTiltPill && (
        <button
          type="button"
          onClick={onTiltPillClick}
          className="pointer-events-auto absolute right-3 top-1.5 z-10 rounded-full border border-gold-400/50 bg-ink-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-200 backdrop-blur transition-colors hover:bg-ink-900"
        >
          Tilt
        </button>
      )}
    </div>
  );
}
