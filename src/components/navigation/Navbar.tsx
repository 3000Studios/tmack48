import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { stardustBurst } from "@/components/navigation/stardust";
import Logo from "@/components/ui/Logo";
import { navPrimaryPublic, siteConfig } from "@/data/siteConfig";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { YoutubeIcon } from "@/components/ui/Icon";
import { cn, isSupportedLink } from "@/lib/utils";
import { trackCta } from "@/lib/analytics";
// Three curvy sound-responsive sheen lines across the top — these
// replaced the header acorns (Boss order 2026-11-07).
const AudioLines = lazy(() => import("@/components/effects/AudioLines"));
import NavIdleLink, { IDLE_FX, type IdleFx } from "@/components/navigation/NavIdleLink";
import MobileMenuWallpaper from "@/components/navigation/MobileMenuWallpaper";
import { useSiteOverrides } from "@/lib/siteOverrides";

export default function Navbar() {
  const navigate = useNavigate();
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

  // Extra tabs added from the admin editor (incl. the shop link) — they
  // appear in both the desktop bar and the mobile menu, live.
  const ov = useSiteOverrides();
  const extraLinks = useMemo(() => {
    const links = [...ov.navLinks];
    if (ov.shopUrl && !links.some((l) => l.url === ov.shopUrl)) {
      links.push({ label: ov.shopLabel || "Shop", url: ov.shopUrl });
    }
    return links;
  }, [ov.navLinks, ov.shopUrl, ov.shopLabel]);

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

  // Every 6.5s: one random link gets one subtle gold idle effect
  // (glow or shine sweep — the "wet gold" set in NavIdleLink).
  useEffect(() => {
    const tick = () => {
      if (!items.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const link = items[Math.floor(Math.random() * items.length)];
      const fx = IDLE_FX[Math.floor(Math.random() * IDLE_FX.length)];
      setIdleMap({ [link.href]: fx });
      // Clear after animation window so idle resets
      window.setTimeout(() => {
        setIdleMap((prev) => {
          const next = { ...prev };
          delete next[link.href];
          return next;
        });
      }, 1500);
    };
    const id = window.setInterval(tick, 6500);
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
          "site-header-slide fixed inset-x-0 top-0 overflow-hidden transition-[transform,background,backdrop-filter,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "border-b header-3d",
          open || y > 40
            ? "bg-ink-950/85 backdrop-blur-xl border-white/5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]"
            : "bg-transparent border-transparent",
          !open && dir === "down" && y > 160 ? "-translate-y-full" : "translate-y-0"
        )}
        style={{ zIndex: 60 }}
      >
        <Suspense fallback={null}>
          <AudioLines />
        </Suspense>
        <div className="container-lux relative z-10 flex h-16 md:h-20 items-center justify-between gap-3 md:gap-4">
          <Logo className="shrink-0 origin-left lg:scale-90 xl:scale-100" />

          {/* Desktop — same primary set as mobile */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex flex-1 min-w-0 flex-nowrap items-center justify-center gap-0.5 xl:gap-2 px-1"
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
            {extraLinks.map((l) =>
              l.url.startsWith("/") ? (
                <NavLink
                  key={l.url}
                  to={l.url}
                  className="nav-link-desktop group relative whitespace-nowrap rounded-lg px-1.5 xl:px-2.5 py-1.5 text-[11px] xl:text-[13px] uppercase tracking-[0.12em] xl:tracking-[0.18em] font-medium text-gold-200/90 transition-all duration-300 hover:text-gold-100 hover:scale-[1.04]"
                >
                  {l.label}
                </NavLink>
              ) : (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link-desktop group relative whitespace-nowrap rounded-lg px-1.5 xl:px-2.5 py-1.5 text-[11px] xl:text-[13px] uppercase tracking-[0.12em] xl:tracking-[0.18em] font-medium text-gold-200/90 transition-all duration-300 hover:text-gold-100 hover:scale-[1.04]"
                >
                  {l.label}
                </a>
              )
            )}
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

                {extraLinks.map((l, i) => (
                  <div
                    key={l.url}
                    className="mmenu-item"
                    style={{ animationDelay: `${0.06 + (items.length + i) * 0.045}s` }}
                  >
                    <a
                      href={l.url}
                      {...(l.url.startsWith("/")
                        ? {
                            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                              e.preventDefault();
                              stardustBurst(e.currentTarget, () => {
                                closeMenu();
                                navigate(l.url);
                              });
                            },
                          }
                        : { target: "_blank", rel: "noopener noreferrer" })}
                      className="nav-link-mobile font-playfair group relative flex items-center justify-between overflow-hidden rounded-2xl border border-gold-300/40 bg-gold-300/10 px-5 py-4 text-[22px] font-semibold tracking-[0.04em] text-gold-200 backdrop-blur-md transition-all duration-300 active:scale-[0.98]"
                    >
                      <span className="relative z-[1]">{l.label}</span>
                      <span className="relative z-[1] opacity-70">→</span>
                    </a>
                  </div>
                ))}

                <div
                  className="mmenu-item mt-3 grid gap-3"
                  style={{ animationDelay: `${0.08 + items.length * 0.045}s` }}
                >
                  <Link
                    to="/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      stardustBurst(e.currentTarget, () => {
                        closeMenu();
                        navigate("/admin");
                      });
                    }}
                    className="nav-link-mobile font-playfair relative flex items-center justify-center overflow-hidden rounded-2xl btn-gold px-5 py-4 text-[22px] font-bold tracking-[0.04em] shadow-gold-xl active:scale-[0.98]"
                  >
                    Admin
                  </Link>
                  <a
                    href={siteConfig.channel.subscribeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCta("nav_subscribe_mobile")}
                    className="btn-gold font-playfair justify-center py-3.5 text-lg active:scale-[0.98]"
                  >
                    <YoutubeIcon className="h-5 w-5" />
                    Subscribe on YouTube
                  </a>
                  <Link
                    to="/support"
                    className="btn-ghost font-playfair relative justify-center overflow-hidden py-3.5 text-lg active:scale-[0.98]"
                    onClick={(e) => {
                      e.preventDefault();
                      stardustBurst(e.currentTarget, () => {
                        closeMenu();
                        navigate("/support");
                      });
                    }}
                  >
                    Support &amp; Contact
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
