import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shell/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-6">
      <div className="max-w-md text-center">
        <LogoMark size={36} className="mx-auto" />
        <p className="tnum mt-8 text-[5rem] font-semibold leading-none tracking-[-0.06em]">404</p>
        <h1 className="mt-4 text-xl font-semibold tracking-[-0.02em]">Nothing to cover here.</h1>
        <p className="mt-2 text-[15px] text-ink-500">This page doesn’t exist, or it moved.</p>
        <Button className="mt-8" href="/">
          Take me home
        </Button>
      </div>
    </div>
  );
}
