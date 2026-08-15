import clsx from "clsx";

/**
 * Real product photography, background removed (transparent PNG/WebP).
 * The subject floats on whatever surface it sits on, with a soft drop shadow
 * for a premium, weightless feel. No card, no blend — works on dark or light.
 */
export default function Photo({
  src,
  alt,
  className,
  imgClassName,
  fit = "contain",
  glow = true,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fit?: "contain" | "cover";
  glow?: boolean;
}) {
  return (
    <div className={clsx("relative flex items-center justify-center", className)}>
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(closest-side, rgba(228,206,154,0.16), transparent 72%)",
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={clsx(
          "relative h-full w-full",
          fit === "cover" ? "object-cover" : "object-contain",
          imgClassName,
        )}
        style={{ filter: "drop-shadow(0 26px 40px rgba(0,0,0,0.55))" }}
      />
    </div>
  );
}
