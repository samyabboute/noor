import { products } from "../lib/products";

/**
 * Bespoke, generated product imagery — deliberately NOT stock photography.
 * A luminous "case of dates" rendered in SVG so every product ships a unique,
 * on-brand still. Weightless (a few KB), sharp on any screen, tinted per product
 * by its `accent` (the "light" colour of that signature).
 */
export default function ProductVisual({
  slug,
  accent,
  className,
  variant = "case",
}: {
  slug?: string;
  accent?: string;
  className?: string;
  variant?: "case" | "macro";
}) {
  const tone = accent ?? products.find((p) => p.slug === slug)?.accent ?? "#C4A05A";
  const id = (slug ?? "n") + variant;

  if (variant === "macro") {
    return (
      <svg viewBox="0 0 600 600" className={className} role="img" aria-label="Maison Noor — macro">
        <defs>
          <radialGradient id={`bg-${id}`} cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor="#241C15" />
            <stop offset="100%" stopColor="#100C08" />
          </radialGradient>
          <radialGradient id={`fruit-${id}`} cx="42%" cy="34%" r="80%">
            <stop offset="0%" stopColor={tone} />
            <stop offset="45%" stopColor="#7A5A34" />
            <stop offset="100%" stopColor="#3A2818" />
          </radialGradient>
          <linearGradient id={`ray-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="600" height="600" fill={`url(#bg-${id})`} />
        {/* the ray of light */}
        <polygon points="0,0 260,0 130,600 0,600" fill={`url(#ray-${id})`} opacity="0.14" />
        {/* the fruit, in macro */}
        <ellipse cx="300" cy="315" rx="150" ry="205" fill={`url(#fruit-${id})`} />
        <ellipse cx="255" cy="230" rx="52" ry="80" fill="#ffffff" opacity="0.18" />
        {/* wrinkle detail */}
        {[...Array(7)].map((_, i) => (
          <path
            key={i}
            d={`M ${230 + i * 14} 150 Q ${300 + (i - 3) * 8} 315 ${232 + i * 13} 500`}
            stroke="#00000030"
            strokeWidth="1.5"
            fill="none"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 600 600" className={className} role="img" aria-label="Maison Noor — case">
      <defs>
        <radialGradient id={`bg2-${id}`} cx="50%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#2A2018" />
          <stop offset="100%" stopColor="#120D09" />
        </radialGradient>
        <linearGradient id={`lid-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#211913" />
          <stop offset="100%" stopColor="#181109" />
        </linearGradient>
        <linearGradient id={`inner-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5EFE3" />
          <stop offset="100%" stopColor="#E6D8BF" />
        </linearGradient>
        <radialGradient id={`date-${id}`} cx="40%" cy="32%" r="80%">
          <stop offset="0%" stopColor={tone} />
          <stop offset="55%" stopColor="#7A5A34" />
          <stop offset="100%" stopColor="#3A2818" />
        </radialGradient>
        <linearGradient id={`sweep-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="600" height="600" fill={`url(#bg2-${id})`} />

      {/* soft light pool behind the case */}
      <ellipse cx="300" cy="330" rx="240" ry="120" fill={tone} opacity="0.10" />

      {/* the open case, seen in gentle perspective */}
      <g>
        {/* lid, tilted back */}
        <polygon points="150,150 450,150 470,110 130,110" fill={`url(#lid-${id})`} />
        {/* embossed mark on the lid */}
        <circle cx="300" cy="128" r="9" fill="none" stroke={tone} strokeWidth="1.4" opacity="0.7" />
        <line x1="300" y1="123" x2="300" y2="133" stroke={tone} strokeWidth="1.4" opacity="0.7" />

        {/* inner tray */}
        <polygon points="150,150 450,150 470,470 130,470" fill={`url(#inner-${id})`} />
        {/* tray inset shadow */}
        <polygon points="168,168 432,168 448,452 152,452" fill="#00000010" />

        {/* the dates, arranged in a grid */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const cx = 200 + col * 67;
            const cy = 210 + row * 82;
            return (
              <g key={`${row}-${col}`}>
                <ellipse cx={cx} cy={cy + 6} rx="26" ry="15" fill="#00000018" />
                <ellipse cx={cx} cy={cy} rx="27" ry="34" fill={`url(#date-${id})`} />
                <ellipse cx={cx - 7} cy={cy - 11} rx="8" ry="13" fill="#ffffff" opacity="0.22" />
              </g>
            );
          }),
        )}
      </g>

      {/* the signature ray sweeping across the case */}
      <rect x="0" y="0" width="220" height="600" fill={`url(#sweep-${id})`} opacity="0.5" transform="skewX(-12)" />
    </svg>
  );
}
