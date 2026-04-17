import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { nav, siteConfig } from "@/data/siteConfig";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/ui/Icon";
import { isSupportedLink } from "@/lib/utils";
import { trackOutbound } from "@/lib/analytics";

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { href: siteConfig.social.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: siteConfig.social.tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: siteConfig.social.x, label: "X", Icon: XIcon },
  ].filter((s) => isSupportedLink(s.href));

  return (
    <footer className="relative mt-20 border-t border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)" }}
      />
      <div className="container-lux py-14 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2">
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
              className="btn-gold !px-5 !py-2.5 text-sm"
            >
              <YoutubeIcon className="h-4 w-4" />
              Subscribe on YouTube
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="btn-ghost !px-5 !py-2.5 text-sm">
              <MailIcon className="h-4 w-4" />
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Explore</h3>
          <ul className="space-y-2">
            {nav.primary.map((it) => (
              <li key={it.href}>
                <Link to={it.href} className="text-platinum/80 hover:text-gold-300 transition-colors">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Legal & Contact</h3>
          <ul className="space-y-2">
            {nav.footer.map((it) => (
              <li key={it.href}>
                <Link to={it.href} className="text-platinum/80 hover:text-gold-300 transition-colors">
                  {it.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-platinum/80 hover:text-gold-300 transition-colors"
              >
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-lux flex flex-col items-center justify-between gap-6 border-t border-white/5 pb-10 pt-6 md:flex-row">
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
          <p className="text-[10px] uppercase tracking-[0.18em] text-platinum/35">Site dev 3000 Studios</p>
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              onClick={() => trackOutbound(href, `footer_${label}`)}
              className="grid h-10 w-10 place-items-center rounded-full glass text-platinum/80 hover:text-gold-300 hover:ring-gold transition-all"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50">
          © {year} TMACK48 — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
