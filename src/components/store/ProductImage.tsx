import Image from "next/image";
import type { CSSProperties } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function ProductImage({ src, alt, sizes, priority, className = "", style }: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // Vetores já são leves e não passam pelo otimizador.
      unoptimized={src.endsWith(".svg")}
      className={`object-contain ${className}`}
      style={style}
    />
  );
}
