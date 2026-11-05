"use client";

import Link from "next/link";
import { categoryArt } from "@/lib/categories";
import { CONDITION_LABELS } from "@/lib/conditions";
import { productMessage, whatsappUrl } from "@/lib/site";
import type { Product } from "@/lib/types";
import { Price } from "./Price";
import { ProductBadge } from "./ProductBadge";
import { ProductImage } from "./ProductImage";
import { useStore } from "./StoreProvider";
import { useProductUrl } from "./useProductUrl";
import { WhatsAppIcon } from "./WhatsAppIcon";

const CARD_SIZES = "(max-width: 640px) 90vw, (max-width: 1200px) 45vw, 380px";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { categories, contact } = useStore();
  const url = useProductUrl(product.slug);
  const [cover, alternate] = product.images;
  // Fotos preenchem o espaço, cortando as sobras. Ilustrações são recortes e ficam inteiras.
  const isPhoto = (src: string | undefined) => Boolean(src) && !src?.endsWith(".svg");
  const fit = (src: string | undefined) => (isPhoto(src) ? "!object-cover" : "");
  const href = `/produto/${product.slug}`;
  return (
    <article className="group relative flex h-full flex-col rounded-[26px] bg-white shadow-soft ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-500 ease-soft hover:-translate-y-1 hover:shadow-lift">
      <div className="relative m-2 mb-0 aspect-[5/4] overflow-hidden rounded-[20px] bg-canvas sm:aspect-square">
        <div className={`absolute ${isPhoto(cover) ? "inset-0" : "inset-[5%]"} transition-transform duration-700 ease-soft group-hover:scale-[1.04] ${product.available ? "" : "opacity-55 grayscale-[35%]"}`}>
          <ProductImage
            src={cover ?? categoryArt(categories, product.category)}
            alt={product.name}
            sizes={CARD_SIZES}
            priority={priority}
            className={`${fit(cover)} ${alternate ? "transition-opacity duration-500 group-hover:opacity-0" : ""}`}
          />
          {alternate && (
            <ProductImage
              src={alternate}
              alt=""
              sizes={CARD_SIZES}
              className={`${fit(alternate)} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />
          )}
        </div>
        {!product.available && (
          <span className="absolute right-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
            Esgotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <ProductBadge product={product} className="mb-1" />
        <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.02em]">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[26px] after:content-['']">
            {product.name}
          </Link>
        </h3>
        {product.capacities.length > 0 && (
          <p className="mt-1 text-[13px] text-ink-mute">{product.capacities.join(" · ")}</p>
        )}
        {product.colors.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label={`Cores: ${product.colors.map((c) => c.name).join(", ")}`}>
            {product.colors.slice(0, 8).map((color) => (
              <li
                key={color.name}
                title={color.name}
                className="size-3 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </ul>
        )}
        <div className="mt-auto pt-4">
          <Price price={product.price} promoPrice={product.promoPrice} />
          <a
            href={whatsappUrl(contact.whatsapp, productMessage(product.name, { url, soldOut: !product.available, condition: product.condition ? CONDITION_LABELS[product.condition] : undefined }))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline relative z-10 mt-3.5 w-full !py-2.5 !text-[13.5px] hover:!border-accent hover:!bg-accent hover:!text-white"
          >
            <WhatsAppIcon size={15} />
            {product.available ? "Consultar disponibilidade" : "Avisar quando chegar"}
          </a>
        </div>
      </div>
    </article>
  );
}
