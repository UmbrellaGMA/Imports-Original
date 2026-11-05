import assert from "node:assert/strict";
import { test } from "node:test";
import { pointsOnlyToHidden } from "./categories.ts";
import { contentImages, defaultContent, isDark, moveItem, newSection, normalizeContent, type SectionType } from "./content.ts";
import { productMessage } from "./site.ts";
import { coverStyle } from "./cover.ts";
import { applyFilters, filtersToSearch, readFilters } from "./filters.ts";
import { isStaleCopySlug, parsePrice, slugify } from "./format.ts";
import type { Product } from "./types.ts";
import { contentSchema, productSchema } from "./validation.ts";

const product = (over: Partial<Product>): Product => ({
  id: over.name ?? "x",
  slug: "x",
  name: "x",
  brand: "Apple",
  category: "iphones",
  description: "",
  additionalInfo: "",
  price: null,
  promoPrice: null,
  specs: [],
  colors: [],
  capacities: [],
  images: [],
  coverAdjust: { x: 50, y: 50, zoom: 1 },
  featured: false,
  isNew: false,
  available: true,
  visible: true,
  condition: null,
  conservation: null,
  batteryHealth: null,
  sealed: false,
  hasDamage: false,
  damageNotes: "",
  repairNotes: "",
  warranty: "",
  included: [],
  sortOrder: 0,
  createdAt: "",
  updatedAt: "",
  ...over,
});

const filters = (search: string) => readFilters(new URLSearchParams(search));
const names = (list: Product[]) => list.map((p) => p.name);

test("parsePrice entende os formatos digitados no Brasil", () => {
  assert.equal(parsePrice("1.299,90"), 1299.9);
  assert.equal(parsePrice("R$ 1.299"), 1299);
  assert.equal(parsePrice("1299.90"), 1299.9);
  assert.equal(parsePrice("12.000.000"), 12000000);
  assert.equal(parsePrice("899,5"), 899.5);
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice("abc"), null);
});

test("slugify remove acentos e símbolos", () => {
  assert.equal(slugify("  Fone de Ouvido Sem-Fio ação! "), "fone-de-ouvido-sem-fio-acao");
  assert.equal(slugify("###"), "produto");
});

test("ordenação usa o preço promocional e deixa sem preço no fim", () => {
  const list = [
    product({ name: "sem", price: null }),
    product({ name: "caro", price: 500 }),
    product({ name: "promo", price: 900, promoPrice: 100 }),
  ];
  assert.deepEqual(names(applyFilters(list, filters("ordem=menor-preco"))), ["promo", "caro", "sem"]);
  assert.deepEqual(names(applyFilters(list, filters("ordem=maior-preco"))), ["caro", "promo", "sem"]);
});

test("faixa de preço exclui produtos sem preço e tolera faixa invertida", () => {
  const list = [product({ name: "a", price: 100 }), product({ name: "b", price: null }), product({ name: "c", price: 300 })];
  assert.deepEqual(names(applyFilters(list, filters("min=50&max=200"))), ["a"]);
  assert.deepEqual(names(applyFilters(list, filters("min=200&max=50"))), ["a"]);
});

test("busca ignora acentos e combina termos, inclusive categoria", () => {
  const list = [product({ name: "Capa Couro", category: "acessorios" }), product({ name: "iPhone" })];
  const label = (s: string) => (s === "acessorios" ? "Acessórios" : "iPhones");
  assert.deepEqual(names(applyFilters(list, filters("q=acessorio capa"), label)), ["Capa Couro"]);
});

test("categoria múltipla, marca, disponibilidade e ofertas", () => {
  const list = [
    product({ name: "a", category: "airpods" }),
    product({ name: "b", category: "fones", brand: "Sony", available: false }),
    product({ name: "c", category: "macbooks", price: 10, promoPrice: 5 }),
  ];
  assert.deepEqual(names(applyFilters(list, filters("categoria=airpods,fones"))), ["a", "b"]);
  assert.deepEqual(names(applyFilters(list, filters("marca=Sony"))), ["b"]);
  assert.deepEqual(names(applyFilters(list, filters("disponibilidade=indisponiveis"))), ["b"]);
  assert.deepEqual(names(applyFilters(list, filters("ofertas=1"))), ["c"]);
});

test("o conteúdo padrão e toda seção nova passam na validação do painel", () => {
  const types: SectionType[] = ["hero", "categories", "shelf", "banner", "tiles", "steps"];
  const content = defaultContent();
  content.home.push(...types.map(newSection));
  const parsed = contentSchema.safeParse(content);
  assert.equal(parsed.success, true, JSON.stringify(parsed.error?.issues));
});

