import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FooterAcornObject() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0.6, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff1c2, 1.15);
    key.position.set(2.5, 3.2, 4.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7fdbff, 0.55);
    rim.position.set(-4, 1.2, -2.8);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#b57a2d"),
      metalness: 0.15,
      roughness: 0.35,
      clearcoat: 0.75,
      clearcoatRoughness: 0.18,
    });
    const capMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#6a4a1f"),
      metalness: 0.05,
      roughness: 0.75,
      clearcoat: 0.2,
      clearcoatRoughness: 0.65,
    });
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d4af37"),
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    });

    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), shellMat);
    shell.scale.set(0.92, 1.1, 0.92);
    shell.position.set(0, -0.2, 0);
    group.add(shell);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.48), capMat);
    cap.scale.set(0.98, 0.78, 0.98);
    cap.position.set(0, 0.55, 0);
    group.add(cap);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.35, 10), capMat);
    stem.position.set(0.22, 1.02, 0.1);
    stem.rotation.z = 0.45;
    group.add(stem);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.06, 12, 64), goldMat);
    ring.position.set(0, 0.2, 0);
    ring.rotation.x = Math.PI / 2.9;
    group.add(ring);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.55;
      group.rotation.x = Math.sin(t * 0.33) * 0.12 - 0.08;
      group.position.y = Math.sin(t * 0.5) * 0.08;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      try {
        host.removeChild(renderer.domElement);
      } catch {
        // ignore
      }
    };
  }, []);

  return <div ref={hostRef} className="absolute inset-0 pointer-events-none opacity-55" aria-hidden />;
}

