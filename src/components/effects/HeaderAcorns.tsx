import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
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

export default function HeaderAcorns() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

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

  const acornColor = useMemo(() => new THREE.Color("#d4af37"), []);
  const capColor = useMemo(() => new THREE.Color("#8d7220"), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;
    if (!needsMotionPermission()) setMotionReady(true);
  }, []);

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
      if (d > 9.5) triggerDrop();
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

  // Three.js scene for true 3D acorns driven by our physics state.
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
    camera.position.z = 10;

    const lightA = new THREE.DirectionalLight(0xffffff, 1.1);
    lightA.position.set(0.4, -0.2, 0.9);
    scene.add(lightA);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const bodyGeo = new THREE.SphereGeometry(1, 20, 16);
    const capGeo = new THREE.ConeGeometry(0.95, 1.1, 18, 1);
    capGeo.translate(0, 1.05, 0);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: acornColor,
      metalness: 0.7,
      roughness: 0.22,
      emissive: new THREE.Color("#5b3a12"),
      emissiveIntensity: 0.12,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: capColor,
      metalness: 0.55,
      roughness: 0.35,
    });

    const body = new THREE.InstancedMesh(bodyGeo, bodyMat, 64);
    const cap = new THREE.InstancedMesh(capGeo, capMat, 64);
    body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    cap.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(body);
    scene.add(cap);

    const tmp = new THREE.Object3D();

    const resize = () => {
      const r = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      renderer.setSize(w, h, false);
      camera.left = 0;
      camera.right = w;
      camera.top = 0;
      camera.bottom = h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let running = true;
    const draw = () => {
      if (!running) return;
      const r = host.getBoundingClientRect();
      const w = r.width || 1;
      const h = r.height || 1;

      // Build instance list: rollers in host-space, fallers in viewport-space -> convert to host-space
      const fallers = fallersRef.current;
      const rollers = rollersRef.current;

      const hostLeft = r.left;
      const hostTop = r.top;

      let n = 0;
      const pushAcorn = (x: number, y: number, radius: number, spin: number, z: number) => {
        tmp.position.set(x, y, z);
        tmp.scale.setScalar(radius / 7.5);
        tmp.rotation.set(0.25, 0.3, spin);
        tmp.updateMatrix();
        body.setMatrixAt(n, tmp.matrix);

        tmp.position.set(x, y, z + 0.15);
        tmp.scale.setScalar(radius / 7.5);
        tmp.rotation.set(0.2, 0.45, spin * 0.9);
        tmp.updateMatrix();
        cap.setMatrixAt(n, tmp.matrix);
        n += 1;
      };

      for (const a of rollers) {
        const x = (a.x / 100) * w;
        const y = (a.y / 100) * h;
        const spin = (a.vx + a.vy) * 0.12;
        pushAcorn(x, y, a.r, spin, 0.5);
      }

      for (const a of fallers) {
        const x = a.x - hostLeft;
        const y = a.y - hostTop;
        if (x < -60 || x > w + 60 || y < -60 || y > h + window.innerHeight + 200) continue;
        const spin = (a.vx + a.vy) * 0.08;
        pushAcorn(x, y, a.r, spin, 0.9);
      }

      body.count = n;
      cap.count = n;
      body.instanceMatrix.needsUpdate = true;
      cap.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    return () => {
      running = false;
      ro.disconnect();
      renderer.dispose();
      bodyGeo.dispose();
      capGeo.dispose();
      bodyMat.dispose();
      capMat.dispose();
    };
  }, [acornColor, capColor]);

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

      // Rollers are stored as percent positions within host.
      const w = hostRect.width || 1;
      const h = hostRect.height || 1;
      const padding = 14;

      rollersRef.current = rollersRef.current.map((p) => {
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

        const r = p.r;
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

        return { ...p, x: (x / w) * 100, y: (y / h) * 100, vx, vy };
      });

      // Fallers in viewport px.
      const gravity = 0.75 * (dt / 16);
      const wind = ax * 0.22 * (dt / 16);
      const keep: Faller[] = [];
      for (const a of fallersRef.current) {
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
        if (y > window.innerHeight + 160) continue;
        keep.push({ ...a, x, y, vx, vy });
      }
      fallersRef.current = keep;

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
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

