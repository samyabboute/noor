import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading request">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-6 h-10 w-96 max-w-full" />
      <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="mt-3 h-96 rounded-2xl" />
    </div>
  );
}
