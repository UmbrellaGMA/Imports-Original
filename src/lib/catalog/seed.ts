import "server-only";
import { slugify } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Vitrine do modo demonstração. Existe só para visualizar o layout antes de o
 * catálogo real ser cadastrado; nunca é enviada ao Supabase.
 * Propositalmente sem preços, especificações, cores ou capacidades.
 */
const EXAMPLES: Array<[name: string, brand: string, category: string, images: string[], flags?: { featured?: boolean; isNew?: boolean }]> = [
  ["iPhone Pro", "Apple", "iphones", ["/art/phone-back-natural.svg", "/art/phone-front-aurora.svg"], { featured: true, isNew: true }],
  ["iPhone", "Apple", "iphones", ["/art/phone-back-ocean.svg", "/art/phone-front-tide.svg"], { featured: true }],
  ["iPhone Plus", "Apple", "iphones", ["/art/phone-back-pearl.svg", "/art/phone-front-dawn.svg"]],
  ["Galaxy Ultra", "Samsung", "smartphones", ["/art/android-back-graphite.svg", "/art/android-front.svg"], { featured: true }],
  ["Xiaomi Series", "Xiaomi", "smartphones", ["/art/android-back-sage.svg", "/art/android-front.svg"]],
  ["MacBook Air", "Apple", "macbooks", ["/art/laptop.svg"], { featured: true, isNew: true }],
  ["MacBook Pro", "Apple", "macbooks", ["/art/laptop.svg"]],
  ["iPad Pro", "Apple", "ipads", ["/art/tablet.svg"], { featured: true }],
  ["iPad Air", "Apple", "ipads", ["/art/tablet.svg"]],
  ["Apple Watch Series", "Apple", "apple-watch", ["/art/watch.svg", "/art/watch-dark.svg"], { featured: true }],
  ["Apple Watch Ultra", "Apple", "apple-watch", ["/art/watch-dark.svg", "/art/watch.svg"]],
  ["AirPods Pro", "Apple", "airpods", ["/art/earbuds.svg"], { featured: true }],
  ["Fone over-ear", "Sony", "fones", ["/art/headphones.svg", "/art/headphones-pearl.svg"]],
  ["Carregador USB-C", "Apple", "acessorios", ["/art/charger.svg"]],
  ["Capa para iPhone", "Apple", "acessorios", ["/art/case-sage.svg", "/art/case-copper.svg"]],
  ["Caixa de som Bluetooth", "JBL", "outros", ["/art/speaker.svg"]],
];

export function buildSeed(): Product[] {
  const now = new Date().toISOString();
  return EXAMPLES.map(([name, brand, category, images, flags], index) => ({
    id: `demo-${index + 1}`,
    slug: slugify(name),
    name,
    brand,
    category,
    description:
      "Produto de exemplo do modo demonstração. Descrição, preço, especificações e disponibilidade são definidos no painel administrativo.",
    additionalInfo: "",
    price: null,
    promoPrice: null,
    specs: [],
    colors: [],
    capacities: [],
    images,
    featured: flags?.featured ?? false,
    isNew: flags?.isNew ?? false,
    available: true,
    condition: null,
    conservation: null,
    batteryHealth: null,
    sealed: false,
    hasDamage: false,
    damageNotes: "",
    repairNotes: "",
    warranty: "",
    included: [],
    sortOrder: index + 1,
    createdAt: now,
    updatedAt: now,
  }));
}
