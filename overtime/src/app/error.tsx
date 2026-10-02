"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shell/logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="max-w-md text-center">
        <LogoMark size={36} className="mx-auto" />
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">This view didn’t load.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">Nothing you saved was lost — requests and answers are stored safely. Try again, and if it keeps happening, let Monitoring know.</p>
        <Button className="mt-8" onClick={reset} icon={<RotateCcw size={15} />}>
          Try again
        </Button>
        {error.digest && <p className="mt-6 font-mono text-[11px] text-ink-300">Ref {error.digest}</p>}
      </div>
    </div>
  );
}
