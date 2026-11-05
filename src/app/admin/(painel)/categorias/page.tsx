import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { getRepository } from "@/lib/catalog";

export const metadata: Metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  const repo = getRepository();
  const [categories, products] = await Promise.all([repo.listCategories(), repo.list()]);
  const counts: Record<string, number> = {};
  for (const product of products) counts[product.category] = (counts[product.category] ?? 0) + 1;
  return (
    <>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em]">Categorias</h1>
      <p className="mt-0.5 text-sm text-ink-mute">Aparecem na página inicial, nos filtros do catálogo e no rodapé. Para incluir uma no menu superior, use Identidade e contato. Ocultar tira a categoria e os produtos dela do site, sem apagar nada.</p>
      <CategoriesManager categories={categories} counts={counts} />
    </>
  );
}
