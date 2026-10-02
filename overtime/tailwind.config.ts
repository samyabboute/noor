import type { Config } from "tailwindcss";

/**
 * Overtime design tokens.
 * Ink-on-paper: a near-black navy carries the hierarchy; colour is reserved
 * for meaning (signal red = the one action that matters, green = covered,
 * amber = waiting). Everything else is a disciplined grey ramp.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1020",
          900: "#0B1020",
          800: "#161C2E",
          700: "#262D42",
          600: "#3B4358",
          500: "#5A6275",
          400: "#838A9A",
          300: "#B3B8C3",
          200: "#D9DCE2",
          150: "#E6E8EC",
          100: "#EEF0F3",
          50: "#F6F7F9",
        },
        paper: "#FBFBFA",
        signal: {
          DEFAULT: "#E3122B",
          600: "#C40E24",
          50: "#FDECEE",
          100: "#FAD3D8",
        },
        covered: {
          DEFAULT: "#0E8A5F",
          600: "#0A7350",
          50: "#E8F5EF",
          100: "#C9EBDC",
        },
        waiting: {
          DEFAULT: "#B7791F",
          50: "#FBF4E6",
          100: "#F5E3BD",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7.5vw, 6.5rem)", { lineHeight: "0.92", letterSpacing: "-0.045em" }],
        "display-lg": ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-md": ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "display-sm": ["clamp(1.5rem, 2.4vw, 2rem)", { lineHeight: "1.08", letterSpacing: "-0.03em" }],
      },
      letterSpacing: { eyebrow: "0.14em" },
      borderRadius: { xl: "0.875rem", "2xl": "1.125rem", "3xl": "1.5rem" },
      boxShadow: {
        card: "0 1px 0 rgba(11,16,32,0.04), 0 1px 2px rgba(11,16,32,0.04)",
        lift: "0 1px 0 rgba(11,16,32,0.04), 0 12px 32px -12px rgba(11,16,32,0.18)",
        float: "0 24px 64px -24px rgba(11,16,32,0.35), 0 2px 6px rgba(11,16,32,0.06)",
        ring: "0 0 0 1px rgba(11,16,32,0.08)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        snap: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        pulseDot: {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "80%,100%": { transform: "scale(2.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 1.8s cubic-bezier(0.22,1,0.36,1) infinite",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
