import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Scroll-reveal wrapper. PERF (2026-10-24): this used to be built on
 * framer-motion, which pulled the ~133 KB motion chunk into the eager
 * bundle of every page that used a Reveal (21 files) and animated
 * `filter: blur(8px)` over whole sections while they entered — a
 * per-frame repaint of very large layers. It is now an
 * IntersectionObserver + CSS transition (classes in styles/index.css):
 * same fade/rise feel, compositor-only properties, no library.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("rv-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const Tag = as;
  if (reduced) {
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`rv ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
