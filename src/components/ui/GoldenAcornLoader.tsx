interface Props {
  label?: string;
  compact?: boolean;
}

export default function GoldenAcornLoader({ label = "Loading the vault", compact = false }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-platinum/80">
      <img
        src="/golden-acorn.svg"
        alt="Golden acorn"
        className={compact ? "h-12 w-12 animate-pulse" : "h-20 w-20 animate-float"}
        loading="eager"
        decoding="async"
      />
      <p className="text-[10px] uppercase tracking-[0.35em] text-gold-300">{label}</p>
    </div>
  );
}
