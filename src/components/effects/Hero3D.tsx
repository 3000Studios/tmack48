import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshTransmissionMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function TmackMark() {
  const group = useRef<Group | null>(null);
  const core = useRef<Mesh | null>(null);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
    if (core.current) {
      core.current.rotation.z -= delta * 0.4;
    }
  });

  // Gold torus knot + diamond core + floating rings — functions as the "TMACK48" 3D emblem.
  return (
    <group ref={group}>
      <mesh castShadow>
        <torusKnotGeometry args={[1.1, 0.32, 220, 32, 2, 3]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.18}
          emissive="#3b2a06"
          emissiveIntensity={0.3}
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
          color="#B9F2FF"
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
            color={i === 1 ? "#E5E4E2" : "#D4AF37"}
            metalness={1}
            roughness={0.15}
            emissive={i === 1 ? "#666" : "#3a2a05"}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#050505", 6, 18]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 3]} intensity={2.2} color="#FFE29A" />
      <directionalLight position={[-4, 2, -2]} intensity={1.1} color="#7FDBFF" />
      <pointLight position={[0, 0, 3]} intensity={1.6} color="#D4AF37" />
      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.2}>
          <TmackMark />
        </Float>
        <Sparkles count={80} scale={[10, 6, 10]} size={2} speed={0.4} color="#FFE29A" opacity={0.9} />
        <Sparkles count={40} scale={[10, 6, 10]} size={1.4} speed={0.3} color="#B9F2FF" opacity={0.7} />
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </>
  );
}

function LowPowerFallback() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18)_0%,rgba(5,5,5,0)_60%)]" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-grad blur-3xl opacity-40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="display-title gold-text text-6xl sm:text-8xl md:text-9xl opacity-40 select-none">
          TMACK48
        </span>
      </div>
    </div>
  );
}

interface Props {
  className?: string;
}

export default function Hero3D({ className = "" }: Props) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    // Heuristic: small / low-memory devices → skip heavy WebGL
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

  if (reduced || lowPower || failed) return <LowPowerFallback />;

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setFailed(true));
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
