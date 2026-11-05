import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { getRepository } from "@/lib/catalog";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  return <ProductForm product={null} categories={await getRepository().listCategories()} />;
}
