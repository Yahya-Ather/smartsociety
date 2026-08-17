/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1280px",
      xl: "1440px",
    },
    extend: {
      colors: {
        // Primary — Deep Navy. Sidebar, brand identity, headline gradients.
        brand: {
          50: "#EEF3F8",
          100: "#D9E4F0",
          200: "#AFC6DE",
          400: "#4C7098",
          500: "#1B3E63",
          600: "#12314F",
          700: "#0F2747",
          800: "#0A1B32",
        },
        // Secondary — Teal. Buttons and interactive accents.
        teal: {
          100: "#CCFBF1",
          300: "#5EEAD4",
          500: "#0F766E",
          600: "#0B5C56",
          700: "#083F3B",
        },
        // Accent — Sky Blue. Focus rings, highlights, info states.
        sky: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
        },
        slate: {
          white: "#FFFFFF",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        success: { fg: "#16A34A", bg: "#DCFCE7", text: "#166534" },
        warning: { fg: "#F59E0B", bg: "#FEF3C7", text: "#92400E" },
        danger: { fg: "#DC2626", bg: "#FEE2E2", text: "#991B1B", hover: "#B91C1C" },
        info: { fg: "#0284C7", bg: "#E0F2FE" },
        emergency: { DEFAULT: "#DC2626", dark: "#991B1B" },
      },
      fontFamily: {
        heading: ['"Manrope"', "sans-serif"],
        body: ['"Public Sans"', "Helvetica", "Arial", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      fontSize: {
        display: ["40px", { lineHeight: "44px", letterSpacing: "-0.025em", fontWeight: "800" }],
        h1: ["32px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "30px", letterSpacing: "-0.015em", fontWeight: "700" }],
        h3: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "25px" }],
        body: ["14px", { lineHeight: "21px" }],
        label: ["12px", { lineHeight: "1.4", letterSpacing: "0.04em", fontWeight: "600" }],
        "mono-amt": ["13px", { lineHeight: "1", fontWeight: "500" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
      },
      borderRadius: {
        control: "6px",
        card: "10px",
        panel: "14px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(16,28,48,0.06)",
        md: "0 4px 12px rgba(16,28,48,0.08)",
        lg: "0 18px 44px rgba(16,28,48,0.18)",
      },
      keyframes: {
        siren: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217,45,32,0.45)" },
          "70%": { boxShadow: "0 0 0 12px rgba(217,45,32,0)" },
        },
        livePulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(15,139,84,0.5)" },
          "70%": { boxShadow: "0 0 0 7px rgba(15,139,84,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(15,139,84,0)" },
        },
      },
      animation: {
        siren: "siren 2.2s ease-out infinite",
        "live-pulse": "livePulse 2s ease-out infinite",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
