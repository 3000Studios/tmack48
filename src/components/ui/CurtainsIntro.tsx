import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildEmbedUrl, YOUTUBE_EMBED_MESSAGE_ORIGIN } from "@/lib/youtube";

interface CurtainsIntroProps {
  enabled: boolean;
}

/** Curtains intro — https://youtu.be/G6Ij9iPkQQo */
const CURTAINS_INTRO_VIDEO_ID = "G6Ij9iPkQQo";

const INTRO_STORAGE_KEY = "tmack48-curtains-intro-seen";
/** Safety cap if iframe end events do not fire (full-length ceiling). */
const INTRO_FALLBACK_MS = 120000;

export default function CurtainsIntro({ enabled }: CurtainsIntroProps) {
  const [isMounted, setIsMounted] = useState(enabled);
  const [isVisible, setIsVisible] = useState(enabled);
  const [hasUserStarted, setHasUserStarted] = useState(false);
  const completedRef = useRef(false);

  const shouldPlay = useMemo(() => {
    if (!enabled) return false;
    return !window.sessionStorage.getItem(INTRO_STORAGE_KEY);
  }, [enabled]);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    setIsVisible(false);
    window.setTimeout(() => setIsMounted(false), 420);
  }, []);

  const handleStart = useCallback(() => {
    setHasUserStarted(true);
  }, []);

  useEffect(() => {
    if (!shouldPlay) {
      setIsMounted(false);
      setIsVisible(false);
      return;
    }

    if (!hasUserStarted) return;

    completedRef.current = false;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_EMBED_MESSAGE_ORIGIN) return;
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (
        data &&
        typeof data === "object" &&
        "event" in data &&
        (data as { event?: string }).event === "onStateChange" &&
        "info" in data &&
        (data as { info?: number }).info === 0
      ) {
        cleanup();
        handleComplete();
      }
    };

    let timeoutId = 0;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (timeoutId) window.clearTimeout(timeoutId);
    };

    window.addEventListener("message", onMessage);
    timeoutId = window.setTimeout(() => {
      cleanup();
      handleComplete();
    }, INTRO_FALLBACK_MS);

    return cleanup;
  }, [shouldPlay, handleComplete, hasUserStarted]);

  if (!isMounted || !shouldPlay) return null;

  const embedSrc = hasUserStarted
    ? buildEmbedUrl(CURTAINS_INTRO_VIDEO_ID, {
        autoplay: true,
        mute: false,
        controls: false,
        enableJsApi: true,
      })
    : "";

  return (
    <div
      className={`fixed inset-0 z-[120] bg-black transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Curtains intro"
    >
      <div className="relative h-full w-full overflow-hidden">
        {hasUserStarted ? (
          <iframe
            title="Curtains intro"
            src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-platinum/70">TMACK48 Intro</p>
            <button type="button" onClick={handleStart} className="btn-gold text-sm sm:text-base">
              Play intro with sound
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
