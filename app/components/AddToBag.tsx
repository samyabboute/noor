"use client";

import { useState } from "react";
import clsx from "clsx";
import { useStore } from "../lib/store";

export default function AddToBag({
  slug,
  qty = 1,
  className,
  variant = "solid",
  openBag = true,
  label,
}: {
  slug: string;
  qty?: number;
  className?: string;
  variant?: "solid" | "ghost";
  openBag?: boolean;
  /** Overrides the idle label (e.g. a shorter word for a compact sticky bar). */
  label?: string;
}) {
  const { addToCart, setBagOpen, t } = useStore();
  const [done, setDone] = useState(false);

  return (
    <button
      onClick={() => {
        addToCart(slug, qty);
        setDone(true);
        if (openBag) setBagOpen(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className={clsx(variant === "solid" ? "btn-solid" : "btn-ghost", "w-full whitespace-nowrap", className)}
    >
      {done ? t("pdp.added") : label ?? t("pdp.add")}
    </button>
  );
}
