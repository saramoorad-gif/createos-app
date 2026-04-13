import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        terra: {
          50: "#FBF0EA",
          100: "#FAE8DC",
          200: "#F3CDB5",
          300: "#E5A87E",
          400: "#D4895C",
          500: "#C4714A",
          600: "#B05C38",
          700: "#934A2E",
          800: "#7A3E29",
          900: "#653524",
        },
        amber: {
          50: "#FBF5EC",
          100: "#F5ECD4",
          200: "#EBD7A7",
          300: "#DEBB73",
          400: "#CFA24E",
          500: "#A87C3A",
          600: "#946430",
          700: "#7B4D2A",
          800: "#674028",
          900: "#573625",
        },
        warm: {
          50: "#F8F6F3",
          100: "#F5F0EB",
          200: "#FFF5EB",
          300: "#FFEFE0",
          400: "#FFE8D4",
        },
        green: {
          DEFAULT: "#2D6E2A",
          50: "#EBF5EB",
          100: "#D4EAD3",
          500: "#2D6E2A",
          600: "#245A22",
          700: "#1B451A",
        },
        muted: {
          DEFAULT: "#F5F0EB",
          foreground: "#6B6460",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1714",
        },
        border: "rgba(26, 23, 20, 0.09)",
        ring: "#C4714A",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.75rem",
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        "card": "8px",
        "card-lg": "12px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
