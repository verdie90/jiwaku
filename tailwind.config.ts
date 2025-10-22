import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--color-border) / <alpha-value>)",
        input: "hsl(var(--color-input) / <alpha-value>)",
        ring: "hsl(var(--color-ring) / <alpha-value>)",
        background: "hsl(var(--color-background) / <alpha-value>)",
        foreground: "hsl(var(--color-foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
          foreground: "hsl(var(--color-primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary) / <alpha-value>)",
          foreground: "hsl(var(--color-secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-destructive) / <alpha-value>)",
          foreground: "hsl(var(--color-destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted) / <alpha-value>)",
          foreground: "hsl(var(--color-muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent) / <alpha-value>)",
          foreground: "hsl(var(--color-accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--color-popover) / <alpha-value>)",
          foreground: "hsl(var(--color-popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--color-card) / <alpha-value>)",
          foreground: "hsl(var(--color-card-foreground) / <alpha-value>)",
        },
        success: "hsl(var(--color-success) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",
        info: "hsl(var(--color-info) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "4xs": "0.25rem",
        "3xs": "0.5rem",
        "2xs": "0.75rem",
        xs: "1rem",
        sm: "1.25rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
        "3xl": "3.5rem",
        "4xl": "4rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.5px" }],
        sm: ["14px", { lineHeight: "20px", letterSpacing: "0.25px" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "0.5px" }],
        lg: ["18px", { lineHeight: "28px", letterSpacing: "0px" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "0px" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "0px" }],
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "0px" }],
        "4xl": ["36px", { lineHeight: "40px", letterSpacing: "-0.5px" }],
        "5xl": ["48px", { lineHeight: "48px", letterSpacing: "-1px" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

export default config;
