"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const many = images.length > 1;

  const goTo = (index: number) => {
    const next = (index + images.length) % images.length;
    setActive(next);
    const element = track.current;
    if (element) element.scrollTo({ left: element.clientWidth * next, behavior: "smooth" });
  };

  const onScroll = () => {
    const element = track.current;
    if (!element || !element.clientWidth) return;
    const position = Math.round(element.scrollLeft / element.clientWidth);
    if (position !== active) setActive(position);
  };

  return (
    <div>
      <div className="group relative overflow-hidden rounded-[28px] bg-canvas">
        <div
          ref={track}
          onScroll={onScroll}
          tabIndex={0}
          role="group"
          aria-label={`Imagens de ${name}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") goTo(active + 1);
            if (event.key === "ArrowLeft") goTo(active - 1);
          }}
          className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto outline-none md:aspect-[6/5]"
        >
          {images.map((src, index) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <div className="absolute inset-[8%]">
                <ProductImage
                  src={src}
                  alt={index === 0 ? name : `${name}, imagem ${index + 1}`}
                  sizes="(max-width: 1024px) 92vw, 720px"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
        {many && (
          <>
            <button type="button" aria-label="Imagem anterior" onClick={() => goTo(active - 1)} className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 shadow-soft backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 md:flex">
              <ChevronLeft size={19} />
            </button>
            <button type="button" aria-label="Próxima imagem" onClick={() => goTo(active + 1)} className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 shadow-soft backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 md:flex">
              <ChevronRight size={19} />
            </button>
          </>
        )}
      </div>

      {many && (
        <ul className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto p-0.5">
          {images.map((src, index) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                aria-label={`Ver imagem ${index + 1}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                className={`relative block size-[72px] overflow-hidden rounded-2xl bg-canvas transition-shadow duration-200 md:size-20 ${index === active ? "shadow-[0_0_0_2px_var(--color-ink)]" : "hover:shadow-[0_0_0_1px_#b9b9b5]"}`}
              >
                <span className="absolute inset-[12%] block">
                  <ProductImage src={src} alt="" sizes="80px" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
