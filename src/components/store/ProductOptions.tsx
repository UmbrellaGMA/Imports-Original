"use client";

import { useState } from "react";
import { CONDITION_LABELS, conservationLabel } from "@/lib/conditions";
import { productMessage, whatsappUrl } from "@/lib/site";
import type { Product } from "@/lib/types";
import { Price } from "./Price";
import { ProductBadge } from "./ProductBadge";
import { useStore } from "./StoreProvider";
import { useProductUrl } from "./useProductUrl";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Tudo o que foi declarado sobre o estado do aparelho. Campo não informado não aparece. */
function ConditionDetails({ product }: { product: Product }) {
  const { condition } = product;
  if (!condition) return null;
  const rows: Array<[string, string]> = [["Condição", CONDITION_LABELS[condition]]];
  if (product.sealed) rows.push(["Embalagem", "Lacrado"]);
  if (product.conservation) rows.push(["Conservação", conservationLabel(product.conservation)]);
  if (product.batteryHealth !== null) rows.push(["Saúde da bateria", `${product.batteryHealth}%`]);
  if (condition === "seminovo" && !product.hasDamage) rows.push(["Avarias", "Nenhuma"]);
  if (product.repairNotes) rows.push(["Reparos e trocas", product.repairNotes]);
  if (product.warranty) rows.push(["Garantia", product.warranty]);
  if (product.included.length) rows.push(["Acompanha", product.included.join(", ")]);
  return (
    <section aria-label="Condição do produto" className="mt-6 rounded-2xl bg-canvas p-4">
      {product.hasDamage && (
        <div className="mb-3 rounded-xl bg-[#fbeceb] px-3.5 py-2.5">
          <p className="text-[13px] font-semibold text-danger">Este produto tem avaria</p>
          <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">{product.damageNotes}</p>
        </div>
      )}
      <dl className="space-y-2 text-[13.5px]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
            <dt className="text-ink-mute">{label}</dt>
            <dd className="whitespace-pre-line font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductOptions({ product }: { product: Product }) {
  const { contact } = useStore();
  const [color, setColor] = useState(product.colors[0]?.name);
  const [capacity, setCapacity] = useState(product.capacities[0]);
  const conditionText = product.condition ? CONDITION_LABELS[product.condition] : undefined;
  const url = useProductUrl(product.slug);
  const link = whatsappUrl(contact.whatsapp, productMessage(product.name, { color, capacity, url, condition: conditionText }));

  return (
    <div>
      <ProductBadge product={product} className="mb-1.5 !text-[13px]" />
      <h1 className="text-[clamp(2rem,1.6rem+1.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em]">{product.name}</h1>
      <p className="mt-1.5 text-[15px] text-ink-mute">{product.brand}</p>

      <div className="mt-5"><Price price={product.price} promoPrice={product.promoPrice} large /></div>

      <p className="mt-3 flex items-center gap-2 text-sm font-medium">
        <span className={`size-2 rounded-full ${product.available ? "bg-[#1f9d74]" : "bg-[#b4b4b0]"}`} />
        {product.available ? "Disponível" : "Indisponível no momento"}
      </p>

      <ConditionDetails product={product} />

      {product.capacities.length > 0 && (
        <fieldset className="mt-8">
          <legend className="text-sm font-semibold">Capacidade</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.capacities.map((option) => {
              const active = option === capacity;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCapacity(option)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-shadow duration-200 ${active ? "shadow-[inset_0_0_0_2px_var(--color-ink)]" : "shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_#9b9b97]"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {product.colors.length > 0 && (
        <fieldset className="mt-7">
          <legend className="text-sm"><span className="font-semibold">Cor</span> <span className="text-ink-mute">· {color}</span></legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.colors.map((option) => {
              const active = option.name === color;
              return (
                <button
                  key={option.name}
                  type="button"
                  aria-pressed={active}
                  aria-label={option.name}
                  title={option.name}
                  onClick={() => setColor(option.name)}
                  className={`flex size-10 items-center justify-center rounded-full transition-shadow duration-200 ${active ? "shadow-[0_0_0_2px_var(--color-ink)]" : "hover:shadow-[0_0_0_1px_#9b9b97]"}`}
                >
                  <span className="size-[30px] rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]" style={{ backgroundColor: option.hex }} />
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-accent mt-8 w-full !py-4 !text-[17px]">
        <WhatsAppIcon size={20} />
        Consultar pelo WhatsApp
      </a>
      <p className="mt-3 text-center text-[13px] text-ink-mute">A conversa já abre com o produto escolhido.</p>

      {/* Atalho fixo no celular para manter o contato sempre ao alcance */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-black/[0.06] bg-white/85 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-accent shrink-0 !px-4 !py-2.5 !text-sm">
          <WhatsAppIcon size={16} />
          Consultar
        </a>
      </div>
    </div>
  );
}
