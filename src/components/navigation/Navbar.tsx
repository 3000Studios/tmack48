import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { navPrimaryPublic, siteConfig } from "@/data/siteConfig";
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

  const items = navPrimaryPublic.filter(
    (n) => !(n.href === "/merch" && !isSupportedLink(siteConfig.support.merch))
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 transition-[transform,background,backdrop-filter,border-color] duration-500 ease-out",
        "border-b",
        y > 40
          ? "bg-ink-950/80 backdrop-blur-xl border-white/5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]"
          : "bg-transparent border-transparent",
        dir === "down" && y > 160 ? "-translate-y-full" : "translate-y-0"
      )}
      style={{ zIndex: 50 }}
    >
      <div className="container-lux flex h-16 md:h-20 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-6 xl:gap-8">
          {items.map((it) => (
            <NavLink
              key={it.href}
              to={it.href}
              end={it.href === "/"}
              className={({ isActive }) =>
                cn(
                  "link-rise link-u text-sm uppercase tracking-[0.25em] font-medium transition-colors",
                  isActive ? "text-gold-300" : "text-platinum/80 hover:text-gold-200"
                )
              }
            >
              {it.label}
            </NavLink>
          ))}
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "btn-gold !px-4 !py-2 text-xs uppercase tracking-[0.2em] shrink-0 shadow-[0_8px_30px_-12px_rgba(212,175,55,0.55)]",
                isActive && "ring-2 ring-gold-400/70"
              )
            }
          >
            Admin
          </NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
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

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-x-0 top-16 md:top-20 bottom-0 bg-ink-950/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="container-lux py-8 flex flex-col gap-2">
              {items.map((it, i) => (
                <motion.div
                  key={it.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    to={it.href}
                    className="link-rise flex items-center justify-between rounded-2xl glass px-5 py-4 text-lg font-medium uppercase tracking-widest hover:ring-gold"
                  >
                    <span>{it.label}</span>
                    <span className="text-gold-300">→</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * items.length }}
              >
                <Link
                  to="/admin"
                  className="flex items-center justify-center rounded-2xl btn-gold px-5 py-4 text-lg font-black uppercase tracking-widest shadow-gold-xl"
                >
                  Admin
                </Link>
              </motion.div>
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
                  <Link to="/support" className="btn-ghost justify-center">
                    Support the Movement
                  </Link>
                ) : (
                  <Link to="/support" className="btn-ghost justify-center">
                    Support
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
