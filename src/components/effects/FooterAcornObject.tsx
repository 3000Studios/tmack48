/**
 * Footer acorn — PERF (2026-10-18): previously a full Three.js WebGL
 * renderer running a perpetual requestAnimationFrame loop just to slowly
 * spin one acorn in the footer of every page. Replaced with the site's
 * golden-acorn SVG and a gentle CSS sway — same brand motif, no WebGL
 * context, no JS loop, no three.js download.
 */
export default function FooterAcornObject() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-55 flex items-center justify-center" aria-hidden>
      <img
        src="/golden-acorn.svg"
        alt=""
        width={120}
        height={120}
        loading="lazy"
        decoding="async"
        className="acorn-sway h-[72%] w-auto max-h-40 drop-shadow-[0_10px_24px_rgba(212,175,55,0.35)]"
      />
    </div>
  );
}
