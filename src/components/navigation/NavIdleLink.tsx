import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const IDLE_FX = [
  "nav-idle-glow",
  "nav-idle-bounce",
  "nav-idle-shimmer",
  "nav-idle-float",
  "nav-idle-pulse",
  "nav-idle-wiggle",
  "nav-idle-spin",
  "nav-idle-spark",
] as const;

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
  if (variant === "mobile") {
    return (
      <NavLink
        to={href}
        end={href === "/"}
        onClick={onActivate}
        className={({ isActive }) =>
          cn(
            "nav-link-mobile group relative flex items-center justify-between overflow-hidden rounded-2xl border px-5 py-4 text-base font-semibold uppercase tracking-[0.18em] transition-all duration-300",
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
          "nav-link-desktop group relative whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] xl:text-sm uppercase tracking-[0.16em] xl:tracking-[0.2em] font-medium transition-all duration-300",
          "hover:text-gold-100 hover:scale-[1.06]",
          "active:scale-95 active:text-gold-50",
          isActive ? "text-gold-300" : "text-platinum/80",
          idleFx
        )
      }
      style={{ ["--nav-i" as never]: index }}
    >
      <span className="nav-link-label relative z-[1]">{label}</span>
      <span className="nav-shine" aria-hidden />
      <span
        className={cn(
          "pointer-events-none absolute inset-x-1 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-gold-300 to-transparent transition-transform duration-400 group-hover:scale-x-100",
          // active underline handled via NavLink parent text color
        )}
        aria-hidden
      />
    </NavLink>
  );
}
