import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getRepository } from "@/lib/catalog";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Um id malformado não deve virar erro do banco, apenas "não encontrado".
  const repo = getRepository();
  const product = await repo.getById(id).catch(() => null);
  if (!product) notFound();
  return <ProductForm product={product} categories={await repo.listCategories()} />;
}
