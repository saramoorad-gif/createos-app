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
          50: "#FDF5F0",
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
          50: "#FBF7EE",
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
          50: "#FFFCF9",
          100: "#FFF9F3",
          200: "#FFF5EB",
          300: "#FFEFE0",
          400: "#FFE8D4",
        },
        muted: {
          DEFAULT: "#F5F0EB",
          foreground: "#7A7067",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2D2418",
        },
        border: "#E8E0D8",
        ring: "#C4714A",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
