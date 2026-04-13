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
        bg: "#F7F4EF",
        nav: "#1C1714",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1714",
        },
        border: "#E5E0D8",
        terra: {
          DEFAULT: "#C4714A",
          50: "#FBF0EA",
          100: "#F5DDD0",
          200: "#EDCAB5",
          500: "#C4714A",
          600: "#B05C38",
          700: "#934A2E",
        },
        success: "#4A9060",
        warning: "#D4A030",
        urgent: "#E05C3A",
        text: {
          primary: "#1C1714",
          secondary: "#9A9088",
          label: "#9A9088",
        },
        muted: {
          DEFAULT: "#F2EEE8",
          foreground: "#9A9088",
        },
      },
      fontFamily: {
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-mono)", "monospace"],
      },
      fontWeight: {
        "400": "400",
        "500": "500",
        "600": "600",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
