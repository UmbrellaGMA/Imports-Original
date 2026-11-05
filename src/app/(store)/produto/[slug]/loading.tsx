export default function Loading() {
  return (
    <div role="status" aria-label="Carregando produto" className="mx-auto max-w-[1320px] px-5 pb-20 pt-5 md:px-8">
      <div className="skeleton h-3.5 w-52" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
        <div className="skeleton aspect-square !rounded-[28px]" />
        <div>
          <div className="skeleton h-11 w-4/5" />
          <div className="skeleton mt-4 h-8 w-2/5" />
          <div className="skeleton mt-8 h-20 w-full !rounded-2xl" />
          <div className="skeleton mt-8 h-12 w-full !rounded-full" />
        </div>
      </div>
    </div>
  );
}
