import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        studio: {
          canvas: "#07080A",
          panel: "#0D0F12",
          elevated: "#14171D",
          surface: "#1A1E26",
          border: "rgba(255, 255, 255, 0.08)",
          "border-subtle": "rgba(255, 255, 255, 0.04)",
          "border-strong": "rgba(255, 255, 255, 0.16)",
          gold: "#E5C158",
          "gold-subtle": "rgba(229, 193, 88, 0.12)",
          "gold-dim": "#A38634",
        },
        nlr: {
          DEFAULT: "#E11D48",
          crimson: "#BE123C",
          dark: "#881337",
          glow: "rgba(225, 29, 72, 0.25)",
        },
        msb: {
          DEFAULT: "#2563EB",
          royal: "#1D4ED8",
          dark: "#1E3A8A",
          gold: "#E5C158",
          glow: "rgba(37, 99, 235, 0.25)",
        },
        telemetry: {
          cyan: "#38BDF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        arabic: ["var(--font-arabic)", "Noto Sans Arabic", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "scan-line": "scanline 8s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px rgba(229, 193, 88, 0.4))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 2px rgba(229, 193, 88, 0.1))" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
