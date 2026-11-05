import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/store/Logo";
import { getAdminUser, isLocalLoginEnabled } from "@/lib/auth";
import { getSiteContent, isSupabaseConfigured } from "@/lib/catalog";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin");
  const supabase = isSupabaseConfigured();
  const enabled = supabase || isLocalLoginEnabled();
  const { brand } = await getSiteContent();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[380px]">
        <div className="text-center"><Logo name={brand.name} logoUrl={brand.logoUrl} /></div>
        <div className="mt-7 rounded-[24px] bg-white p-7 shadow-soft">
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">Painel administrativo</h1>
          {enabled ? (
            <>
              <p className="mt-1.5 text-sm text-ink-mute">
                {supabase ? "Entre com a sua conta de administrador." : "Modo demonstração: entre com a senha definida em LOCAL_ADMIN_PASSWORD."}
              </p>
              <LoginForm askEmail={supabase} />
            </>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              O login está desativado. Defina <code className="rounded bg-canvas px-1 py-0.5 text-[13px]">LOCAL_ADMIN_PASSWORD</code> no arquivo <code className="rounded bg-canvas px-1 py-0.5 text-[13px]">.env.local</code>, com pelo menos 8 caracteres, e reinicie o servidor.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
