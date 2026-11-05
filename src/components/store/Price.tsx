import { formatPrice } from "@/lib/format";

type PriceProps = {
  price: number | null;
  promoPrice: number | null;
  large?: boolean;
};

export function Price({ price, promoPrice, large = false }: PriceProps) {
  const main = large ? "text-[28px] font-semibold tracking-[-0.025em]" : "text-[17px] font-semibold tracking-[-0.015em]";
  if (price === null) {
    return <p className={large ? "text-xl font-medium tracking-[-0.015em]" : "text-[15px] font-medium text-ink-soft"}>Preço sob consulta</p>;
  }
  if (promoPrice === null) return <p className={main}>{formatPrice(price)}</p>;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={main}>{formatPrice(promoPrice)}</span>
      <s className={`text-ink-mute ${large ? "text-base" : "text-[13px]"}`}>
        <span className="sr-only">de </span>
        {formatPrice(price)}
      </s>
    </p>
  );
}