test("links perigosos são recusados no menu e nos banners", () => {
  const withNav = (href: string) => ({ ...defaultContent(), nav: [{ label: "x", href }] });
  assert.equal(contentSchema.safeParse(withNav("javascript:alert(1)")).success, false);
  assert.equal(contentSchema.safeParse(withNav("//site-malicioso.com")).success, false);
  assert.equal(contentSchema.safeParse(withNav("/catalogo?ofertas=1")).success, true);
  assert.equal(contentSchema.safeParse(withNav("https://exemplo.com")).success, true);
});

test("documento vazio ou parcial é completado sem perder o que foi salvo", () => {
  assert.deepEqual(normalizeContent({}), defaultContent());
  assert.deepEqual(normalizeContent(null), defaultContent());
  const partial = normalizeContent({ brand: { name: "Outra" }, home: [] });
  assert.equal(partial.brand.name, "Outra");
  assert.equal(partial.brand.logoUrl, null);
  assert.deepEqual(partial.home, []);
});

test("imagens do conteúdo são todas localizadas para a limpeza", () => {
  const content = defaultContent();
  content.brand.logoUrl = "https://x/logo.webp";
  const images = contentImages(content);
  assert.ok(images.includes("https://x/logo.webp"));
  assert.ok(images.includes("/art/charger.svg"));
});

const draft = (over: object) => ({
  name: "iPhone",
  brand: "Apple",
  category: "iphones",
  description: "",
  additionalInfo: "",
  price: null,
  promoPrice: null,
  specs: [],
  colors: [],
  capacities: [],
  images: [],
  coverAdjust: { x: 50, y: 50, zoom: 1 },
  featured: false,
  isNew: false,
  available: true,
  visible: true,
  condition: null,
  conservation: null,
  batteryHealth: null,
  sealed: false,
  hasDamage: null,
  damageNotes: "",
  repairNotes: "",
  warranty: "",
  included: [],
  ...over,
});
const invalidFields = (over: object) => {
  const parsed = productSchema.safeParse(draft(over));
  return parsed.success ? [] : parsed.error.issues.map((issue) => issue.path[0]);
};

test("condição é obrigatória e o seminovo exige conservação e resposta sobre avaria", () => {
  assert.deepEqual(invalidFields({}), ["condition"]);
  assert.deepEqual(invalidFields({ condition: "seminovo" }), ["conservation", "hasDamage"]);
  assert.deepEqual(invalidFields({ condition: "seminovo", conservation: "bom", hasDamage: true }), ["damageNotes"]);
  assert.deepEqual(invalidFields({ condition: "seminovo", conservation: "bom", hasDamage: false, batteryHealth: 120 }), ["batteryHealth"]);
  assert.deepEqual(invalidFields({ condition: "novo" }), []);
});

test("ao salvar, campos que não se aplicam à condição são descartados", () => {
  const novo = productSchema.parse(draft({ condition: "novo", conservation: "bom", batteryHealth: 80, repairNotes: "tela", sealed: true }));
  assert.equal(novo.conservation, null);
  assert.equal(novo.batteryHealth, null);
  assert.equal(novo.repairNotes, "");
  assert.equal(novo.sealed, true);
  assert.equal(novo.hasDamage, false);
  const usado = productSchema.parse(draft({ condition: "seminovo", conservation: "bom", hasDamage: false, damageNotes: "resto", sealed: true }));
  assert.equal(usado.sealed, false);
  assert.equal(usado.damageNotes, "");
});

test("filtro e busca por condição", () => {
  const list = [product({ name: "a", condition: "novo" }), product({ name: "b", condition: "seminovo" }), product({ name: "c" })];
  assert.deepEqual(names(applyFilters(list, filters("condicao=seminovo"))), ["b"]);
  assert.deepEqual(names(applyFilters(list, filters("condicao=novo"))), ["a"]);
  assert.deepEqual(names(applyFilters(list, filters("condicao=outra"))), ["a", "b", "c"]);
  assert.deepEqual(names(applyFilters(list, filters("q=seminovo"))), ["b"]);
  assert.equal(filtersToSearch(filters("condicao=novo")), "condicao=novo");
});

