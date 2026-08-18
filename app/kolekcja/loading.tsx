export default function Loading() {
  return (
    <div className="bg-paper">
      {/* Header skeleton */}
      <section className="px-6 pt-28 pb-10 text-center md:px-10 md:pt-40">
        <div className="mx-auto h-3 w-40 skeleton" />
        <div className="mx-auto mt-6 h-14 w-72 skeleton md:h-20 md:w-[28rem]" />
        <div className="mx-auto mt-6 h-3 w-80 max-w-full skeleton" />
      </section>

      {/* Grid skeleton */}
      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] w-full skeleton" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="h-4 w-24 skeleton" />
                <div className="h-4 w-12 skeleton" />
              </div>
              <div className="mt-2 h-3 w-20 skeleton" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
