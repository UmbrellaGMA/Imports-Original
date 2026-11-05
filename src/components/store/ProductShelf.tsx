"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

/** Prateleira horizontal com rolagem por toque e setas no desktop. */
export function ProductShelf({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null);

  const move = (direction: 1 | -1) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow =
    "flex size-10 items-center justify-center rounded-full bg-black/[0.06] text-ink transition-colors hover:bg-black/[0.12]";

  return (
    <div>
      <ul
        ref={track}
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 py-5 md:scroll-px-8 md:px-8 min-[86.5rem]:scroll-px-[calc((100vw-1320px)/2+2rem)] min-[86.5rem]:px-[calc((100vw-1320px)/2+2rem)] [&>li]:w-[82vw] [&>li]:max-w-[340px] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[340px]"
      >
        {children}
      </ul>
      <div className="mx-auto hidden max-w-[1320px] justify-end gap-2.5 px-8 md:flex">
        <button type="button" onClick={() => move(-1)} aria-label="Ver produtos anteriores" className={arrow}>
          <ChevronLeft size={19} strokeWidth={1.8} />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Ver próximos produtos" className={arrow}>
          <ChevronRight size={19} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
