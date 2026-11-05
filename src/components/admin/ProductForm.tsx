"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { saveProductAction } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";
import { CONSERVATION_OPTIONS, INCLUDED_PRESETS, type Conservation, type ProductCondition } from "@/lib/conditions";
import { parsePrice, priceToInput } from "@/lib/format";
import type { Product, ProductColor, ProductSpec } from "@/lib/types";
import { ImageManager } from "./ImageManager";
import { Switch } from "./Switch";
import { addButton, Field, input, removeButton, Section } from "./ui";

/** Grupo de opções em que uma resposta é obrigatória e nenhuma vem marcada de antemão. */
function ChoiceGroup<T extends string | boolean>({ label, value, options, error, onChange }: { label: string; value: T | null; options: Array<{ value: T; label: string; hint?: string }>; error?: string; onChange: (value: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[13px] font-medium">{label}</legend>
      <div className={`mt-1.5 grid gap-2 ${options.length > 2 ? "sm:grid-cols-2" : "grid-cols-2"}`}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`rounded-xl px-3.5 py-2.5 text-left transition-shadow ${active ? "shadow-[inset_0_0_0_2px_var(--color-ink)]" : "shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_#9b9b97]"}`}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              {option.hint && <span className="mt-0.5 block text-xs text-ink-mute">{option.hint}</span>}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </fieldset>
  );
}

const CONDITION_CHOICES: Array<{ value: ProductCondition; label: string; hint: string }> = [
  { value: "novo", label: "Novo", hint: "Nunca foi usado." },
  { value: "seminovo", label: "Seminovo", hint: "Já teve uso anterior." },
];

const DAMAGE_CHOICES: Array<{ value: boolean; label: string }> = [
  { value: false, label: "Não tem avaria" },
  { value: true, label: "Tem avaria" },
];

