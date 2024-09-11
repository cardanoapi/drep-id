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
          900: "#040D43",
        },
        neutral: {
          700: "#4D4D4D",
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
