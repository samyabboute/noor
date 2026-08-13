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
}: {
  slug: string;
  qty?: number;
  className?: string;
  variant?: "solid" | "ghost";
  openBag?: boolean;
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
      className={clsx(variant === "solid" ? "btn-solid" : "btn-ghost", "w-full", className)}
    >
      {done ? t("pdp.added") : t("pdp.add")}
    </button>
  );
}
