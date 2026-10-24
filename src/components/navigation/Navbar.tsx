import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { navPrimaryPublic, siteConfig } from "@/data/siteConfig";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { YoutubeIcon } from "@/components/ui/Icon";
import { cn, isSupportedLink } from "@/lib/utils";
import { trackCta } from "@/lib/analytics";
// Decorative acorn ornaments (2D canvas) — lazy, zero WebGL.
const HeaderAcorns = lazy(() => import("@/components/effects/HeaderAcorns"));
import NavIdleLink, { IDLE_FX, type IdleFx } from "@/components/navigation/NavIdleLink";
import MobileMenuWallpaper from "@/components/navigation/MobileMenuWallpaper";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // PERF (2026-10-24): the mobile menu was framer-motion AnimatePresence,
  // which kept the ~133 KB motion chunk in the eager bundle of EVERY page
  // (Navbar lives in the Layout). It is now CSS (.mmenu-*) with a 180 ms
  // closing fade preserved through menuMounted/menuClosing state.
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuGen = useRef(0);
  const openMenu = () => {
    menuGen.current++;
    setMenuMounted(true);
    setMenuClosing(false);
    setOpen(true);
  };
  const closeMenu = () => {
    const g = ++menuGen.current;
    setOpen(false);
    setMenuClosing(true);
    window.setTimeout(() => {
      if (menuGen.current === g) {
        setMenuMounted(false);
        setMenuClosing(false);
      }
    }, 180);
  };
  const [idleMap, setIdleMap] = useState<Record<string, IdleFx>>({});
  const { y, dir } = useScrollDirection();
  const loc = useLocation();

  const items = useMemo(
    () =>
      navPrimaryPublic.filter(
        (n) => !(n.href === "/merch" && !isSupportedLink(siteConfig.support.merch))
      ),
    []
  );

  useEffect(() => {
    // Route change: close instantly (no exit fade while navigating).
    menuGen.current++;
    setOpen(false);
    setMenuMounted(false);
    setMenuClosing(false);
  }, [loc.pathname]);

  useEffect(() => {
    if (!menuMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuMounted]);

  useEffect(() => {
    document.body.dataset.mobileMenuOpen = menuMounted ? "true" : "false";
  }, [menuMounted]);

  useEffect(() => {
    return () => {
      delete document.body.dataset.mobileMenuOpen;
    };
  }, []);

  // Every 5s: pick a random link and random idle effect
  useEffect(() => {
    const tick = () => {
      if (!items.length) return;
      const link = items[Math.floor(Math.random() * items.length)];
      const fx = IDLE_FX[Math.floor(Math.random() * IDLE_FX.length)];
      setIdleMap(() => {
        const cleared: Record<string, IdleFx> = {};
        // Keep only the new one so only one link animates at a time
        cleared[link.href] = fx;
        // Occasionally fire a second simultaneous effect
        if (Math.random() > 0.55 && items.length > 1) {
          const other = items[Math.floor(Math.random() * items.length)];
          if (other.href !== link.href) {
            cleared[other.href] = IDLE_FX[Math.floor(Math.random() * IDLE_FX.length)];
          }
        }
        return cleared;
      });
      // Clear after animation window so idle resets
      window.setTimeout(() => {
        setIdleMap((prev) => {
          const next = { ...prev };
          delete next[link.href];
          return next;
        });
      }, 2200);
    };
    const id = window.setInterval(tick, 5000);
    // first fire soon after mount
    const first = window.setTimeout(tick, 1800);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [items]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 transition-[transform,background,backdrop-filter,border-color] duration-500 ease-out",
          "border-b header-3d",
          open || y > 40
            ? "bg-ink-950/85 backdrop-blur-xl border-white/5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]"
            : "bg-transparent border-transparent",
          !open && dir === "down" && y > 160 ? "-translate-y-full" : "translate-y-0"
        )}
        style={{ zIndex: 60 }}
      >
        <Suspense fallback={null}>
          <HeaderAcorns />
        </Suspense>
        <div className="container-lux flex h-16 md:h-20 items-center justify-between gap-3 md:gap-4">
          <Logo />

          {/* Desktop — same primary set as mobile */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-1 xl:gap-3 overflow-x-auto px-2"
          >
            {items.map((it, i) => (
              <NavIdleLink
                key={it.href}
                href={it.href}
                label={it.label}
                index={i}
                idleFx={idleMap[it.href] ?? null}
                variant="desktop"
              />
            ))}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "nav-link-desktop btn-gold !px-3 xl:!px-4 !py-2 text-[10px] xl:text-xs uppercase tracking-[0.18em] shrink-0 shadow-[0_8px_30px_-12px_rgba(212,175,55,0.55)]",
                  isActive && "ring-2 ring-gold-400/70"
                )
              }
            >
              Admin
            </NavLink>
          </nav>

          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("nav_subscribe")}
              className="btn-gold !px-5 !py-2.5 text-sm nav-link-desktop"
            >
              <YoutubeIcon className="h-4 w-4" />
              Subscribe
            </a>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className={cn(
              "lg:hidden relative inline-flex h-12 w-12 items-center justify-center rounded-full glass text-platinum",
              "transition-transform active:scale-90",
              open && "text-gold-200 ring-1 ring-gold-300/50"
            )}
            onClick={() => (open ? closeMenu() : openMenu())}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="sr-only">{open ? "Close" : "Menu"}</span>
            <span className="hamburger" data-open={open ? "true" : "false"} aria-hidden>
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu — same links as desktop.
          PERF: CSS animations (.anim-fade-in/.mmenu-panel/.mmenu-item)
          replace framer-motion; close keeps a 180 ms fade via menuClosing. */}
      {menuMounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={`lg:hidden fixed inset-0 z-[58] overflow-hidden ${menuClosing ? "anim-fade-out" : "anim-fade-in"}`}
        >
          <MobileMenuWallpaper />

          <div
            className="anim-fade-in pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 20%, rgba(212,175,55,0.12), transparent 50%)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col pt-16 md:pt-20">
            <div className="mmenu-panel flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-10">
              <div className="mx-auto w-full max-w-lg py-5 flex flex-col gap-2.5">
                <p
                  className="mmenu-item eyebrow mb-2 px-1"
                  style={{ animationDelay: "0.05s" }}
                >
                  Navigate the universe
                </p>

                {items.map((it, i) => (
                  <div
                    key={it.href}
                    className="mmenu-item"
                    style={{ animationDelay: `${0.06 + i * 0.045}s` }}
                  >
                    <NavIdleLink
                      href={it.href}
                      label={it.label}
                      index={i}
                      idleFx={idleMap[it.href] ?? null}
                      variant="mobile"
                      onActivate={closeMenu}
                    />
                  </div>
                ))}

                <div
                  className="mmenu-item mt-3 grid gap-3"
                  style={{ animationDelay: `${0.08 + items.length * 0.045}s` }}
                >
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="nav-link-mobile flex items-center justify-center rounded-2xl btn-gold px-5 py-4 text-base font-black uppercase tracking-widest shadow-gold-xl active:scale-[0.98]"
                  >
                    Admin
                  </Link>
                  <a
                    href={siteConfig.channel.subscribeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCta("nav_subscribe_mobile")}
                    className="btn-gold justify-center py-3.5 active:scale-[0.98]"
                  >
                    <YoutubeIcon className="h-5 w-5" />
                    Subscribe on YouTube
                  </a>
                  <Link
                    to="/support"
                    className="btn-ghost justify-center py-3.5 active:scale-[0.98]"
                    onClick={closeMenu}
                  >
                    Support & Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
