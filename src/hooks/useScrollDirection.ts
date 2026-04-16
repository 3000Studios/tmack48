import { useEffect, useState } from "react";

export function useScrollDirection(threshold = 8) {
  const [dir, setDir] = useState<"up" | "down">("up");
  const [y, setY] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const sy = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (Math.abs(sy - lastY) > threshold) {
            setDir(sy > lastY ? "down" : "up");
            lastY = sy;
          }
          setY(sy);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { dir, y };
}
