export default function Loading() {
  return (
    <div className="bg-paper pt-24 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery skeleton */}
        <div>
          <div className="aspect-square w-full skeleton" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square w-full skeleton" />
            ))}
          </div>
        </div>

        {/* Buy panel skeleton */}
        <div className="pb-6">
          <div className="h-3 w-24 skeleton" />
          <div className="mt-6 h-12 w-3/4 skeleton md:h-14" />
          <div className="mt-4 h-4 w-1/2 skeleton" />
          <div className="mt-7 h-10 w-40 skeleton" />
          <div className="mt-6 h-3 w-64 max-w-full skeleton" />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="h-12 w-full skeleton sm:w-36" />
            <div className="h-12 flex-1 skeleton" />
          </div>
          <div className="mt-10 space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-ink/10 py-5">
                <div className="h-3 w-40 skeleton" />
                <div className="h-3 w-3 skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
