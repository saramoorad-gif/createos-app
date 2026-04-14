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
        bg: "#FAF8F4",
        "pale-blue": "#F2F8FB",
        beige: "#F0EAE0",
        accent: { DEFAULT: "#7BAFC8", mid: "#6AA0BB", dark: "#3D6E8A" },
        navy: "#1E3F52",
        ink: "#1A2C38",
        mid: "#4A6070",
        muted: { DEFAULT: "#8AAABB", bg: "#F0EAE0" },
        border: { DEFAULT: "#D8E8EE", beige: "#DDD6C8", row: "#EEE8E0" },
        success: { DEFAULT: "#3D7A58", bg: "#E8F4EE" },
        warning: { DEFAULT: "#A07830", bg: "#F4EEE0" },
        danger: { DEFAULT: "#A03D3D", bg: "#F4EAEA" },
        contract: { DEFAULT: "#6A5040", bg: "#F0EAE0" },
      },
      fontFamily: {
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-mono)", "monospace"],
      },
      borderRadius: {
        btn: "8px",
        card: "10px",
        panel: "16px",
        section: "18px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(123,175,200,.12)",
        soft: "0 12px 40px rgba(30,63,82,.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
