import { useEffect, useState } from "react";
import { CloseIcon, SparkleIcon } from "@/components/ui/Icon";
import { trackCta } from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tmack48-install-dismissed";

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !evt) return null;

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    trackCta("pwa_install_click");
    await evt.prompt();
    const choice = await evt.userChoice;
    trackCta(choice.outcome === "accepted" ? "pwa_install_accepted" : "pwa_install_dismissed");
    setVisible(false);
    setEvt(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Install TMACK48 app"
      className="fixed inset-x-3 bottom-3 z-[55] mx-auto max-w-md rounded-2xl border border-gold-300/30 bg-ink-950/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-platinum/60 hover:text-gold-200"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-4 pr-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-300 text-ink-950">
          <SparkleIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-platinum">Install the TMACK48 app</p>
          <p className="text-sm text-platinum/65">Full-screen, fast, and one tap from your home screen.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={install} className="btn-gold flex-1 justify-center !py-2.5 text-sm">
          Install
        </button>
        <button type="button" onClick={dismiss} className="btn-ghost !py-2.5 text-sm">
          Not now
        </button>
      </div>
    </div>
  );
}
