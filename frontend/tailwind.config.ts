import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Spotify green — the single accent of the system.
        brand: {
          DEFAULT: "#1ED760",
          dark: "#1DB954",
          soft: "#123524",
        },
        // Dark surfaces (Spotify-style #121212 family).
        canvas: "#121212",
        panel: "#181818",
        line: "#2a2a2a",
        ink: "#f4f4f5",
        sub: "#a1a1aa",
        faint: "#6b7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Sans-only system: serif alias resolves to Inter.
        serif: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97) translateY(6px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.21, 0.9, 0.35, 1) both",
        "scale-in": "scale-in 0.22s cubic-bezier(0.21, 0.9, 0.35, 1) both",
        "toast-in": "toast-in 0.28s cubic-bezier(0.21, 0.9, 0.35, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
