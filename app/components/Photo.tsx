import clsx from "clsx";

/**
 * Real product photography on a white studio background.
 * `blend` uses mix-blend-multiply so the white cutout melts into an ivory
 * ground seamlessly (white × ivoire = ivoire) — no visible photo rectangle.
 * Only use `blend` on a light (ivoire/sable) surface, never on a dark one.
 * If the file is missing the container simply shows its warm background,
 * so the layout degrades gracefully until the images are added to /public.
 */
export default function Photo({
  src,
  alt,
  className,
  imgClassName,
  blend = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  blend?: boolean;
}) {
  return (
    <div className={clsx("overflow-hidden bg-ivoire", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={clsx("h-full w-full object-cover", blend && "mix-blend-multiply", imgClassName)}
      />
    </div>
  );
}
