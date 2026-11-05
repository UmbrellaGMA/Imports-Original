import type { ReactNode } from "react";

export const input = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-ink-mute/60 focus:border-ink";
export const removeButton = "flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-[#fbeceb] hover:text-danger";
export const addButton = "mt-3 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[#ebebe8]";
export const iconButton = "flex size-8 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-canvas hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && !error && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] bg-white p-5 shadow-soft md:p-7">
      <h2 className="text-[17px] font-semibold tracking-[-0.015em]">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-ink-mute">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <span className="flex items-center gap-2">
        <input type="color" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="size-10 shrink-0 cursor-pointer rounded-xl border border-line bg-white p-1" />
        <span className="text-sm tabular-nums text-ink-mute">{value}</span>
      </span>
    </Field>
  );
}

/** Link com sugestões das páginas da loja, aceitando também um endereço digitado. */
export function LinkInput({ value, onChange, listId, ariaLabel }: { value: string; onChange: (value: string) => void; listId: string; ariaLabel?: string }) {
  return <input value={value} list={listId} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)} placeholder="/catalogo" className={input} />;
}

export function LinkSuggestions({ id, categories }: { id: string; categories: Array<{ slug: string; label: string }> }) {
  return (
    <datalist id={id}>
      <option value="/">Início</option>
      <option value="/catalogo">Catálogo completo</option>
      <option value="/catalogo?ofertas=1">Ofertas</option>
      <option value="/catalogo?condicao=novo">Produtos novos</option>
      <option value="/catalogo?condicao=seminovo">Produtos seminovos</option>
      {categories.map((c) => <option key={c.slug} value={`/catalogo?categoria=${c.slug}`}>{c.label}</option>)}
    </datalist>
  );
}

export function SaveBar({ dirty, pending, busy, error, saved, onSave, label = "Salvar alterações" }: { dirty: boolean; pending: boolean; busy: boolean; error: string | null; saved: boolean; onSave: () => void; label?: string }) {
  return (
    <div className="sticky bottom-3 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lift backdrop-blur-xl">
      <p aria-live="polite" className={`min-w-0 text-[13px] ${error ? "text-danger" : "text-ink-mute"}`}>
        {error ?? (busy ? "Enviando imagem…" : dirty ? "Há alterações não salvas." : saved ? "Alterações publicadas no site." : "Tudo salvo.")}
      </p>
      <button type="button" disabled={!dirty || pending || busy} onClick={onSave} className="btn btn-dark !px-5 !py-2.5 !text-sm disabled:opacity-40">
        {pending ? "Salvando…" : label}
      </button>
    </div>
  );
}
