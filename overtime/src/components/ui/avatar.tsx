import { cn } from "@/lib/cn";

const palette = ["#E9EBF0", "#E6ECEB", "#ECE8E4", "#E8E6EE", "#EEEAE3", "#E4E9EF"];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, size = 32, className, ring }: { name: string; size?: number; className?: string; ring?: "covered" | "signal" | "white" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 select-none place-items-center rounded-full font-medium text-ink-700",
        ring === "covered" && "ring-2 ring-covered ring-offset-2 ring-offset-white",
        ring === "signal" && "ring-2 ring-signal ring-offset-2 ring-offset-white",
        ring === "white" && "ring-2 ring-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36), background: palette[hash(name) % palette.length] }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 5, size = 28 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} ring="white" />
      ))}
      {rest > 0 && (
        <span className="inline-grid place-items-center rounded-full bg-ink-900 text-[11px] font-medium text-white ring-2 ring-white" style={{ width: size, height: size }}>
          +{rest}
        </span>
      )}
    </div>
  );
}
