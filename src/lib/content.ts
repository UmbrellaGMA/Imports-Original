import { catalogHref } from "./categories.ts";

/** Tudo o que o painel edita além de produtos e categorias. */
export type NavLink = { label: string; href: string };
export type ImageMode = "contain" | "cover";
export type ArtKey = "devices" | "iphones" | "rhythm";

type Base = { id: string; visible: boolean };

export type HeroSection = Base & {
  type: "hero";
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  background: string;
  image: string | null;
  imageMode: ImageMode;
  art: ArtKey | null;
};

export type CategoriesSection = Base & { type: "categories"; title: string };

export type ShelfSource = "featured" | "new" | "offers" | "all" | "categories" | "condition-new" | "condition-used";
export type ShelfSection = Base & {
  type: "shelf";
  title: string;
  note: string;
  source: ShelfSource;
  categories: string[];
  linkLabel: string;
  tone: "white" | "canvas";
};

export type BannerSection = Base & {
  type: "banner";
  layout: "center" | "split";
  title: string;
  text: string;
  buttons: NavLink[];
  background: string;
  image: string | null;
  imageMode: ImageMode;
  art: ArtKey | null;
};

export type Tile = { id: string; title: string; href: string; background: string; image: string | null };
export type TilesSection = Base & { type: "tiles"; title: string; text: string; background: string; tiles: Tile[] };

export type StepsSection = Base & {
  type: "steps";
  title: string;
  steps: Array<{ title: string; text: string }>;
  ctaLabel: string;
};

export type HomeSection = HeroSection | CategoriesSection | ShelfSection | BannerSection | TilesSection | StepsSection;
export type SectionType = HomeSection["type"];

export type SiteContent = {
  brand: { name: string; logoUrl: string | null; faviconUrl: string | null };
  seo: { title: string; description: string };
  contact: { whatsapp: string; message: string; instagram: string; email: string; hours: string; address: string };
  nav: NavLink[];
  footer: { navigationTitle: string; categoriesTitle: string; contactTitle: string; socialTitle: string; contactNote: string; legalNote: string };
  home: HomeSection[];
};

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Banner principal",
  categories: "Categorias",
  shelf: "Vitrine de produtos",
  banner: "Banner",
  tiles: "Grade de destaques",
  steps: "Passo a passo",
};

const DEFAULT_HOME: HomeSection[] = [
  {
    id: "hero",
    type: "hero",
    visible: true,
    title: "O melhor da tecnologia está aqui.",
    text: "Encontre os dispositivos e acessórios que combinam com você. Qualidade, procedência e tecnologia em um só lugar.",
    ctaLabel: "Explorar produtos",
    ctaHref: "/catalogo",
    background: "#f5f5f3",
    image: null,
    imageMode: "contain",
    art: "devices",
  },
  { id: "categorias", type: "categories", visible: true, title: "Compre por categoria." },
  {
    id: "destaques",
    type: "shelf",
    visible: true,
    title: "Destaques da Imports Original.",
    note: "Uma seleção para começar.",
    source: "featured",
    categories: [],
    linkLabel: "Ver todos",
    tone: "canvas",
  },
  {
    id: "banner-iphone",
    type: "banner",
    visible: true,
    layout: "center",
    title: "Seu próximo iPhone está aqui.",
    text: "",
    buttons: [{ label: "Ver iPhones", href: catalogHref("iphones") }],
    background: "#0b0c0e",
    image: null,
    imageMode: "contain",
    art: "iphones",
  },
  {
    id: "iphones",
    type: "shelf",
    visible: true,
    title: "iPhones.",
    note: "",
    source: "categories",
    categories: ["iphones"],
    linkLabel: "Ver todos",
    tone: "white",
  },
  {
    id: "banner-ritmo",
    type: "banner",
    visible: true,
    layout: "split",
    title: "Tecnologia para acompanhar seu ritmo.",
    text: "MacBooks, iPads e Apple Watch para o trabalho, os estudos e o dia a dia.",
    buttons: [
      { label: "MacBooks", href: catalogHref("macbooks") },
      { label: "iPads", href: catalogHref("ipads") },
      { label: "Apple Watch", href: catalogHref("apple-watch") },
    ],
    background: "#e7ecea",
    image: null,
    imageMode: "contain",
    art: "rhythm",
  },
  {
    id: "computadores",
    type: "shelf",
    visible: true,
    title: "Trabalho, estudo e movimento.",
    note: "",
    source: "categories",
    categories: ["macbooks", "ipads", "apple-watch"],
    linkLabel: "Ver todos",
    tone: "white",
  },
  {
    id: "detalhes",
    type: "tiles",
    visible: true,
    title: "Os detalhes fazem a diferença.",
    text: "Acessórios, carregadores, capas e fones para completar o seu conjunto.",
    background: "#f1ebe1",
    tiles: [
      { id: "carregadores", title: "Carregadores", href: catalogHref("acessorios"), background: "#ffffff", image: "/art/charger.svg" },
      { id: "capas", title: "Capas", href: catalogHref("acessorios"), background: "#2a211a", image: "/art/case-copper.svg" },
      { id: "airpods", title: "AirPods", href: catalogHref("airpods"), background: "#ffffff", image: "/art/earbuds.svg" },
      { id: "fones", title: "Fones", href: catalogHref("fones"), background: "#dcd2c2", image: "/art/headphones-pearl.svg" },
      { id: "eletronicos", title: "Eletrônicos", href: catalogHref("outros"), background: "#ffffff", image: "/art/speaker.svg" },
    ],
  },
  {
    id: "acessorios",
    type: "shelf",
    visible: true,
    title: "Áudio e acessórios.",
    note: "",
    source: "categories",
    categories: ["acessorios", "airpods", "fones"],
    linkLabel: "Ver todos",
    tone: "white",
  },
  {
    id: "como-funciona",
    type: "steps",
    visible: true,
    title: "Simples do início ao fim.",
    steps: [
      { title: "Escolha no catálogo", text: "Compare modelos, capacidades e cores com calma, no seu tempo." },
      { title: "Consulte pelo WhatsApp", text: "O produto escolhido já segue na mensagem. É só enviar." },
      { title: "Combine com a equipe", text: "Confirme disponibilidade, valores e entrega direto com quem atende você." },
    ],
    ctaLabel: "Falar pelo WhatsApp",
  },
];

