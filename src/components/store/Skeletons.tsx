export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[26px] bg-white shadow-soft ring-1 ring-black/[0.04]" aria-hidden="true">
      <div className="skeleton m-2 mb-0 aspect-[5/4] !rounded-[20px] sm:aspect-square" />
      <div className="px-5 pb-5 pt-5">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton mt-2.5 h-3.5 w-1/2" />
        <div className="skeleton mt-6 h-5 w-2/5" />
        <div className="skeleton mt-3.5 h-10 w-full !rounded-full" />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div role="status" aria-label="Carregando produtos" className="mx-auto max-w-[1320px] px-5 pb-20 pt-10 md:px-8 md:pt-14">
      <div className="skeleton h-12 w-56 md:h-16 md:w-80" />
      <div className="skeleton mt-4 h-5 w-72 max-w-full" />
      <div className="no-scrollbar mt-8 flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => <div key={i} className="skeleton h-9 w-28 shrink-0 !rounded-full" />)}
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-6 w-full" />)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
