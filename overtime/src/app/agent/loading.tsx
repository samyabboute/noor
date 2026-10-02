import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-10 sm:px-8 sm:pt-16" role="status" aria-label="Loading your requests">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-16 w-[28rem] max-w-full" />
      <Skeleton className="mt-3 h-5 w-72 max-w-full" />
      <Skeleton className="mt-12 h-[460px] w-full rounded-[28px]" />
    </div>
  );
}
