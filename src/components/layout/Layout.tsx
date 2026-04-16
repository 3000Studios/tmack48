import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/footer/Footer";
import CursorTrail from "@/components/effects/CursorTrail";
import BackToTop from "@/components/ui/BackToTop";
import StickyCta from "@/components/ui/StickyCta";
import { trackPageView } from "@/lib/analytics";

export default function Layout() {
  const loc = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    trackPageView(loc.pathname);
  }, [loc.pathname]);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <CursorTrail />
      <Navbar />
      <main id="main" className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <StickyCta />
    </div>
  );
}
