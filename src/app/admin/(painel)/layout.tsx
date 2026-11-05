import { LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { PanelNav } from "@/components/admin/PanelNav";
import { Logo } from "@/components/store/Logo";
import { requireAdminPage } from "@/lib/auth";
import { getRepository, isSupabaseConfigured } from "@/lib/catalog";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  const { brand } = await getRepository().getContent();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-3 px-4 md:px-6">
          <Link href="/admin" aria-label="Produtos"><Logo name={brand.name} logoUrl={brand.logoUrl} /></Link>
          <div className="flex items-center gap-1">
            <span className="mr-2 hidden max-w-[220px] truncate text-xs text-ink-mute md:block">{user.email}</span>
            <Link href="/" target="_blank" className="rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink">Ver site</Link>
            <form action={logoutAction}>
              <button type="submit" aria-label="Sair" title="Sair" className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink">
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </div>
        <PanelNav />
      </header>
      {!isSupabaseConfigured() && (
        <p className="bg-accent-soft px-4 py-2 text-center text-xs font-medium text-accent-strong">
          Modo demonstração: as alterações ficam salvas apenas neste computador, na pasta .data, até o Supabase ser conectado.
        </p>
      )}
      <main className="mx-auto max-w-[1120px] px-4 pb-20 pt-8 md:px-6 md:pt-10">{children}</main>
    </>
  );
}
