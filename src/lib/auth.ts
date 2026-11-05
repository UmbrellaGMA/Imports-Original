import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/catalog/repository";
import { createSessionClient } from "@/lib/supabase/server";

const LOCAL_COOKIE = "io_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const MIN_PASSWORD_LENGTH = 8;

export type AdminUser = { email: string };

/** Senha do modo demonstração. Curta demais equivale a login desativado. */
const localPassword = () => {
  const value = process.env.LOCAL_ADMIN_PASSWORD ?? "";
  return value.length >= MIN_PASSWORD_LENGTH ? value : null;
};

export const isLocalLoginEnabled = () => localPassword() !== null;

const sign = (payload: string, password: string) =>
  createHmac("sha256", password).update(`imports-original:${payload}`).digest("base64url");

const sameText = (a: string, b: string) => {
  const hash = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(hash(a), hash(b));
};

async function getLocalAdmin(): Promise<AdminUser | null> {
  const password = localPassword();
  if (!password) return null;
  const token = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!token) return null;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !sameText(signature, sign(expires, password))) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  return { email: "administrador (modo demonstração)" };
}

export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return getLocalAdmin();
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return null;
  return { email: data.user.email ?? "administrador" };
}

/** Para páginas: redireciona ao login. */
export async function requireAdminPage(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Para Server Actions: toda mutação passa por aqui. */
export async function assertAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  return user;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const invalid = "E-mail ou senha incorretos.";
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return invalid;
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      await supabase.auth.signOut();
      return "Esta conta não tem acesso ao painel.";
    }
    return null;
  }

  const expected = localPassword();
  if (!expected) return "Login desativado. Defina LOCAL_ADMIN_PASSWORD no arquivo .env.local.";
  // Atraso fixo para encarecer tentativas repetidas.
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!sameText(password, expected)) return "Senha incorreta.";
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  (await cookies()).set(LOCAL_COOKIE, `${expires}.${sign(expires, expected)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return null;
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
    return;
  }
  (await cookies()).delete(LOCAL_COOKIE);
}
