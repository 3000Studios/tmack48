export type PageBackdropVariant =
  | "gold"
  | "platinum"
  | "diamond"
  | "ruby"
  | "emerald"
  | "sunset";

export interface BackdropPreset {
  accent: string;
  rim: string;
  chill: string;
  fogNear: string;
  fogFar: string;
}

export const BACKDROP_PRESETS: Record<PageBackdropVariant, BackdropPreset> = {
  gold: {
    accent: "#D4AF37",
    rim: "#FFE29A",
    chill: "#7FDBFF",
    fogNear: "#050505",
    fogFar: "#120a02",
  },
  platinum: {
    accent: "#E5E4E2",
    rim: "#FFFFFF",
    chill: "#9fd4ff",
    fogNear: "#070708",
    fogFar: "#101018",
  },
  diamond: {
    accent: "#B9F2FF",
    rim: "#E8FDFF",
    chill: "#7FDBFF",
    fogNear: "#030608",
    fogFar: "#061018",
  },
  ruby: {
    accent: "#FF4D6D",
    rim: "#FFB3C6",
    chill: "#FFB703",
    fogNear: "#080305",
    fogFar: "#180510",
  },
  emerald: {
    accent: "#34D399",
    rim: "#A7F3D0",
    chill: "#FFE29A",
    fogNear: "#030806",
    fogFar: "#061812",
  },
  sunset: {
    accent: "#FB923C",
    rim: "#FDE68A",
    chill: "#818CF8",
    fogNear: "#0a0604",
    fogFar: "#1a1008",
  },
};

/** Route-specific 3D moods — one variant per logical page section. */
export function backdropVariantForPath(pathname: string): PageBackdropVariant {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return "gold";
  if (path.startsWith("/videos")) return "diamond";
  if (path.startsWith("/shorts")) return "diamond";
  if (path.startsWith("/gallery")) return "platinum";
  if (path.startsWith("/about")) return "ruby";
  if (path.startsWith("/press")) return "emerald";
  if (path.startsWith("/stories")) return "sunset";
  if (path.startsWith("/merch")) return "gold";
  if (path.startsWith("/support")) return "emerald";
  if (path.startsWith("/contact")) return "platinum";
  if (path.startsWith("/links")) return "diamond";
  if (path.startsWith("/privacy")) return "platinum";
  if (path.startsWith("/terms")) return "platinum";
  if (path.startsWith("/admin")) return "ruby";

  return "gold";
}
