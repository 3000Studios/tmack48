import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useMediaQuery";

interface Props {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}

export default function TiltCard({ children, className = "", max = 10, glare = true }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || isTouch || !el.current) return;
    const rect = el.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    el.current.style.setProperty("--rx", `${-py * max}deg`);
    el.current.style.setProperty("--ry", `${px * max}deg`);
    el.current.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.current.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const onLeave = () => {
    if (!el.current) return;
    el.current.style.setProperty("--rx", `0deg`);
    el.current.style.setProperty("--ry", `0deg`);
  };

  return (
    <div
      ref={el}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transform: "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))",
        transition: "transform .25s cubic-bezier(.22,1,.36,1)",
        transformStyle: "preserve-3d",
        position: "relative",
      }}
    >
      {children}
      {glare && !reduced && !isTouch && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
          style={{
            background:
              "radial-gradient(500px circle at var(--gx,50%) var(--gy,50%), rgba(255,226,154,0.22), transparent 45%)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </div>
  );
}
