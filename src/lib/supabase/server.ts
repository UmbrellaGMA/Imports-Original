import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente com a sessão do administrador: as políticas RLS valem para cada operação. */
export async function createSessionClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Em Server Components os cookies são somente leitura; o proxy renova a sessão.
          }
        },
      },
    },
  );
}
