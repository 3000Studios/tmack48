import { Suspense, useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  BACKDROP_PRESETS,
  type PageBackdropVariant,
} from "@/lib/pageBackdropVariant";

function ParallaxRig({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const gyro = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma != null && e.beta != null) {
        gyro.current.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
        gyro.current.y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45));
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, true);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient, true);
    };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetY = mouse.current.x * 0.28 + gyro.current.x * 0.18;
    const targetX = -(mouse.current.y * 0.18 + gyro.current.y * 0.12);
    group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(1, delta * 4);
    group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(1, delta * 4);
  });

  return <group ref={group}>{children}</group>;
}

function TmackMark({
  accent,
  rim,
  chill,
}: {
  accent: string;
  rim: string;
  chill: string;
}) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh | null>(null);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
    }
    if (core.current) {
      core.current.rotation.z -= delta * 0.35;
    }
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <torusKnotGeometry args={[1.1, 0.32, 220, 32, 2, 3]} />
        <meshStandardMaterial
          color={accent}
          metalness={1}
          roughness={0.18}
          emissive="#1a1205"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <MeshTransmissionMaterial
          thickness={0.4}
          roughness={0.05}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.12}
          color={chill}
        />
      </mesh>

      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2 + i * 0.4, i * 0.8, i * 0.6]}
          position={[0, 0, 0]}
        >
          <torusGeometry args={[1.7 + i * 0.25, 0.012, 16, 160]} />
          <meshStandardMaterial
            color={i === 1 ? rim : accent}
            metalness={1}
            roughness={0.15}
            emissive={i === 1 ? "#444" : "#2a2008"}
            emissiveIntensity={0.28}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ variant }: { variant: PageBackdropVariant }) {
  const preset = BACKDROP_PRESETS[variant];

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={[preset.fogFar, 6, 18]} />
      <ambientLight intensity={0.14} />
      <directionalLight position={[4, 5, 3]} intensity={2.2} color={preset.accent} />
      <directionalLight position={[-4, 2, -2]} intensity={1.05} color={preset.chill} />
      <pointLight position={[0, 0, 3]} intensity={1.45} color={preset.rim} />
      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.05}>
          <ParallaxRig>
            <TmackMark accent={preset.accent} rim={preset.rim} chill={preset.chill} />
          </ParallaxRig>
        </Float>
        <Sparkles count={72} scale={[10, 6, 10]} size={2} speed={0.38} color={preset.rim} opacity={0.85} />
        <Sparkles count={36} scale={[10, 6, 10]} size={1.35} speed={0.28} color={preset.chill} opacity={0.65} />
        <Environment preset="studio" />
      </Suspense>
    </>
  );
}

function LowPowerFallback({ variant }: { variant: PageBackdropVariant }) {
  const preset = BACKDROP_PRESETS[variant];
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(ellipse at center, ${preset.accent}33 0%, transparent 62%)`,
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-grad blur-3xl opacity-35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="display-title gold-text text-6xl sm:text-8xl md:text-9xl opacity-35 select-none">
          TMACK48
        </span>
      </div>
    </div>
  );
}

interface Props {
  className?: string;
  variant?: PageBackdropVariant;
}

export default function Hero3D({ className = "", variant = "gold" }: Props) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    try {
      const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
      const cores = navigator.hardwareConcurrency || 4;
      if ((deviceMemory && deviceMemory < 3) || cores < 4) {
        setLowPower(true);
      }
    } catch {
      /* no-op */
    }
  }, []);

  const dpr = useMemo<[number, number]>(() => [1, Math.min(window.devicePixelRatio || 1, 2)], []);

  if (reduced || lowPower || failed) return <LowPowerFallback variant={variant} />;

  return (
    <div className={`pointer-events-none absolute inset-0 touch-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setFailed(true));
        }}
      >
        <Scene variant={variant} />
      </Canvas>
    </div>
  );
}
