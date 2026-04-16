import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import { siteConfig } from "@/data/siteConfig";
import { isSupportedLink } from "@/lib/utils";
import {
  FacebookIcon,
  HeartIcon,
  InstagramIcon,
  MailIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
  ArrowRightIcon,
} from "@/components/ui/Icon";
import { trackCta, trackOutbound } from "@/lib/analytics";

interface Row {
  label: string;
  sub?: string;
  href: string;
  external?: boolean;
  Icon: (p: React.SVGProps<SVGSVGElement>) => JSX.Element;
  tone?: "gold" | "diamond" | "ghost";
}

export default function Links() {
  const rows: Row[] = [
    {
      label: "Subscribe on YouTube",
      sub: "The main stage — all official music videos live here.",
      href: siteConfig.channel.subscribeUrl,
      external: true,
      Icon: YoutubeIcon,
      tone: "gold",
    },
    {
      label: "Watch the Latest Drops",
      sub: "Full catalog, sorted and filterable.",
      href: "/videos",
      Icon: ArrowRightIcon,
      tone: "ghost",
    },
    {
      label: "Support the Movement",
      sub: "Tip, cop merch, fuel the next release.",
      href: "/support",
      Icon: HeartIcon,
      tone: "diamond",
    },
    isSupportedLink(siteConfig.social.instagram) && {
      label: "Instagram",
      href: siteConfig.social.instagram,
      external: true,
      Icon: InstagramIcon,
      tone: "ghost",
    },
    isSupportedLink(siteConfig.social.tiktok) && {
      label: "TikTok",
      href: siteConfig.social.tiktok,
      external: true,
      Icon: TiktokIcon,
      tone: "ghost",
    },
    isSupportedLink(siteConfig.social.x) && {
      label: "X / Twitter",
      href: siteConfig.social.x,
      external: true,
      Icon: XIcon,
      tone: "ghost",
    },
    isSupportedLink(siteConfig.social.facebook) && {
      label: "Facebook",
      href: siteConfig.social.facebook,
      external: true,
      Icon: FacebookIcon,
      tone: "ghost",
    },
    {
      label: "Booking & Press",
      sub: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      external: true,
      Icon: MailIcon,
      tone: "ghost",
    },
  ].filter(Boolean) as Row[];

  return (
    <>
      <Seo
        path="/links"
        title="Links"
        description="Every way to connect with TMACK48 — YouTube, socials, support, and booking."
      />

      <section className="container-lux py-16 max-w-2xl">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">One Tap Away</span>
            <h1 className="mt-2 display-title text-5xl sm:text-6xl font-black">
              <span className="gold-text">TMACK48 · Links</span>
            </h1>
            <p className="mt-4 text-platinum/75">
              Watch, follow, support, book. All the moves, one page.
            </p>
          </div>

          <ul className="mt-10 space-y-3">
            {rows.map((r) => {
              const cls =
                r.tone === "gold"
                  ? "btn-gold"
                  : r.tone === "diamond"
                  ? "btn-diamond"
                  : "btn-ghost";
              const onClick = () => {
                if (r.external) trackOutbound(r.href, r.label);
                else trackCta(`links_${r.label}`);
              };
              return (
                <li key={r.label}>
                  <a
                    href={r.href}
                    target={r.external ? "_blank" : undefined}
                    rel={r.external ? "noopener noreferrer" : undefined}
                    onClick={onClick}
                    className={`${cls} w-full !justify-between !rounded-3xl !px-6 !py-5 text-left`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <r.Icon className="h-5 w-5" />
                      <span className="flex flex-col">
                        <span className="font-semibold">{r.label}</span>
                        {r.sub && (
                          <span className="text-[11px] font-normal tracking-wide opacity-70">
                            {r.sub}
                          </span>
                        )}
                      </span>
                    </span>
                    <ArrowRightIcon className="h-5 w-5 opacity-80" />
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
