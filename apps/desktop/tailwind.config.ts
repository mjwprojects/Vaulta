import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff", 100: "#d8eeff", 200: "#b9e0ff",
          300: "#89ccff", 400: "#52aeff", 500: "#2a8aff",
          600: "#1469f5", 700: "#0d51e0", 800: "#1143b5",
          900: "#143c8e", 950: "#112657",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
