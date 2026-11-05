import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { getRepository } from "@/lib/catalog";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  const repo = getRepository();
  const [products, categories] = await Promise.all([repo.list(), repo.listCategories()]);
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em]">Produtos</h1>
          <p className="mt-0.5 text-sm text-ink-mute">
            {products.length === 1 ? "1 produto cadastrado" : `${products.length} produtos cadastrados`}
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="btn btn-dark !px-4 !py-2.5 !text-sm">
          <Plus size={16} />
          Novo produto
        </Link>
      </div>
      <ProductsManager products={products} categories={categories} />
    </>
  );
}
