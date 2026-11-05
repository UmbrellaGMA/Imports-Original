import type { Conservation, ProductCondition } from "./conditions.ts";
import type { CoverAdjust } from "./cover.ts";

export type ProductColor = { name: string; hex: string };
export type ProductSpec = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  additionalInfo: string;
  price: number | null;
  promoPrice: number | null;
  specs: ProductSpec[];
  colors: ProductColor[];
  capacities: string[];
  images: string[];
  coverAdjust: CoverAdjust;
  featured: boolean;
  isNew: boolean;
  available: boolean;
  visible: boolean;
  /** Vazia em produto antigo: o site não afirma a condição até ela ser informada. */
  condition: ProductCondition | null;
  conservation: Conservation | null;
  batteryHealth: number | null;
  sealed: boolean;
  hasDamage: boolean;
  damageNotes: string;
  repairNotes: string;
  warranty: string;
  included: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Campos editáveis pelo painel. */
export type ProductInput = Omit<Product, "id" | "slug" | "sortOrder" | "createdAt" | "updatedAt">;
/** O formulário envia `null` enquanto a pergunta sobre avarias não foi respondida. */
export type ProductDraft = Omit<ProductInput, "hasDamage"> & { hasDamage: boolean | null };
export type ProductFlag = "featured" | "isNew" | "available" | "visible";
