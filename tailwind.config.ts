import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Maison Noor signature palette — warm, luminous, editorial.
        nuit: "#16110C", // deep warm espresso-black (the shadow)
        ombre: "#241C15", // soft warm dark
        cacao: "#4A382A", // cocoa brown
        ivoire: "#F5EFE3", // warm ivory (the canvas)
        sable: "#E6D8BF", // sand beige
        champagne: "#D8C39A", // champagne
        or: "#C4A05A", // the signature "Noor" light-gold
        orclair: "#E4C784", // luminous gold (a ray of light)
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
