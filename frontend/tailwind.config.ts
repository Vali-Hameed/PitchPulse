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
        nlr: {
          DEFAULT: "#EF4444",
          crimson: "#DC2626",
          dark: "#991B1B",
          glow: "rgba(239, 68, 68, 0.4)",
        },
        msb: {
          DEFAULT: "#3B82F6",
          royal: "#2563EB",
          dark: "#1E40AF",
          gold: "#FACC15",
          glow: "rgba(59, 130, 246, 0.4)",
        },
        telemetry: {
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          purple: "#A855F7",
        },
      },
      fontFamily: {
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
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.2))" },
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
