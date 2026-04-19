import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { nav, navPrimaryPublic, siteConfig } from "@/data/siteConfig";
import { YoutubeIcon } from "@/components/ui/Icon";
import { isSupportedLink } from "@/lib/utils";
import { trackOutbound } from "@/lib/analytics";
import { subscribeAcornLandingCount } from "@/lib/acornBus";
import { useEffect, useState } from "react";
import FooterAcornObject from "@/components/effects/FooterAcornObject";

function SiteDevMark() {
  const text = "Site dev 3000 Studios";
  return (
    <span className="site-dev-3000" aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className={ch === " " ? "site-dev-space" : "site-dev-char"}
          style={{ ["--i" as never]: i }}
          aria-hidden="true"
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [landed, setLanded] = useState(0);

  useEffect(() => subscribeAcornLandingCount(setLanded), []);

  const socials = [
    { href: siteConfig.social.youtube, label: "YouTube" },
    { href: siteConfig.social.instagram, label: "Instagram" },
    { href: siteConfig.social.facebook, label: "Facebook" },
    { href: siteConfig.social.tiktok, label: "TikTok" },
    { href: siteConfig.social.x, label: "X" },
  ].filter((s) => isSupportedLink(s.href));

  const glow = Math.min(1, landed / 10);
  const bgBoost = 0.8 + glow * 0.55;

  return (
    <footer
      className="relative z-10 mt-20 border-t border-white/5 bg-ink-950/80 backdrop-blur-xl transition-[filter,background-color] duration-700"
      style={{
        filter: `brightness(${bgBoost})`,
        boxShadow: glow
          ? `0 -30px 90px -60px rgba(212,175,55,${0.25 + glow * 0.45})`
          : undefined,
      }}
    >
      <img
        src="/golden-acorn.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-6 left-4 h-10 w-10 sm:h-12 sm:w-12 md:left-10 opacity-80 animate-float"
      />
      <img
        src="/golden-acorn.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-4 right-6 h-8 w-8 sm:h-10 sm:w-10 md:right-12 opacity-70 animate-float [animation-delay:1.2s]"
      />
      <img
        src="/golden-acorn.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-[45%] hidden h-9 w-9 md:block opacity-60 animate-float [animation-delay:2s]"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)" }}
      />

      {/* 3D layer: behind footer content but above wallpaper */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FooterAcornObject />
      </div>

      <div className="container-lux relative z-10 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-5 max-w-md text-platinum/70 leading-relaxed">
            TMACK48 is a premium music universe — luxury-flashy visuals, street-smart anthems,
            and a relentless grind. Watch on YouTube, follow the drops, and support the movement.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={siteConfig.channel.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutbound(siteConfig.channel.subscribeUrl, "footer_subscribe")}
              className="btn-gold glint animate-[pulseGlow_4s_ease-in-out_infinite] !px-5 !py-2.5 text-sm"
            >
              <YoutubeIcon className="h-4 w-4" />
              Subscribe on YouTube
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 md:col-span-2">
          <div>
            <h3 className="eyebrow mb-4">Explore</h3>
            <ul className="space-y-2">
              {navPrimaryPublic.map((it) => (
                <li key={it.href}>
                  <Link
                    to={it.href}
                    className="link-rise text-platinum/80 hover:text-gold-300 transition-colors"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Legal</h3>
            <ul className="space-y-2">
              {nav.footer.map((it) => (
                <li key={it.href}>
                  <Link
                    to={it.href}
                    className="link-rise text-platinum/80 hover:text-gold-300 transition-colors"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Social</h3>
            <ul className="space-y-2">
              {socials.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutbound(href, `footer_${label}`)}
                    className="link-rise text-platinum/80 hover:text-gold-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-lux relative z-10 flex flex-col items-center justify-between gap-6 border-t border-white/5 pb-8 pt-5 md:flex-row">
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
          <SiteDevMark />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50">
          © {year} TMACK48 — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
