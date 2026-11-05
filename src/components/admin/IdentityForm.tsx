"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changePasswordAction, saveContentAction } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";
import type { SiteContent } from "@/lib/content";
import { ImageField } from "./ImageField";
import { addButton, Field, iconButton, input, LinkInput, LinkSuggestions, removeButton, SaveBar, Section } from "./ui";
import { useUnsavedWarning } from "./useUnsavedWarning";

type Editable = Pick<SiteContent, "brand" | "seo" | "contact" | "nav" | "footer">;

const LINKS = "identity-links";
const LOGO = { maxSide: 800 };
const FAVICON = { maxSide: 256, png: true };

const pick = ({ brand, seo, contact, nav, footer }: SiteContent): Editable => ({ brand, seo, contact, nav, footer });

function PasswordSection() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await changePasswordAction(password);
      if (result.ok) {
        setPassword("");
        setMessage({ ok: true, text: "Senha alterada." });
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  };
  return (
    <Section title="Senha do painel" description="Altera a senha da conta com que você entrou.">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="text-[13px] font-medium">Nova senha</span>
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mt-1.5`} />
        </label>
        <button type="submit" disabled={pending || !password} className="btn btn-outline !px-4 !py-2.5 !text-sm disabled:opacity-40">
          {pending ? "Alterando…" : "Alterar senha"}
        </button>
      </form>
      {message && <p role="status" className={`mt-2 text-xs ${message.ok ? "text-accent-strong" : "text-danger"}`}>{message.text}</p>}
    </Section>
  );
}

export function IdentityForm({ content, categories, canChangePassword }: { content: SiteContent; categories: Category[]; canChangePassword: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<Editable>(() => pick(content));
  const [lastSaved, setLastSaved] = useState<Editable>(() => pick(content));
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(form) !== JSON.stringify(lastSaved);
  useUnsavedWarning(dirty);

  const onBusy = (value: boolean) => setBusy((count) => count + (value ? 1 : -1));
  const setBrand = (change: Partial<Editable["brand"]>) => setForm((f) => ({ ...f, brand: { ...f.brand, ...change } }));
  const setSeo = (change: Partial<Editable["seo"]>) => setForm((f) => ({ ...f, seo: { ...f.seo, ...change } }));
  const setContact = (change: Partial<Editable["contact"]>) => setForm((f) => ({ ...f, contact: { ...f.contact, ...change } }));
  const setFooter = (change: Partial<Editable["footer"]>) => setForm((f) => ({ ...f, footer: { ...f.footer, ...change } }));
  const setNav = (nav: Editable["nav"]) => setForm((f) => ({ ...f, nav }));

  const moveNav = (index: number, offset: number) => {
    const next = [...form.nav];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    setNav(next);
  };

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveContentAction(form);
      if (result.ok) {
        setLastSaved(form);
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mt-7 space-y-4">
      <LinkSuggestions id={LINKS} categories={categories} />

      <Section title="Marca">
        <div className="space-y-5">
          <Field label="Nome da loja">
            <input value={form.brand.name} onChange={(e) => setBrand({ name: e.target.value })} className={input} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField label="Logo" value={form.brand.logoUrl} onChange={(logoUrl) => setBrand({ logoUrl })} onBusyChange={onBusy} compress={LOGO} hint="PNG com fundo transparente fica melhor. Sem logo, aparece o nome da loja." />
            <ImageField label="Favicon (ícone da aba)" value={form.brand.faviconUrl} onChange={(faviconUrl) => setBrand({ faviconUrl })} onBusyChange={onBusy} compress={FAVICON} hint="Imagem quadrada. Os navegadores podem demorar um pouco para atualizar." />
          </div>
        </div>
      </Section>

      <Section title="Contato">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp" hint="Só números, com DDI e DDD.">
            <input inputMode="numeric" value={form.contact.whatsapp} onChange={(e) => setContact({ whatsapp: e.target.value })} className={input} />
          </Field>
          <Field label="Instagram" hint="Link completo do perfil. Em branco, não aparece.">
            <input type="url" value={form.contact.instagram} onChange={(e) => setContact({ instagram: e.target.value })} className={input} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mensagem automática do WhatsApp" hint="Usada nos botões gerais. Nos produtos, a mensagem já leva o nome do item.">
              <textarea rows={2} value={form.contact.message} onChange={(e) => setContact({ message: e.target.value })} className={`${input} resize-y`} />
            </Field>
          </div>
          <Field label="E-mail">
            <input type="email" value={form.contact.email} onChange={(e) => setContact({ email: e.target.value })} className={input} />
          </Field>
          <Field label="Horário de atendimento">
            <input value={form.contact.hours} onChange={(e) => setContact({ hours: e.target.value })} className={input} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Endereço">
              <input value={form.contact.address} onChange={(e) => setContact({ address: e.target.value })} className={input} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Menu superior" description="A ordem aqui é a ordem no site. Links para categorias ficam fora da coluna de navegação do rodapé.">
        <ul className="space-y-2">
          {form.nav.map((item, index) => (
            <li key={index} className="flex items-start gap-1.5">
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <input aria-label={`Nome do link ${index + 1}`} placeholder="Nome" value={item.label} onChange={(e) => setNav(form.nav.map((n, i) => (i === index ? { ...n, label: e.target.value } : n)))} className={input} />
                <LinkInput ariaLabel={`Endereço do link ${index + 1}`} value={item.href} listId={LINKS} onChange={(href) => setNav(form.nav.map((n, i) => (i === index ? { ...n, href } : n)))} />
              </div>
              <button type="button" aria-label={`Subir link ${index + 1}`} disabled={index === 0} onClick={() => moveNav(index, -1)} className={`${iconButton} mt-1`}><ArrowUp size={15} /></button>
              <button type="button" aria-label={`Descer link ${index + 1}`} disabled={index === form.nav.length - 1} onClick={() => moveNav(index, 1)} className={`${iconButton} mt-1`}><ArrowDown size={15} /></button>
              <button type="button" aria-label={`Remover link ${index + 1}`} onClick={() => setNav(form.nav.filter((_, i) => i !== index))} className={`${removeButton} mt-0.5`}><X size={15} /></button>
            </li>
          ))}
        </ul>
        {form.nav.length < 14 && (
          <button type="button" onClick={() => setNav([...form.nav, { label: "", href: "/catalogo" }])} className={addButton}><Plus size={14} />Adicionar link</button>
        )}
      </Section>

      <Section title="Rodapé">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título: navegação"><input value={form.footer.navigationTitle} onChange={(e) => setFooter({ navigationTitle: e.target.value })} className={input} /></Field>
          <Field label="Título: categorias"><input value={form.footer.categoriesTitle} onChange={(e) => setFooter({ categoriesTitle: e.target.value })} className={input} /></Field>
          <Field label="Título: atendimento"><input value={form.footer.contactTitle} onChange={(e) => setFooter({ contactTitle: e.target.value })} className={input} /></Field>
          <Field label="Título: redes"><input value={form.footer.socialTitle} onChange={(e) => setFooter({ socialTitle: e.target.value })} className={input} /></Field>
          <div className="sm:col-span-2">
            <Field label="Texto de atendimento" hint="Aparece quando e-mail, horário e endereço estão em branco.">
              <input value={form.footer.contactNote} onChange={(e) => setFooter({ contactNote: e.target.value })} className={input} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Aviso legal">
              <textarea rows={2} value={form.footer.legalNote} onChange={(e) => setFooter({ legalNote: e.target.value })} className={`${input} resize-y`} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Busca no Google e compartilhamento" description="Título e descrição que aparecem nos resultados de busca e ao compartilhar o link.">
        <div className="space-y-4">
          <Field label="Título"><input value={form.seo.title} onChange={(e) => setSeo({ title: e.target.value })} className={input} /></Field>
          <Field label="Descrição"><textarea rows={2} value={form.seo.description} onChange={(e) => setSeo({ description: e.target.value })} className={`${input} resize-y`} /></Field>
        </div>
      </Section>

      <SaveBar dirty={dirty} pending={pending} busy={busy > 0} error={error} saved={saved} onSave={save} />

      {canChangePassword && <PasswordSection />}
    </div>
  );
}
