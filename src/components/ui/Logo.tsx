import { Link } from "react-router-dom";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="TMACK48 home"
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <span
        className="relative grid h-10 w-10 place-items-center rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#FFE29A 0%,#D4AF37 50%,#8D7220 100%)",
          boxShadow: "0 6px 22px -6px rgba(212,175,55,0.7), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <span className="font-display font-black text-ink-950 text-lg leading-none">T48</span>
        <span className="absolute inset-0 bg-gold-shine bg-[length:200%_100%] animate-shimmer mix-blend-overlay opacity-60" />
      </span>
      <span className="hidden sm:flex flex-col leading-tight">
        <span className="display-title text-lg font-black tracking-wide gold-text">TMACK48</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-platinum/60">Official</span>
      </span>
    </Link>
  );
}