export const defaultContent = (): SiteContent => structuredClone({
  brand: { name: "Imports Original", logoUrl: null, faviconUrl: null },
  seo: {
    title: "Imports Original | Celulares, MacBooks e eletrônicos originais",
    description: "Encontre os dispositivos e acessórios que combinam com você. Qualidade, procedência e tecnologia em um só lugar.",
  },
  contact: {
    whatsapp: "5513998090515",
    message: "Olá! Vim pelo site da Imports Original e gostaria de mais informações.",
    instagram: "https://www.instagram.com/imports.original_",
    email: "",
    hours: "",
    address: "",
  },
  nav: [
    { label: "Início", href: "/" },
    { label: "iPhone", href: catalogHref("iphones") },
    { label: "Smartphones", href: catalogHref("smartphones") },
    { label: "MacBooks", href: catalogHref("macbooks") },
    { label: "iPads", href: catalogHref("ipads") },
    { label: "Apple Watch", href: catalogHref("apple-watch") },
    { label: "Acessórios", href: catalogHref("acessorios") },
    { label: "Áudio", href: catalogHref("airpods", "fones") },
    { label: "Ofertas", href: "/catalogo?ofertas=1" },
  ],
  footer: {
    navigationTitle: "Navegação",
    categoriesTitle: "Categorias",
    contactTitle: "Atendimento",
    socialTitle: "Redes",
    contactNote: "Fale com a equipe para tirar suas dúvidas.",
    legalNote: "Apple, iPhone, iPad, MacBook, Apple Watch, AirPods e demais marcas citadas pertencem aos seus respectivos titulares.",
  },
  home: DEFAULT_HOME,
});

/** Completa o que estiver faltando no banco, inclusive um documento ainda vazio. */
export function normalizeContent(raw: unknown): SiteContent {
  const base = defaultContent();
  const data = (raw && typeof raw === "object" ? raw : {}) as Partial<SiteContent>;
  return {
    brand: { ...base.brand, ...data.brand },
    seo: { ...base.seo, ...data.seo },
    contact: { ...base.contact, ...data.contact },
    footer: { ...base.footer, ...data.footer },
    nav: Array.isArray(data.nav) ? data.nav : base.nav,
    home: Array.isArray(data.home) ? data.home : base.home,
  };
}

/** Imagens referenciadas pelo documento, para apagar do armazenamento as que saírem dele. */
export function contentImages(content: SiteContent): string[] {
  const images: Array<string | null> = [content.brand.logoUrl, content.brand.faviconUrl];
  for (const section of content.home) {
    if (section.type === "hero" || section.type === "banner") images.push(section.image);
    if (section.type === "tiles") images.push(...section.tiles.map((tile) => tile.image));
  }
  return images.filter((url): url is string => Boolean(url));
}

/** Move um item para a posição de inserção, contada na lista antes da retirada do item. */
export function moveItem<T>(list: T[], from: number, insertAt: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(insertAt > from ? insertAt - 1 : insertAt, 0, item);
  return next;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export function newSection(type: SectionType): HomeSection {
  const base = { id: newId(), visible: true };
  switch (type) {
    case "hero":
      return { ...base, type, title: "Novo título", text: "", ctaLabel: "Explorar produtos", ctaHref: "/catalogo", background: "#f5f5f3", image: null, imageMode: "contain", art: null };
    case "categories":
      return { ...base, type, title: "Compre por categoria." };
    case "shelf":
      return { ...base, type, title: "Nova vitrine", note: "", source: "all", categories: [], linkLabel: "Ver todos", tone: "white" };
    case "banner":
      return { ...base, type, layout: "center", title: "Novo banner", text: "", buttons: [{ label: "Ver produtos", href: "/catalogo" }], background: "#0b0c0e", image: null, imageMode: "contain", art: null };
    case "tiles":
      return { ...base, type, title: "Nova grade", text: "", background: "#f1ebe1", tiles: [] };
    case "steps":
      return { ...base, type, title: "Como funciona", steps: [{ title: "Primeiro passo", text: "" }], ctaLabel: "Falar pelo WhatsApp" };
  }
}

/** Decide a cor do texto a partir do fundo escolhido. */
export function isDark(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}
