import type { Metadata } from "next";
import { HomeEditor } from "@/components/admin/HomeEditor";
import { getRepository } from "@/lib/catalog";

export const metadata: Metadata = { title: "Página inicial" };

export default async function AdminHomePage() {
  const repo = getRepository();
  const [content, categories] = await Promise.all([repo.getContent(), repo.listCategories()]);
  return (
    <>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em]">Página inicial</h1>
      <p className="mt-0.5 text-sm text-ink-mute">Arraste para mudar a posição, edite, oculte ou adicione seções. Nada muda no site até você salvar.</p>
      <HomeEditor initial={content.home} categories={categories} />
    </>
  );
}
