import type { Metadata } from "next";
import { IdentityForm } from "@/components/admin/IdentityForm";
import { getRepository, isSupabaseConfigured } from "@/lib/catalog";

export const metadata: Metadata = { title: "Identidade e contato" };

export default async function AdminIdentityPage() {
  const repo = getRepository();
  const [content, categories] = await Promise.all([repo.getContent(), repo.listCategories()]);
  return (
    <>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em]">Identidade e contato</h1>
      <p className="mt-0.5 text-sm text-ink-mute">Nome, logo, favicon, WhatsApp, menu e rodapé do site.</p>
      <IdentityForm content={content} categories={categories} canChangePassword={isSupabaseConfigured()} />
    </>
  );
}
