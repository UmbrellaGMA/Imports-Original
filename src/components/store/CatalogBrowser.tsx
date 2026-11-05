"use client";

import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryLabel } from "@/lib/categories";
import type { ProductCondition } from "@/lib/conditions";
import { applyFilters, filtersToSearch, readFilters, type Availability, type Filters, type SortKey } from "@/lib/filters";
import { formatPrice, parsePrice, priceToInput } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { useStore } from "./StoreProvider";

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const AVAILABILITY: Array<[Availability, string]> = [
  ["todos", "Todos"],
  ["disponiveis", "Disponíveis"],
  ["indisponiveis", "Indisponíveis"],
];

const CONDITIONS: Array<[ProductCondition | null, string]> = [
  [null, "Todos"],
  ["novo", "Novos"],
  ["seminovo", "Seminovos"],
];

const SORTS: Array<[SortKey, string]> = [
  ["relevancia", "Em destaque"],
  ["menor-preco", "Menor preço"],
  ["maior-preco", "Maior preço"],
];

/** O filtro é confirmado ao sair do campo ou ao pressionar Enter. */
function PriceField({ label, value, placeholder, onCommit }: { label: string; value: number | null; placeholder: string; onCommit: (value: number | null) => void }) {
  const [draft, setDraft] = useState(priceToInput(value));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(priceToInput(value));
  }
  return (
    <label className="block min-w-0 flex-1">
      <span className="text-xs text-ink-mute">{label}</span>
      <span className="mt-1 flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 transition-colors focus-within:border-ink">
        <span className="text-[13px] text-ink-mute">R$</span>
        <input
          inputMode="decimal"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => onCommit(parsePrice(draft))}
          onKeyDown={(event) => {
            if (event.key === "Enter") onCommit(parsePrice(draft));
          }}
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-mute/60"
        />
      </span>
    </label>
  );
}

function FilterPanel({ filters, brands, hasOffers, onChange }: { filters: Filters; brands: string[]; hasOffers: boolean; onChange: (patch: Partial<Filters>) => void }) {
  const heading = "text-[13px] font-semibold tracking-[-0.005em]";
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className={heading}>Condição</legend>
        <div className="mt-2.5 space-y-0.5">
          {CONDITIONS.map(([value, label]) => {
            const active = filters.condition === value;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ condition: value })}
                className={`flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left text-sm transition-colors ${active ? "font-medium text-ink" : "text-ink-soft hover:text-ink"}`}
              >
                <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${active ? "border-ink" : "border-[#c7c7c3]"}`}>
                  {active && <span className="size-2.5 rounded-full bg-ink" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {brands.length > 0 && (
        <fieldset>
          <legend className={heading}>Marca</legend>
          <ul className="mt-2.5 space-y-0.5">
            {brands.map((brand) => {
              const active = filters.brands.includes(brand);
              return (
                <li key={brand}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ brands: toggle(filters.brands, brand) })}
                    className={`flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left text-sm transition-colors ${active ? "font-medium text-ink" : "text-ink-soft hover:text-ink"}`}
                  >
                    <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200 ${active ? "border-ink bg-ink text-white" : "border-[#c7c7c3] bg-white"}`}>
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                    {brand}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className={heading}>Faixa de preço</legend>
        <div className="mt-2.5 flex gap-2.5">
          <PriceField label="De" value={filters.min} placeholder="Mín." onCommit={(min) => onChange({ min })} />
          <PriceField label="Até" value={filters.max} placeholder="Máx." onCommit={(max) => onChange({ max })} />
        </div>
      </fieldset>

      <fieldset>
        <legend className={heading}>Disponibilidade</legend>
        <div className="mt-2.5 space-y-0.5">
          {AVAILABILITY.map(([value, label]) => {
            const active = filters.availability === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ availability: value })}
                className={`flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left text-sm transition-colors ${active ? "font-medium text-ink" : "text-ink-soft hover:text-ink"}`}
              >
                <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${active ? "border-ink" : "border-[#c7c7c3]"}`}>
                  {active && <span className="size-2.5 rounded-full bg-ink" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {(hasOffers || filters.onlyOffers) && (
        <button
          type="button"
          role="switch"
          aria-checked={filters.onlyOffers}
          onClick={() => onChange({ onlyOffers: !filters.onlyOffers })}
          className="flex w-full items-center justify-between text-sm font-medium"
        >
          Somente ofertas
          <span className={`relative h-6 w-10 rounded-full transition-colors duration-300 ${filters.onlyOffers ? "bg-accent" : "bg-[#d9d9d5]"}`}>
            <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-soft ${filters.onlyOffers ? "translate-x-4" : ""}`} />
          </span>
        </button>
      )}
    </div>
  );
}

