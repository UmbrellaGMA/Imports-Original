import { CONDITION_LABELS } from "@/lib/conditions";
import type { Product } from "@/lib/types";

/** Selos em texto. A avaria aparece já na vitrine, para ninguém ser surpreendido depois. */
export function ProductBadge({ product, className = "" }: { product: Pick<Product, "isNew" | "promoPrice" | "condition" | "hasDamage">; className?: string }) {
  return (
    <p className={`flex min-h-[18px] flex-wrap gap-x-2.5 text-xs font-semibold tracking-[-0.005em] ${className}`}>
      {product.condition && <span className="text-ink-soft">{CONDITION_LABELS[product.condition]}</span>}
      {product.isNew && <span className="text-accent">Lançamento</span>}
      {product.promoPrice !== null && <span className="text-offer">Oferta</span>}
      {product.hasDamage && <span className="text-danger">Com avaria</span>}
    </p>
  );
}
