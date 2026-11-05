export type Category = { slug: string; label: string; image: string | null; visible: boolean };

/** Usadas até o banco responder e no modo demonstração. O painel é quem manda depois disso. */
export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "iphones", label: "iPhones", image: "/art/phone-back-natural.svg", visible: true },
  { slug: "smartphones", label: "Smartphones", image: "/art/android-back-sage.svg", visible: true },
  { slug: "macbooks", label: "MacBooks", image: "/art/laptop.svg", visible: true },
  { slug: "ipads", label: "iPads", image: "/art/tablet.svg", visible: true },
  { slug: "apple-watch", label: "Apple Watch", image: "/art/watch.svg", visible: true },
  { slug: "airpods", label: "AirPods", image: "/art/earbuds.svg", visible: true },
  { slug: "fones", label: "Fones de ouvido", image: "/art/headphones.svg", visible: true },
  { slug: "acessorios", label: "Acessórios", image: "/art/charger.svg", visible: true },
  { slug: "outros", label: "Outros eletrônicos", image: "/art/speaker.svg", visible: true },
];

const FALLBACK_ART = "/art/speaker.svg";

export const categoryLabel = (categories: Category[], slug: string) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

export const categoryArt = (categories: Category[], slug: string) =>
  categories.find((c) => c.slug === slug)?.image ?? FALLBACK_ART;

export const catalogHref = (...slugs: string[]) =>
  `/catalogo?categoria=${slugs.join(",")}`;

/** Link que só leva a categorias ocultas abriria uma página vazia, então deve sair do site. */
export function pointsOnlyToHidden(href: string, hidden: string[]) {
  const match = /[?&]categoria=([^&#]+)/.exec(href);
  if (!match) return false;
  return decodeURIComponent(match[1]).split(",").every((slug) => hidden.includes(slug));
}
