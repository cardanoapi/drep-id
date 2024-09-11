import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      "2xs": "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          100: "#D2E8FF",
          200: "#AFD3FF",
          300: "#7EB5FF",
          400: "#4C86FF",
          500: "#2457FF",
          600: "#0023FF",
          700: "#0028FF",
          800: "#0022D6",
          900: "#040D43",
        },
        neutral: {
          100: "#F6F6F6",
          200: "#EEEEEE",
          300: "#DBDBDB",
          400: "#AAAAAA",
          500: "#858585",
          600: "#6E6E6E",
          700: "#4D4D4D",
          800: "#2E2E2E",
          900: "#1D1D1D",
        },
        error: {
          200: "#FFE0E0",
          600: "#F03D3D",
        },
        success: {
          200: "#E2FCF0",
          600: "#2DBB7F",
        },
        warning: {
          200: "#FFF5DB",
          600: "#FFA716",
        },
      },
      minHeight: {
        "calc-244": "calc(100vh - 244px)",
      },
      height: {
        "calc-244": "calc(100vh - 244px)",
      },
    },
  },
  plugins: [],
};
export default config;
