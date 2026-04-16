import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FFF8E1",
          100: "#FBEFC2",
          200: "#F2DB8A",
          300: "#E7C65C",
          400: "#DCB642",
          500: "#D4AF37",
          600: "#B5952B",
          700: "#8D7220",
          800: "#665218",
          900: "#3F340E",
        },
        platinum: "#E5E4E2",
        diamond: "#B9F2FF",
        glow: "#7FDBFF",
        ink: {
          950: "#050505",
          900: "#0A0A0A",
          800: "#111111",
          700: "#161616",
          600: "#1C1C1C",
          500: "#222222",
        },
        brand: {
          gold: "#D4AF37",
          platinum: "#E5E4E2",
          diamond: "#B9F2FF",
          night: "#050505",
          char: "#111111",
          glow: "#7FDBFF",
        },
      },
      fontFamily: {
        display: ['"Unbounded"', '"Orbitron"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(212,175,55,0.35), 0 0 80px rgba(212,175,55,0.15)",
        "gold-soft": "0 10px 60px -10px rgba(212,175,55,0.45)",
        diamond: "0 0 30px rgba(185,242,255,0.4)",
        premium: "0 30px 80px -20px rgba(0,0,0,0.8), 0 10px 30px -10px rgba(212,175,55,0.2)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 80px -20px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg,#FFE29A 0%,#D4AF37 45%,#8D7220 100%)",
        "gold-shine":
          "linear-gradient(100deg,rgba(255,255,255,0) 20%,rgba(255,255,255,0.55) 50%,rgba(255,255,255,0) 80%)",
        "platinum-grad": "linear-gradient(135deg,#FFFFFF 0%,#E5E4E2 50%,#9F9F9F 100%)",
        "night-grad": "radial-gradient(1200px 600px at 50% -10%,#1a1205 0%,#050505 55%,#000 100%)",
        "diamond-grad":
          "linear-gradient(135deg,#B9F2FF 0%,#7FDBFF 50%,#48A9C5 100%)",
        "glass-grad":
          "linear-gradient(145deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.02) 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "4xl": "2rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 25px rgba(212,175,55,0.4)" },
          "50%": { boxShadow: "0 0 55px rgba(212,175,55,0.85)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        glint: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(150%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marqueeReverse 40s linear infinite",
        spinSlow: "spinSlow 30s linear infinite",
        glint: "glint 2.5s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
