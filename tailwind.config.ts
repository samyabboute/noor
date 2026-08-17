import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Maison Noor — "Vert & Or" (Bateel-inspired): deep emerald + warm gold + cream.
        nuit: "#0A1F18", // deep emerald-black (the dominant canvas)
        ombre: "#103128", // emerald surface (alternate)
        cacao: "#1A4636", // mid emerald (panels / hover)
        ivoire: "#F4EEE0", // warm cream (light accent, text on dark)
        sable: "#E4D9C2", // pale sand (rare light accent)
        champagne: "#E3D2A8", // champagne
        or: "#C2A25A", // signature warm gold
        orclair: "#D8BE7E", // luminous gold (a ray of light)
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Aref Ruqaa", "Amiri", "serif"],
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
