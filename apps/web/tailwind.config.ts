import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f3eeff",
          100: "#e4d4ff",
          200: "#cba8ff",
          300: "#b07aff",
          400: "#9d5fff",
          500: "#8E4DFF",   // primary
          600: "#7c3aed",
          700: "#5B21B6",   // accentDeep
          800: "#4c1d95",
          900: "#3b1578",
          highlight: "#C084FC",
        },
        surface: {
          DEFAULT: "#151022",
          raised:  "#211630",
        },
        vaulta: {
          bg:     "#0B0614",
          border: "#3B2557",
          text:   "#F8FAFC",
          muted:  "#9CA3AF",
        },
        danger: {
          50:  "#fff1f2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        warning: {
          50:  "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        success: {
          50:  "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
