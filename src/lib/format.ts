const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatPrice = (value: number) => brl.format(value);

/** Aceita "1.299,90", "1299,9", "1299.90" e "R$ 1.299". Retorna null se vazio ou inválido. */
export function parsePrice(raw: string): number | null {
  const text = raw.replace(/[^\d.,]/g, "");
  if (!text) return null;
  let normalized: string;
  if (text.includes(",")) {
    normalized = text.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+\.\d{1,2}$/.test(text)) {
    normalized = text;
  } else {
    normalized = text.replace(/\./g, "");
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

/** Valor para campos de edição: 1299.9 → "1299,90". */
export const priceToInput = (value: number | null) =>
  value === null ? "" : value.toFixed(2).replace(".", ",");

export const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const slugify = (text: string) =>
  normalizeText(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "produto";

/** Preço efetivamente cobrado: o promocional, quando existir. */
export const effectivePrice = (p: { price: number | null; promoPrice: number | null }) =>
  p.promoPrice ?? p.price;
