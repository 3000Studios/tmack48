import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { navPrimaryPublic, siteConfig } from "@/data/siteConfig";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { YoutubeIcon } from "@/components/ui/Icon";
import { cn, isSupportedLink } from "@/lib/utils";
import { trackCta } from "@/lib/analytics";
import HeaderAcorns from "@/components/effects/HeaderAcorns";
import NavIdleLink, { IDLE_FX, type IdleFx } from "@/components/navigation/NavIdleLink";
import MobileMenuWallpaper from "@/components/navigation/MobileMenuWallpaper";

export default function Navbar() {
  const [open, setOpen] = useState(false);
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

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    document.body.dataset.mobileMenuOpen = open ? "true" : "false";
  }, [open]);

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
      setIdleMap((prev) => {
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
        <HeaderAcorns />
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
            onClick={() => setOpen((v) => !v)}
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

      {/* Mobile full-screen menu — same links as desktop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="lg:hidden fixed inset-0 z-[58] overflow-hidden"
          >
            <MobileMenuWallpaper />

            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background:
                  "radial-gradient(ellipse at 50% 20%, rgba(212,175,55,0.12), transparent 50%)",
              }}
            />

            <div className="relative z-10 flex h-full flex-col pt-16 md:pt-20">
              <motion.div
                initial={{ y: 28, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.9 }}
                className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-10"
              >
                <div className="mx-auto w-full max-w-lg py-5 flex flex-col gap-2.5">
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="eyebrow mb-2 px-1"
                  >
                    Navigate the universe
                  </motion.p>

                  {items.map((it, i) => (
                    <motion.div
                      key={it.href}
                      initial={{ opacity: 0, x: -28, rotateX: 40 }}
                      animate={{ opacity: 1, x: 0, rotateX: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        delay: 0.06 + i * 0.045,
                        type: "spring",
                        stiffness: 380,
                        damping: 24,
                      }}
                      style={{ transformPerspective: 900 }}
                    >
                      <NavIdleLink
                        href={it.href}
                        label={it.label}
                        index={i}
                        idleFx={idleMap[it.href] ?? null}
                        variant="mobile"
                        onActivate={() => setOpen(false)}
                      />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + items.length * 0.045 }}
                    className="mt-3 grid gap-3"
                  >
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
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
                      onClick={() => setOpen(false)}
                    >
                      Support & Contact
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
