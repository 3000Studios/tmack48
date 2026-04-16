import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/data/siteConfig";
import { YoutubeIcon } from "./Icon";
import { trackCta } from "@/lib/analytics";

export default function StickyCta() {
  const [show, setShow] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loc.pathname === "/support" || loc.pathname === "/contact") return null;

  return (
    <div
      className={`md:hidden fixed inset-x-4 bottom-4 z-[54] transition-all duration-500
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}
    >
      <a
        href={siteConfig.channel.subscribeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCta("sticky_subscribe_mobile")}
        className="btn-gold w-full justify-center text-sm shadow-gold-xl"
      >
        <YoutubeIcon className="h-4 w-4" />
        Subscribe to TMACK48 on YouTube
      </a>
    </div>
  );
}