test("link que só leva a categorias ocultas é identificado", () => {
  assert.equal(pointsOnlyToHidden("/catalogo?categoria=fones", ["fones"]), true);
  assert.equal(pointsOnlyToHidden("/catalogo?categoria=airpods,fones", ["fones"]), false);
  assert.equal(pointsOnlyToHidden("/catalogo?categoria=airpods,fones", ["fones", "airpods"]), true);
  assert.equal(pointsOnlyToHidden("/catalogo", ["fones"]), false);
  assert.equal(pointsOnlyToHidden("/", ["fones"]), false);
});

test("arrastar coloca o item na posição indicada, para cima e para baixo", () => {
  const list = ["a", "b", "c", "d"];
  assert.deepEqual(moveItem(list, 0, 2), ["b", "a", "c", "d"]);
  assert.deepEqual(moveItem(list, 0, 4), ["b", "c", "d", "a"]);
  assert.deepEqual(moveItem(list, 3, 0), ["d", "a", "b", "c"]);
  assert.deepEqual(moveItem(list, 2, 1), ["a", "c", "b", "d"]);
  assert.deepEqual(list, ["a", "b", "c", "d"]);
});

test("mensagem do WhatsApp vem em blocos e termina com o link sozinho", () => {
  const message = productMessage("iPhone Pro", { capacity: "256 GB", color: "Preto", condition: "Seminovo", url: "https://loja.com/produto/iphone-pro" });
  assert.deepEqual(message.split("\n\n"), [
    "Olá! Tenho interesse neste produto:",
    "*iPhone Pro*\nCondição: Seminovo\nCapacidade: 256 GB\nCor: Preto",
    "Ele está disponível?",
    "https://loja.com/produto/iphone-pro",
  ]);
});

test("mensagem sem opções não deixa linhas soltas", () => {
  assert.equal(productMessage("iPad"), "Olá! Tenho interesse neste produto:\n\n*iPad*\n\nEle está disponível?");
});

test("mensagem de produto esgotado pede a previsão de volta e mantém o link", () => {
  assert.deepEqual(productMessage("iPhone Pro", { soldOut: true, url: "https://loja.com/produto/iphone-pro" }).split("\n\n"), [
    "Olá! Vi no site que este produto está esgotado:",
    "*iPhone Pro*",
    "Pode me avisar quando ele voltar?",
    "https://loja.com/produto/iphone-pro",
  ]);
});

test("ajuste da capa só aceita valores dentro dos limites", () => {
  const valid = { condition: "novo" };
  assert.deepEqual(invalidFields({ ...valid, coverAdjust: { x: 0, y: 100, zoom: 3 } }), []);
  assert.deepEqual(invalidFields({ ...valid, coverAdjust: { x: 101, y: 50, zoom: 1 } }), ["coverAdjust"]);
  assert.deepEqual(invalidFields({ ...valid, coverAdjust: { x: 50, y: 50, zoom: 0.5 } }), ["coverAdjust"]);
  assert.deepEqual(invalidFields({ ...valid, coverAdjust: { x: 50, y: 50, zoom: 4 } }), ["coverAdjust"]);
});

test("estilo da capa usa o mesmo ponto na posição e no zoom", () => {
  assert.deepEqual(coverStyle({ x: 20, y: 80, zoom: 1.5 }), { objectPosition: "20% 80%", transformOrigin: "20% 80%", transform: "scale(1.5)" });
  assert.deepEqual(coverStyle(), { objectPosition: "50% 50%", transformOrigin: "50% 50%", transform: "scale(1)" });
});

test("endereço da cópia muda só quando ela é renomeada", () => {
  assert.equal(slugify("iPhone 15 (cópia)"), "iphone-15-copia");
  assert.equal(isStaleCopySlug("iphone-15-copia", "iPhone 15 (cópia)"), false);
  assert.equal(isStaleCopySlug("iphone-15-copia-2", "iPhone 15 (cópia)"), false);
  assert.equal(isStaleCopySlug("iphone-15-copia", "iPhone 15 Azul"), true);
  assert.equal(isStaleCopySlug("iphone-15-copia-2", "iPhone 15 Azul"), true);
  assert.equal(isStaleCopySlug("iphone-15", "iPhone 15 Azul"), false);
});

test("cor do texto acompanha o fundo", () => {
  assert.equal(isDark("#0b0c0e"), true);
  assert.equal(isDark("#f1ebe1"), false);
});

test("filtros sobrevivem à ida e volta pela URL", () => {
  const search = "q=iphone&categoria=airpods,fones&min=10&max=20&disponibilidade=disponiveis&ofertas=1&ordem=maior-preco";
  assert.equal(filtersToSearch(filters(search)), search);
});
