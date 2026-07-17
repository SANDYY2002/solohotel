import type { Config } from "tailwindcss";

/**
 * YUKIN design tokens.
 *
 * Palette is deliberately botanical/mineral, not the generic cream+terracotta
 * "AI luxury" default: deep conservatory greens, a weathered bronze accent,
 * warm stone neutrals. Dark mode inverts to a near-black basalt ground with
 * the same bronze accent, so the brand doesn't shift between modes.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutrals — "stone" ramp
        stone: {
          50: "#F7F5F0",
          100: "#EFEBE2",
          200: "#E1DACB",
          300: "#C9BFA8",
          400: "#A79C82",
          500: "#847860",
          600: "#655B47",
          700: "#4A4235",
          800: "#302B23",
          900: "#1B1815",
          950: "#100E0C",
        },
        // Brand — "conservatory" deep greens.
        // 900/950 are wired to CSS custom properties (see globals.css and
        // src/lib/theme-colors.ts) so an admin-chosen "primary" color in
        // /admin/appearance repaints every bg-conservatory-900/950 use
        // across the site. The rest of the ramp stays fixed. The
        // rgb(... / <alpha-value>) form is required for Tailwind's opacity
        // modifiers (e.g. bg-conservatory-900/50) to keep working.
        conservatory: {
          50: "#EAF0E7",
          100: "#CBDAC3",
          200: "#A2BF95",
          300: "#78A166",
          400: "#4F7F42",
          500: "#335C2B",
          600: "#264721",
          700: "#1F3A1B",
          800: "#152813",
          900: "rgb(var(--color-primary-900, 15 46 29) / <alpha-value>)",
          950: "rgb(var(--color-primary-950, 10 26 17) / <alpha-value>)",
        },
        // Accent — weathered bronze. 300/400/500 (the shades actually used
        // across the app) are wired to the admin-chosen "accent" color the
        // same way — see the comment above.
        bronze: {
          50: "#F7EFE1",
          100: "#EEDBB8",
          200: "#DEC08A",
          300: "rgb(var(--color-accent-300, 203 163 101) / <alpha-value>)",
          400: "rgb(var(--color-accent-400, 176 141 87) / <alpha-value>)",
          500: "rgb(var(--color-accent-500, 150 120 74) / <alpha-value>)",
          600: "#7A613B",
          700: "#5E4B2E",
          800: "#433522",
          900: "#2A2115",
        },
        ink: "#14130F",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      backgroundImage: {
        "grain": "url('/images/grain.svg')",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 46, 29, 0.18)",
        "glass-lg": "0 24px 64px rgba(15, 46, 29, 0.28)",
      },
      borderRadius: {
        xs: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "line-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "line-draw": "line-draw 2.4s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
      },
      transitionTimingFunction: {
        signature: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
