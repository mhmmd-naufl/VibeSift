import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1DB954",
          dark: "#169c46",
        },
      },
    },
  },
  plugins: [],
};

export default config;
