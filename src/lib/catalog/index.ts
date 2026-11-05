import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { defaultContent } from "@/lib/content";
import { localRepository } from "./local";
import { isSupabaseConfigured, type CatalogRepository } from "./repository";
import { supabaseRepository } from "./supabase";

export const STORE_TAG = "store";

export const getRepository = (): CatalogRepository =>
  isSupabaseConfigured() ? supabaseRepository : localRepository;

const cachedSupabaseList = unstable_cache(() => supabaseRepository.list(), ["catalog-products"], {
  tags: [STORE_TAG],
  revalidate: 60,
});

const cachedSupabaseCategories = unstable_cache(() => supabaseRepository.listCategories(), ["catalog-categories"], {
  tags: [STORE_TAG],
  revalidate: 60,
});

const cachedSupabaseContent = unstable_cache(() => supabaseRepository.getContent(), ["site-content"], {
  tags: [STORE_TAG],
  revalidate: 60,
});

// Uma falha momentânea do banco não pode derrubar cabeçalho e rodapé em todas as páginas.
// O painel lê direto do repositório, para nunca salvar em cima destes valores padrão.
const getAllCategories = cache(async () => {
  try {
    return await (isSupabaseConfigured() ? cachedSupabaseCategories() : localRepository.listCategories());
  } catch (error) {
    console.error(error);
    return DEFAULT_CATEGORIES;
  }
});

/** Categorias que o público vê. */
export const getCategories = cache(async () => (await getAllCategories()).filter((c) => c.visible));

export const getHiddenCategorySlugs = cache(async () =>
  (await getAllCategories()).filter((c) => !c.visible).map((c) => c.slug),
);

/** Leitura pública do catálogo, sem os produtos de categorias ocultas. Memoizada por requisição. */
export const getProducts = cache(async () => {
  const [products, hidden] = await Promise.all([
    isSupabaseConfigured() ? cachedSupabaseList() : localRepository.list(),
    getHiddenCategorySlugs(),
  ]);
  return hidden.length ? products.filter((p) => !hidden.includes(p.category)) : products;
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
});

export const getSiteContent = cache(async () => {
  try {
    return await (isSupabaseConfigured() ? cachedSupabaseContent() : localRepository.getContent());
  } catch (error) {
    console.error(error);
    return defaultContent();
  }
});

export { isSupabaseConfigured };
