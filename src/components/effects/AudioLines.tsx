import { useEffect, useRef, useState } from "react";

/**
 * Header audio lines — replaces the old header acorns (Boss order
 * 2026-11-07). Three sleek curvy gold lines sweep across the very top of
 * the header with a sheen gradient. They are always gently animated
 * (flowing at idle), they swell with pointer/touch energy like the page
 * water, and when the visitor taps the little "sound" toggle they listen
 * through the microphone and dance to the actual sound in the room.
 */
export default function AudioLines() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const energyRef = useRef(0.14);
  const micRef = useRef<{
    stream: MediaStream;
    ctx: AudioContext;
    analyser: AnalyserNode;
    data: Uint8Array;
  } | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [micDenied, setMicDenied] = useState(false);

  // Pointer / touch energy — moving around the page makes the lines swell.
  useEffect(() => {
    const bump = () => {
      energyRef.current = Math.min(1, energyRef.current + 0.07);
    };
    window.addEventListener("pointermove", bump, { passive: true });
    window.addEventListener("touchmove", bump, { passive: true });
    return () => {
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("touchmove", bump);
    };
  }, []);

  const stopMic = () => {
    const mic = micRef.current;
    if (mic) {
      mic.stream.getTracks().forEach((t) => t.stop());
      void mic.ctx.close().catch(() => undefined);
      micRef.current = null;
    }
    setMicOn(false);
  };

  const toggleMic = async () => {
    if (micOn) {
      stopMic();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      micRef.current = { stream, ctx, analyser, data: new Uint8Array(analyser.fftSize) };
      setMicDenied(false);
      setMicOn(true);
    } catch {
      setMicDenied(true);
      setMicOn(false);
    }
  };

  useEffect(() => {
    return () => {
      const mic = micRef.current;
      if (mic) {
        mic.stream.getTracks().forEach((t) => t.stop());
        void mic.ctx.close().catch(() => undefined);
        micRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 34;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let headerVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        headerVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    let raf = 0;
    let running = true;
    const draw = (t: number) => {
      if (!running) return;
      raf = window.requestAnimationFrame(draw);
      // PERF (2026-11-08): the header slides away on scroll-down — while
      // it is off-screen the lines do no canvas work at all.
      if (document.hidden || !headerVisible) return;

      // Target energy: live mic level, or idle breathing.
      let target = 0.13 + 0.05 * (0.5 + 0.5 * Math.sin(t / 2600));
      const mic = micRef.current;
      if (mic) {
        mic.analyser.getByteTimeDomainData(mic.data as Uint8Array<ArrayBuffer>);
        let sum = 0;
        for (let i = 0; i < mic.data.length; i += 2) {
          const d = (mic.data[i] - 128) / 128;
          sum += d * d;
        }
        const rms = Math.sqrt(sum / (mic.data.length / 2));
        target = Math.min(1, 0.1 + rms * 3.4);
      }
      energyRef.current += (target - energyRef.current) * 0.06;
      const energy = energyRef.current;
      // Pointer energy decays back toward the live target.
      if (!mic && energy > target) energyRef.current = Math.max(target, energy - 0.006);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const lines = [
        { baseY: 8, amp: 3.2, len: 0.011, speed: 0.0011, width: 1.7, alpha: 0.95 },
        { baseY: 17, amp: 4.4, len: 0.008, speed: -0.0008, width: 1.35, alpha: 0.7 },
        { baseY: 26, amp: 2.6, len: 0.014, speed: 0.0015, width: 1.1, alpha: 0.5 },
      ];
      lines.forEach((line, k) => {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, "rgba(212,175,55,0)");
        grad.addColorStop(0.18, `rgba(212,175,55,${line.alpha})`);
        grad.addColorStop(0.5, `rgba(255,233,168,${line.alpha})`);
        grad.addColorStop(0.82, `rgba(212,175,55,${line.alpha})`);
        grad.addColorStop(1, "rgba(212,175,55,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.width;
        ctx.shadowColor = "rgba(212,175,55,0.55)";
        ctx.shadowBlur = k === 0 ? 6 : 3;
        ctx.beginPath();
        const ampNow = line.amp * (0.35 + energy * 2.1);
        for (let x = 0; x <= w; x += 3) {
          const y =
            line.baseY +
            Math.sin(x * line.len + t * line.speed + k * 1.7) * ampNow +
            Math.sin(x * line.len * 2.7 - t * line.speed * 1.6 + k) * ampNow * 0.32;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
    };
    raf = window.requestAnimationFrame(draw);
    if (reduced) {
      // Single gentle frame for reduced-motion visitors.
      window.setTimeout(() => {
        running = false;
        window.cancelAnimationFrame(raf);
      }, 120);
    }
    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[34px]" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
      <button
        type="button"
        onClick={toggleMic}
        aria-pressed={micOn}
        title={
          micDenied
            ? "Microphone blocked — the lines can't hear the room"
            : micOn
              ? "Stop listening — lines go back to idle flow"
              : "Let the lines hear the room and dance to the sound"
        }
        className={`pointer-events-auto absolute right-2 top-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm transition ${
          micOn
            ? "border-gold-300/80 bg-gold-300/20 text-gold-100"
            : "border-white/15 bg-black/30 text-platinum/55 hover:border-gold-300/50 hover:text-gold-200"
        }`}
      >
        {micOn ? "♪ live" : micDenied ? "♪ muted" : "♪ sound"}
      </button>
    </div>
  );
}
