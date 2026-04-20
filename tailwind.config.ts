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
        // Ink: original #1A2C38 + "deep" variant from elevated design
        ink: { DEFAULT: "#1A2C38", deep: "#0F1E28" },
        mid: "#4A6070",
        muted: { DEFAULT: "#8AAABB", bg: "#F0EAE0" },
        // Paper tiers (warm-neutral surfaces for cards/sections)
        paper: { DEFAULT: "#FAF8F4", 2: "#F4F1EA", 3: "#EBE6DB" },
        // Rules: warm hairlines (new) + cool hairlines (existing)
        rule: { DEFAULT: "#E3DED2", cool: "#D8E8EE", strong: "#C9C0AE" },
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
        xl2: "18px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(123,175,200,.12)",
        soft: "0 12px 40px rgba(30,63,82,.08)",
        // Elevated design: big soft drop under hero cards
        elev: "0 1px 0 rgba(30,63,82,.02), 0 28px 60px -32px rgba(30,63,82,.18)",
        device: "0 2px 0 rgba(30,63,82,.02), 0 50px 80px -50px rgba(30,63,82,.3)",
        board: "0 40px 70px -50px rgba(30,63,82,.25)",
      },
      animation: {
        "scan-line": "scanLine 4.5s cubic-bezier(.6,0,.3,1) infinite",
        "slide-logos": "slideLogos 38s linear infinite",
        "pulse-dot": "pulseA 2.2s ease-in-out infinite",
        "chip-in": "chipIn .6s cubic-bezier(.2,.7,.2,1) forwards",
      },
      keyframes: {
        scanLine: {
          "0%": { top: "0", opacity: "0" },
          "8%": { opacity: "1" },
          "92%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
        slideLogos: {
          to: { transform: "translateX(-50%)" },
        },
        pulseA: {
          "50%": { boxShadow: "0 0 0 6px color-mix(in oklab, #3D7A58 8%, transparent)" },
        },
        chipIn: {
          to: { opacity: "1", transform: "none" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