export function ProductForm({ product, categories }: { product: Product | null; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [additionalInfo, setAdditionalInfo] = useState(product?.additionalInfo ?? "");
  const [price, setPrice] = useState(priceToInput(product?.price ?? null));
  const [promoPrice, setPromoPrice] = useState(priceToInput(product?.promoPrice ?? null));
  const [specs, setSpecs] = useState<ProductSpec[]>(product?.specs ?? []);
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [capacities, setCapacities] = useState<string[]>(product?.capacities ?? []);
  const [capacityDraft, setCapacityDraft] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [available, setAvailable] = useState(product?.available ?? true);
  // Produto novo no cadastro e produto antigo sem condição começam sem resposta: é preciso declarar.
  const [condition, setCondition] = useState<ProductCondition | null>(product?.condition ?? null);
  const [conservation, setConservation] = useState<Conservation | null>(product?.conservation ?? null);
  const [battery, setBattery] = useState(product?.batteryHealth?.toString() ?? "");
  const [sealed, setSealed] = useState(product?.sealed ?? false);
  const [hasDamage, setHasDamage] = useState<boolean | null>(product?.condition ? product.hasDamage : null);
  const [damageNotes, setDamageNotes] = useState(product?.damageNotes ?? "");
  const [repairNotes, setRepairNotes] = useState(product?.repairNotes ?? "");
  const [warranty, setWarranty] = useState(product?.warranty ?? "");
  const [included, setIncluded] = useState<string[]>(product?.included ?? []);
  const [includedDraft, setIncludedDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const addCapacity = () => {
    const value = capacityDraft.trim();
    if (value && !capacities.includes(value)) setCapacities([...capacities, value]);
    setCapacityDraft("");
  };

  const onCapacityKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addCapacity();
    }
  };

  const toggleIncluded = (item: string) =>
    setIncluded(included.includes(item) ? included.filter((i) => i !== item) : [...included, item]);

  const addIncluded = () => {
    const value = includedDraft.trim();
    if (value && !included.includes(value)) setIncluded([...included, value]);
    setIncludedDraft("");
  };

  const includedOptions = [...INCLUDED_PRESETS, ...included.filter((item) => !INCLUDED_PRESETS.includes(item))];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFields({});
    const pendingCapacity = capacityDraft.trim();
    const pendingIncluded = includedDraft.trim();
    const payload = {
      name,
      brand,
      category,
      description,
      additionalInfo,
      price: parsePrice(price),
      promoPrice: parsePrice(promoPrice),
      // Linhas deixadas em branco são ignoradas.
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      colors: colors.filter((c) => c.name.trim()),
      capacities: pendingCapacity && !capacities.includes(pendingCapacity) ? [...capacities, pendingCapacity] : capacities,
      images,
      featured,
      isNew,
      available,
      condition,
      conservation,
      batteryHealth: battery.trim() === "" ? null : Number(battery.replace(/[%\s]/g, "")),
      sealed,
      hasDamage,
      damageNotes,
      repairNotes,
      warranty,
      included: pendingIncluded && !included.includes(pendingIncluded) ? [...included, pendingIncluded] : included,
    };
    startTransition(async () => {
      const result = await saveProductAction(product?.id ?? null, payload);
      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error);
        setFields(result.fields ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <Link href="/admin" className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-mute transition-colors hover:text-ink">
        <ArrowLeft size={14} />
        Produtos
      </Link>
      <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em]">{product ? "Editar produto" : "Novo produto"}</h1>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fbeceb] px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <Section title="Informações">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nome completo" error={fields.name}>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
                </Field>
              </div>
              <Field label="Marca" error={fields.brand}>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} className={input} />
              </Field>
              <Field label="Categoria" error={fields.category}>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
                  <option value="" disabled>Selecione</option>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}{c.visible ? "" : " (oculta)"}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Descrição" error={fields.description}>
                  <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${input} resize-y`} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Informações adicionais" error={fields.additionalInfo} hint="Qualquer outro detalhe útil sobre o produto.">
                  <textarea rows={3} value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className={`${input} resize-y`} />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Condição do produto" description="Essas informações aparecem na página do produto. Campos em branco não são exibidos.">
            <div className="space-y-5">
              <ChoiceGroup label="O produto é" value={condition} options={CONDITION_CHOICES} error={fields.condition} onChange={setCondition} />

              {condition === "novo" && (
                <Switch label="Lacrado" hint="Embalagem original, ainda fechada." checked={sealed} onChange={setSealed} />
              )}

              {condition === "seminovo" && (
                <>
                  <ChoiceGroup label="Estado de conservação" value={conservation} options={CONSERVATION_OPTIONS} error={fields.conservation} onChange={setConservation} />
                  <div className="sm:max-w-[220px]">
                    <Field label="Saúde da bateria (%)" error={fields.batteryHealth} hint="Em branco se não se aplica.">
                      <input inputMode="numeric" value={battery} onChange={(e) => setBattery(e.target.value)} placeholder="Ex.: 87" className={input} />
                    </Field>
                  </div>
                </>
              )}

              {condition && (
                <>
                  <ChoiceGroup label="Avarias" value={hasDamage} options={DAMAGE_CHOICES} error={fields.hasDamage} onChange={setHasDamage} />
                  {hasDamage && (
                    <Field label="Descreva a avaria" error={fields.damageNotes} hint="Local e tipo: risco na tela, amassado na lateral, câmera com falha…">
                      <textarea rows={3} value={damageNotes} onChange={(e) => setDamageNotes(e.target.value)} className={`${input} resize-y`} />
                    </Field>
                  )}
                  {condition === "seminovo" && (
                    <Field label="Reparos e peças trocadas" error={fields.repairNotes} hint="Ex.: tela trocada, bateria nova. Em branco se não houve.">
                      <textarea rows={2} value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)} className={`${input} resize-y`} />
                    </Field>
                  )}
                  <Field label="Garantia" error={fields.warranty} hint="Ex.: 90 dias pela loja. Em branco, não aparece.">
                    <input value={warranty} onChange={(e) => setWarranty(e.target.value)} className={input} />
                  </Field>
                  <fieldset>
                    <legend className="text-[13px] font-medium">O que acompanha</legend>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {includedOptions.map((item) => {
                        const active = included.includes(item);
                        return (
                          <button key={item} type="button" aria-pressed={active} onClick={() => toggleIncluded(item)} className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? "bg-ink text-white" : "bg-canvas text-ink-soft hover:bg-[#ebebe8]"}`}>
                            {item}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={includedDraft}
                        onChange={(e) => setIncludedDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIncluded(); } }}
                        aria-label="Outro item que acompanha"
                        placeholder="Outro item"
                        className={input}
                      />
                      <button type="button" onClick={addIncluded} className="btn btn-outline shrink-0 !px-4 !py-2 !text-sm">Incluir</button>
                    </div>
                    {fields.included && <p role="alert" className="mt-1 text-xs text-danger">{fields.included}</p>}
                  </fieldset>
                </>
              )}
            </div>
          </Section>

          <Section title="Imagens">
            <ImageManager images={images} onChange={setImages} onBusyChange={setUploading} />
            {fields.images && <p role="alert" className="mt-2 text-xs text-danger">{fields.images}</p>}
          </Section>

          <Section title="Cores e capacidades" description="O cliente escolhe na página do produto, e a opção segue na mensagem do WhatsApp.">
            <p className="text-[13px] font-medium">Capacidades</p>
            {capacities.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {capacities.map((capacity) => (
                  <li key={capacity} className="flex items-center gap-1 rounded-full bg-canvas py-1 pl-3 pr-1.5 text-[13px] font-medium">
                    {capacity}
                    <button type="button" aria-label={`Remover ${capacity}`} onClick={() => setCapacities(capacities.filter((c) => c !== capacity))} className="flex size-5 items-center justify-center rounded-full text-ink-mute hover:bg-black/10 hover:text-ink">
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <input
                value={capacityDraft}
                onChange={(e) => setCapacityDraft(e.target.value)}
                onKeyDown={onCapacityKey}
                aria-label="Nova capacidade"
                placeholder="Digite e pressione Enter"
                className={input}
              />
              <button type="button" onClick={addCapacity} className="btn btn-outline shrink-0 !px-4 !py-2 !text-sm">Incluir</button>
            </div>

            <p className="mt-6 text-[13px] font-medium">Cores</p>
            <ul className="mt-2 space-y-2">
              {colors.map((color, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`Tom da cor ${index + 1}`}
                    value={color.hex}
                    onChange={(e) => setColors(colors.map((c, i) => (i === index ? { ...c, hex: e.target.value } : c)))}
                    className="size-10 shrink-0 cursor-pointer rounded-xl border border-line bg-white p-1"
                  />
                  <input
                    aria-label={`Nome da cor ${index + 1}`}
                    placeholder="Nome da cor"
                    value={color.name}
                    onChange={(e) => setColors(colors.map((c, i) => (i === index ? { ...c, name: e.target.value } : c)))}
                    className={input}
                  />
                  <button type="button" aria-label={`Remover cor ${index + 1}`} onClick={() => setColors(colors.filter((_, i) => i !== index))} className={removeButton}><X size={15} /></button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setColors([...colors, { name: "", hex: "#17171a" }])} className={addButton}><Plus size={14} />Adicionar cor</button>
            {(fields.colors || fields.capacities) && <p role="alert" className="mt-2 text-xs text-danger">{fields.colors ?? fields.capacities}</p>}
          </Section>

          <Section title="Especificações técnicas">
            <ul className="space-y-2">
              {specs.map((spec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[2fr_3fr]">
                    <input aria-label={`Item ${index + 1}`} placeholder="Item (ex.: Tela)" value={spec.label} onChange={(e) => setSpecs(specs.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)))} className={input} />
                    <input aria-label={`Valor do item ${index + 1}`} placeholder="Valor" value={spec.value} onChange={(e) => setSpecs(specs.map((s, i) => (i === index ? { ...s, value: e.target.value } : s)))} className={input} />
                  </div>
                  <button type="button" aria-label={`Remover item ${index + 1}`} onClick={() => setSpecs(specs.filter((_, i) => i !== index))} className={`${removeButton} mt-0.5`}><X size={15} /></button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className={addButton}><Plus size={14} />Adicionar especificação</button>
            {fields.specs && <p role="alert" className="mt-2 text-xs text-danger">{fields.specs}</p>}
          </Section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Section title="Preço">
            <div className="space-y-4">
              <Field label="Preço (R$)" error={fields.price} hint="Em branco, aparece “Preço sob consulta”.">
                <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className={input} />
              </Field>
              <Field label="Preço promocional (R$)" error={fields.promoPrice} hint="Preenchido, o produto recebe o selo de oferta.">
                <input inputMode="decimal" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} placeholder="0,00" className={input} />
              </Field>
            </div>
          </Section>

          <Section title="Exibição">
            <div className="space-y-4">
              <Switch label="Disponível" hint="Mostra a disponibilidade na loja." checked={available} onChange={setAvailable} />
              <Switch label="Destaque" hint="Aparece nos destaques da página inicial." checked={featured} onChange={setFeatured} />
              <Switch label="Lançamento" hint="Recebe o selo de lançamento." checked={isNew} onChange={setIsNew} />
            </div>
          </Section>

          <button type="submit" disabled={pending || uploading} className="btn btn-dark w-full">
            {uploading ? "Enviando imagens…" : pending ? "Salvando…" : product ? "Salvar alterações" : "Cadastrar produto"}
          </button>
        </div>
      </div>
    </form>
  );
}