export function CatalogBrowser({ products }: { products: Product[] }) {
  const { categories } = useStore();
  const params = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);

  const update = (patch: Partial<Filters>) => {
    // Parte da URL atual, não do último render: a busca com atraso e os cliques
    // feitos logo em seguida não podem sobrescrever um ao outro.
    const current = readFilters(new URLSearchParams(window.location.search));
    const search = filtersToSearch({ ...current, ...patch });
    // Atualiza a URL sem recarregar: o link continua compartilhável.
    window.history.replaceState(null, "", search ? `/catalogo?${search}` : "/catalogo");
  };

  // A busca digitada é aplicada com um pequeno atraso para não interromper a digitação.
  const [draft, setDraft] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query);
    setDraft(filters.query);
  }
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onSearch = (value: string) => {
    setDraft(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSyncedQuery(value.trim());
      update({ query: value });
    }, 180);
  };

  const sheet = useRef<HTMLDialogElement>(null);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, "pt-BR")), [products]);
  const hasOffers = useMemo(() => products.some((p) => p.promoPrice !== null), [products]);
  const visible = useMemo(() => applyFilters(products, filters, (slug) => categoryLabel(categories, slug)), [products, filters, categories]);

  const chips: Array<{ key: string; label: string; clear: Partial<Filters> }> = [
    ...filters.brands.map((brand) => ({ key: `marca-${brand}`, label: brand, clear: { brands: filters.brands.filter((b) => b !== brand) } })),
    ...(filters.min !== null ? [{ key: "min", label: `A partir de ${formatPrice(filters.min)}`, clear: { min: null } }] : []),
    ...(filters.max !== null ? [{ key: "max", label: `Até ${formatPrice(filters.max)}`, clear: { max: null } }] : []),
    ...(filters.availability !== "todos" ? [{ key: "disp", label: filters.availability === "disponiveis" ? "Disponíveis" : "Indisponíveis", clear: { availability: "todos" as const } }] : []),
    ...(filters.condition ? [{ key: "condicao", label: filters.condition === "novo" ? "Novos" : "Seminovos", clear: { condition: null } }] : []),
    ...(filters.onlyOffers ? [{ key: "ofertas", label: "Ofertas", clear: { onlyOffers: false } }] : []),
  ];

  const clearAll = () => {
    clearTimeout(timer.current);
    setDraft("");
    setSyncedQuery("");
    update({ query: "", categories: [], brands: [], min: null, max: null, availability: "todos", condition: null, onlyOffers: false });
  };

  // Link antigo para uma categoria oculta ou excluída não pode exibir o código dela como título.
  const selected = filters.categories.filter((slug) => categories.some((c) => c.slug === slug));
  const heading = filters.onlyOffers && !selected.length
    ? "Ofertas."
    : selected.length
      ? `${selected.map((slug) => categoryLabel(categories, slug)).join(" e ")}.`
      : "Catálogo.";

  const pill = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.005em] transition-colors duration-200 ${active ? "bg-ink text-white" : "bg-canvas text-ink-soft hover:bg-[#ebebe8] hover:text-ink"}`;

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-[1320px] px-5 pt-10 md:px-8 md:pt-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="headline !text-[clamp(2.5rem,1.6rem+3.6vw,4.5rem)]">{heading}</h1>
          <label className="flex w-full items-center gap-2.5 rounded-full bg-canvas px-4 py-2.5 transition-shadow focus-within:shadow-[inset_0_0_0_1.5px_var(--color-ink)] md:max-w-[340px]">
            <Search size={16} strokeWidth={1.8} className="shrink-0 text-ink-mute" />
            <span className="sr-only">Pesquisar pelo nome do produto</span>
            <input
              type="search"
              value={draft}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Pesquisar pelo nome do produto"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-mute [&::-webkit-search-cancel-button]:hidden"
            />
            {draft && (
              <button type="button" aria-label="Limpar pesquisa" onClick={() => onSearch("")} className="text-ink-mute hover:text-ink">
                <X size={15} />
              </button>
            )}
          </label>
        </div>
      </div>

      {/* Categorias: fixas no topo durante a rolagem */}
      <div className="sticky top-header z-20 mt-6 border-b border-black/[0.05] bg-white/85 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-[1320px] gap-1.5 overflow-x-auto px-5 py-3 md:px-8">
          <button type="button" aria-pressed={!filters.categories.length} onClick={() => update({ categories: [] })} className={pill(!filters.categories.length)}>
            Todos
          </button>
          {categories.map((category) => {
            const active = filters.categories.includes(category.slug);
            return (
              <button key={category.slug} type="button" aria-pressed={active} onClick={() => update({ categories: toggle(filters.categories, category.slug) })} className={pill(active)}>
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-[1320px] gap-10 px-5 md:px-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-[calc(var(--spacing-header)+5.25rem)]">
            <FilterPanel filters={filters} brands={brands} hasOffers={hasOffers} onChange={update} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-[13px] text-ink-mute">
              {visible.length === 1 ? "1 produto" : `${visible.length} produtos`}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => sheet.current?.showModal()} className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[13px] font-medium lg:hidden">
                <SlidersHorizontal size={14} />
                Filtros
                {chips.length > 0 && (
                  <span className="flex size-[18px] items-center justify-center rounded-full bg-ink text-[10px] text-white">{chips.length}</span>
                )}
              </button>
              <label className="relative flex items-center rounded-full bg-canvas text-[13px] font-medium transition-colors hover:bg-[#ebebe8]">
                <span className="sr-only">Ordenar por</span>
                <select
                  value={filters.sort}
                  onChange={(event) => update({ sort: event.target.value as SortKey })}
                  className="cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-3.5 pr-8 outline-none"
                >
                  {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 text-ink-mute" />
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-3.5 flex flex-wrap items-center gap-1.5">
              {chips.map((chip) => (
                <li key={chip.key} className="fade-up">
                  <button type="button" onClick={() => update(chip.clear)} aria-label={`Remover filtro: ${chip.label}`} className="flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pl-3 pr-2 text-xs font-medium text-accent-strong transition-colors hover:bg-[#d3e6e1]">
                    {chip.label}
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="px-2 py-1 text-xs font-medium text-ink-mute underline-offset-2 hover:text-ink hover:underline">Limpar tudo</button>
              </li>
            </ul>
          )}

          {visible.length > 0 ? (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product, index) => (
                <li key={product.id} className="fade-up" style={{ "--delay": `${Math.min(index, 8) * 35}ms` } as React.CSSProperties}>
                  <ProductCard product={product} priority={index < 2} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="fade-up mt-5 rounded-[26px] bg-canvas px-6 py-20 text-center">
              {products.length === 0 ? (
                <>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">O catálogo está sendo preparado.</h2>
                  <p className="mt-2 text-[15px] text-ink-mute">Em breve, os produtos estarão aqui.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">Nenhum produto encontrado.</h2>
                  <p className="mt-2 text-[15px] text-ink-mute">Ajuste os filtros ou pesquise por outro nome.</p>
                  <button type="button" onClick={clearAll} className="btn btn-dark mt-6">Limpar filtros</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <dialog
        ref={sheet}
        aria-label="Filtros"
        className="sheet lg:hidden"
        onClick={(event) => {
          if (event.target === sheet.current) sheet.current?.close();
        }}
      >
        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">Filtros</h2>
            <button type="button" aria-label="Fechar filtros" onClick={() => sheet.current?.close()} className="flex size-9 items-center justify-center rounded-full bg-canvas">
              <X size={17} />
            </button>
          </div>
          <div className="mt-6">
            <FilterPanel filters={filters} brands={brands} hasOffers={hasOffers} onChange={update} />
          </div>
          <div className="mt-8 flex gap-2.5">
            <button type="button" onClick={clearAll} className="btn btn-outline flex-1">Limpar</button>
            <button type="button" onClick={() => sheet.current?.close()} className="btn btn-dark flex-[2]">
              Ver {visible.length} {visible.length === 1 ? "produto" : "produtos"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
