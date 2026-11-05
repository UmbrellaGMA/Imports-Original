import { CONDITION_LABELS, type ProductCondition } from "./conditions.ts";
import { effectivePrice, normalizeText, parsePrice } from "./format.ts";
import type { Product } from "./types.ts";

export type SortKey = "relevancia" | "menor-preco" | "maior-preco";
export type Availability = "todos" | "disponiveis" | "indisponiveis";

export type Filters = {
  query: string;
  categories: string[];
  brands: string[];
  min: number | null;
  max: number | null;
  availability: Availability;
  condition: ProductCondition | null;
  onlyOffers: boolean;
  sort: SortKey;
};

type ParamReader = { get(name: string): string | null };

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);

export function readFilters(params: ParamReader): Filters {
  const sort = params.get("ordem");
  const availability = params.get("disponibilidade");
  const condition = params.get("condicao");
  return {
    query: params.get("q") ?? "",
    categories: list(params.get("categoria")),
    brands: list(params.get("marca")),
    min: parsePrice(params.get("min") ?? ""),
    max: parsePrice(params.get("max") ?? ""),
    availability:
      availability === "disponiveis" || availability === "indisponiveis" ? availability : "todos",
    condition: condition === "novo" || condition === "seminovo" ? condition : null,
    onlyOffers: params.get("ofertas") === "1",
    sort: sort === "menor-preco" || sort === "maior-preco" ? sort : "relevancia",
  };
}

export function filtersToSearch(f: Filters): string {
  const params = new URLSearchParams();
  if (f.query.trim()) params.set("q", f.query.trim());
  if (f.categories.length) params.set("categoria", f.categories.join(","));
  if (f.brands.length) params.set("marca", f.brands.join(","));
  if (f.min !== null) params.set("min", String(f.min));
  if (f.max !== null) params.set("max", String(f.max));
  if (f.availability !== "todos") params.set("disponibilidade", f.availability);
  if (f.condition) params.set("condicao", f.condition);
  if (f.onlyOffers) params.set("ofertas", "1");
  if (f.sort !== "relevancia") params.set("ordem", f.sort);
  // Mantém as vírgulas legíveis na URL.
  return params.toString().replace(/%2C/g, ",");
}

export function applyFilters(
  products: Product[],
  f: Filters,
  categoryLabel: (slug: string) => string = (s) => s,
): Product[] {
  const terms = normalizeText(f.query).split(/\s+/).filter(Boolean);
  const [low, high] =
    f.min !== null && f.max !== null && f.min > f.max ? [f.max, f.min] : [f.min, f.max];

  const result = products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.availability === "disponiveis" && !p.available) return false;
    if (f.availability === "indisponiveis" && p.available) return false;
    if (f.condition && p.condition !== f.condition) return false;
    if (f.onlyOffers && p.promoPrice === null) return false;
    if (low !== null || high !== null) {
      // Produto sem preço cadastrado não pode ser afirmado dentro de uma faixa.
      const price = effectivePrice(p);
      if (price === null) return false;
      if (low !== null && price < low) return false;
      if (high !== null && price > high) return false;
    }
    if (terms.length) {
      const condition = p.condition ? CONDITION_LABELS[p.condition] : "";
      const haystack = normalizeText(`${p.name} ${p.brand} ${categoryLabel(p.category)} ${condition}`);
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  if (f.sort === "relevancia") return result;

  // Produtos sem preço ficam sempre no fim, nas duas ordenações.
  const direction = f.sort === "menor-preco" ? 1 : -1;
  return [...result].sort((a, b) => {
    const pa = effectivePrice(a);
    const pb = effectivePrice(b);
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return (pa - pb) * direction;
  });
}
