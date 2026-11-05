import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/store/CatalogBrowser";
import { CatalogSkeleton } from "@/components/store/Skeletons";
import { getCategories, getProducts } from "@/lib/catalog";
import { categoryLabel } from "@/lib/categories";

type Props = { searchParams: Promise<{ categoria?: string; ofertas?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { categoria, ofertas } = await searchParams;
  const categories = await getCategories();
  const slugs = categoria?.split(",").filter((slug) => categories.some((c) => c.slug === slug)) ?? [];
  const title = ofertas === "1"
    ? "Ofertas"
    : slugs.length
      ? slugs.map((slug) => categoryLabel(categories, slug)).join(" e ")
      : "Catálogo";
  return {
    title,
    description: "Explore iPhones, smartphones, MacBooks, iPads, Apple Watch, áudio e acessórios. Consulte a disponibilidade pelo WhatsApp.",
    alternates: { canonical: slugs.length === 1 ? `/catalogo?categoria=${slugs[0]}` : "/catalogo" },
  };
}

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogBrowser products={products} />
    </Suspense>
  );
}
