import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { stardustBurst } from "@/components/navigation/stardust";

// "Wet gold" idle language (Boss order 2026-11-07): only two subtle,
// scene-blending effects remain — a soft gold glow (like the alley sign
// warming up) and a single shine sweep. The old bounce/float/pulse/
// wiggle/spin/spark set fought the site's mood and is retired.
const IDLE_FX = ["nav-idle-glow", "nav-idle-shimmer"] as const;

export type IdleFx = (typeof IDLE_FX)[number] | null;

export { IDLE_FX };

interface Props {
  href: string;
  label: string;
  idleFx?: IdleFx;
  onActivate?: () => void;
  variant?: "desktop" | "mobile";
  index?: number;
}

export default function NavIdleLink({
  href,
  label,
  idleFx = null,
  onActivate,
  variant = "desktop",
  index = 0,
}: Props) {
  const navigate = useNavigate();

  if (variant === "mobile") {
    return (
      <NavLink
        to={href}
        end={href === "/"}
        onClick={(e) => {
          // Splash tap (Boss order 2026-11-07): gold flash + stardust
          // fizzle first, THEN the page changes.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          stardustBurst(e.currentTarget, () => {
            onActivate?.();
            navigate(href);
          });
        }}
        className={({ isActive }) =>
          cn(
            "nav-link-mobile font-playfair group relative flex items-center justify-between overflow-hidden rounded-2xl border px-5 py-4 text-[22px] font-semibold tracking-[0.04em] transition-[transform,color,background-color,border-color,box-shadow,filter] duration-300",
            "active:scale-[0.98] active:brightness-110",
            "hover:border-gold-300 hover:bg-gold-300/95 hover:text-ink-950 hover:shadow-[0_0_40px_-8px_rgba(212,175,55,0.75)]",
            isActive
              ? "border-gold-300/70 bg-gold-300/15 text-gold-200 ring-1 ring-gold-300/40"
              : "border-white/10 bg-black/45 text-platinum backdrop-blur-md",
            idleFx
          )
        }
        style={{ ["--nav-i" as never]: index }}
      >
        <span className="nav-link-label relative z-[1]">{label}</span>
        <span className="relative z-[1] text-current opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100">
          →
        </span>
        <span className="nav-shine" aria-hidden />
      </NavLink>
    );
  }

  return (
    <NavLink
      to={href}
      end={href === "/"}
      onClick={onActivate}
      className={({ isActive }) =>
        cn(
          // PERF (2026-11-08): explicit transition list — `transition-all`
          // would also animate the label's hover letter-spacing through
          // layout; the list keeps every animated property composited.
          "nav-link-desktop group relative whitespace-nowrap rounded-lg px-1.5 xl:px-2.5 py-1.5 text-[11px] xl:text-[13px] uppercase tracking-[0.12em] xl:tracking-[0.18em] font-medium transition-[transform,color,text-shadow,filter] duration-300",
          "hover:text-gold-100 hover:scale-[1.04]",
          "active:scale-95 active:text-gold-50",
          isActive ? "text-gold-300" : "text-platinum/80",
          idleFx
        )
      }
      style={{ ["--nav-i" as never]: index }}
    >
      <span className="nav-link-label relative z-[1]">{label}</span>
      <span className="nav-shine" aria-hidden />
      {/* Gold sweep underline (index.css .nav-hover-underline) — slides
          in on hover/focus and stays lit on the active route. */}
      <span className="nav-hover-underline" aria-hidden />
    </NavLink>
  );
}
