import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/footer/Footer";
import CursorTrail from "@/components/effects/CursorTrail";
import BackToTop from "@/components/ui/BackToTop";
import StickyCta from "@/components/ui/StickyCta";
import MrBigNuttsBot from "@/components/home/MrBigNuttsBot";
import PageBackdrop from "@/components/layout/PageBackdrop";
import { trackPageView } from "@/lib/analytics";

export default function Layout() {
  const loc = useLocation();
  const isHome = loc.pathname === "/";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    trackPageView(loc.pathname);
  }, [loc.pathname]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <PageBackdrop />
      <CursorTrail enabled={isHome} />
      <Navbar />
      <main id="main" className="relative z-10 flex-1 overflow-x-clip pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <StickyCta />
      <MrBigNuttsBot />
    </div>
  );
}
