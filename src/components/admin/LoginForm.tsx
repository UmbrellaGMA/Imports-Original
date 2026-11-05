"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/admin/actions";

const inputClass = "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-ink";

export function LoginForm({ askEmail }: { askEmail: boolean }) {
  const [error, action, pending] = useActionState(loginAction, null);
  // O React limpa o formulário após a ação; o e-mail não deve sumir com uma senha errada.
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="mt-6 space-y-4">
      {askEmail && (
        <label className="block text-[13px] font-medium">
          E-mail
          <input name="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
      )}
      <label className="block text-[13px] font-medium">
        Senha
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={pending} className="btn btn-dark w-full">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
