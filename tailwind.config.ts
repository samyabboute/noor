import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Maison Noor — "Nuit & Champagne": dark, cinematic, couture.
        nuit: "#0C0A08", // deep near-black (the dominant canvas)
        ombre: "#17130E", // soft warm dark (alternate dark surface)
        cacao: "#2E241B", // warm dark panel / hover
        ivoire: "#F3EDE1", // ivory (light accent, text on dark)
        sable: "#E7DCC8", // pale sand (rare light accent)
        champagne: "#E7D8B5", // champagne
        or: "#CBAE74", // signature cool gold
        orclair: "#E4CE9A", // luminous champagne-gold (a ray of light)
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.28em",
        wide2: "0.18em",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "light-sweep": {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "40%": { opacity: "0.9" },
          "100%": { transform: "translateX(220%) skewX(-12deg)", opacity: "0" },
        },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(-2%, 1%)" },
        },
      },
      animation: {
        "light-sweep": "light-sweep 5.5s var(--tw-ease, cubic-bezier(0.16,1,0.3,1)) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
