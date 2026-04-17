import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { nav, siteConfig } from "@/data/siteConfig";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { CloseIcon, MenuIcon, YoutubeIcon } from "@/components/ui/Icon";
import { cn, isSupportedLink } from "@/lib/utils";
import { trackCta } from "@/lib/analytics";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { y, dir } = useScrollDirection();
  const loc = useLocation();

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

  const items = nav.primary.filter(
    (n) => !(n.href === "/merch" && !isSupportedLink(siteConfig.support.merch))
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 transition-[transform,background,backdrop-filter,border-color] duration-500 ease-out",
          "border-b",
          open || y > 40
            ? "bg-ink-950/80 backdrop-blur-xl border-white/5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]"
            : "bg-transparent border-transparent",
          !open && dir === "down" && y > 160 ? "-translate-y-full" : "translate-y-0"
        )}
        style={{ zIndex: 60 }}
      >
        <div className="container-lux flex h-16 md:h-20 items-center gap-3 md:gap-4">
          <Logo />

          <nav
            aria-label="Primary"
            className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-3 xl:gap-6 overflow-x-auto"
          >
            {items.map((it) => (
              <NavLink
                key={it.href}
                to={it.href}
                end={it.href === "/"}
                className={({ isActive }) =>
                  cn(
                    "link-u glint whitespace-nowrap rounded-lg px-2 py-1 text-[11px] xl:text-sm uppercase tracking-[0.16em] xl:tracking-[0.24em] font-medium transition-colors",
                    isActive ? "text-gold-300" : "text-platinum/80 hover:text-gold-200"
                  )
                }
              >
                {it.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-3 ml-auto">
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("nav_subscribe")}
              className="btn-gold !px-5 !py-2.5 text-sm"
            >
              <YoutubeIcon className="h-4 w-4" />
              Subscribe
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full glass text-platinum hover:text-gold-300"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mobile-menu-overlay lg:hidden fixed inset-x-0 top-16 md:top-20 bottom-0 z-[58] overflow-y-auto border-t border-white/10 bg-gradient-to-b from-[#080808] via-[#050505] to-[#030303] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            aria-label="Mobile menu"
          >
            <div className="container-lux py-6 pb-28 flex flex-col gap-2">
              {items.map((it, i) => (
                <motion.div
                  key={it.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    to={it.href}
                  className="mobile-menu-card glint flex items-center justify-between rounded-2xl border border-gold-300/35 bg-black px-5 py-4 text-base font-semibold uppercase tracking-[0.2em] text-platinum ring-1 ring-transparent transition hover:border-gold-300 hover:bg-gold-300 hover:text-ink-950 hover:ring-gold"
                    onClick={() => setOpen(false)}
                  >
                    <span>{it.label}</span>
                    <span className="text-current">→</span>
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <a
                  href={siteConfig.channel.subscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCta("nav_subscribe_mobile")}
                  className="btn-gold justify-center"
                >
                  <YoutubeIcon className="h-5 w-5" />
                  Subscribe on YouTube
                </a>
                {isSupportedLink(siteConfig.support.cashapp) || isSupportedLink(siteConfig.support.paypal) ? (
                  <Link to="/support" className="btn-ghost justify-center" onClick={() => setOpen(false)}>
                    Support the Movement
                  </Link>
                ) : (
                  <Link to="/support" className="btn-ghost justify-center" onClick={() => setOpen(false)}>
                    Support
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
