import { useEffect, useState } from "react";

export function useMediaQuery(query: string, initial = false): boolean {
  const [match, setMatch] = useState<boolean>(() => {
    if (typeof window === "undefined") return initial;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);
  return match;
}

export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsTouch = () => useMediaQuery("(pointer: coarse)");
