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

  const handleTapDismiss = useCallback(
    (event: { preventDefault: () => void; stopPropagation: () => void }) => {
      event.preventDefault();
      event.stopPropagation();
      handleComplete();
    },
    [handleComplete]
  );

  useEffect(() => {
    if (!shouldPlay) {
      setIsMounted(false);
      setIsVisible(false);
      return;
    }

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
      if (!data || typeof data !== "object" || !("event" in data)) return;

      const payload = data as {
        event?: string;
        info?:
          | number
          | {
              playerState?: number;
              currentTime?: number;
              duration?: number;
            };
      };

      if (payload.event === "onStateChange") {
        const state =
          typeof payload.info === "number"
            ? payload.info
            : typeof payload.info === "object" && payload.info
            ? payload.info.playerState
            : undefined;
        if (state === 0) {
          cleanup();
          handleComplete();
        }
        return;
      }

      if (payload.event === "infoDelivery" && typeof payload.info === "object" && payload.info) {
        const { playerState, currentTime, duration } = payload.info;
        const endedFromState = playerState === 0;
        const endedFromTime =
          typeof currentTime === "number" &&
          typeof duration === "number" &&
          duration > 0 &&
          currentTime >= duration - 0.2;

        if (endedFromState || endedFromTime) {
          cleanup();
          handleComplete();
        }
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
  }, [shouldPlay, handleComplete]);

  if (!isMounted || !shouldPlay) return null;

  const embedSrc = buildEmbedUrl(CURTAINS_INTRO_VIDEO_ID, {
    autoplay: true,
    mute: true,
    controls: false,
    enableJsApi: true,
  });

  return (
    <div
      className={`fixed inset-0 z-[120] bg-black transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onPointerDown={handleTapDismiss}
      aria-hidden
    >
      <div className="relative h-full w-full overflow-hidden">
        <iframe
          title="Curtains intro"
          src={embedSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      </div>
    </div>
  );
}
