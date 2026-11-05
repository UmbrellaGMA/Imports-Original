"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteCategoryAction, reorderCategoriesAction, saveCategoryAction, setCategoryVisibleAction } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";
import { ImageField } from "./ImageField";
import { iconButton, input } from "./ui";

const CATEGORY_IMAGE = { maxSide: 800 };

function CategoryRow({ category, count, first, last, pending, onMove, onToggle, onDelete, onError }: { category: Category; count: number; first: boolean; last: boolean; pending: boolean; onMove: (offset: number) => void; onToggle: () => void; onDelete: () => void; onError: (message: string | null) => void }) {
  const router = useRouter();
  const [label, setLabel] = useState(category.label);
  const [image, setImage] = useState(category.image);
  const [busy, setBusy] = useState(false);
  const [saving, startSaving] = useTransition();
  const dirty = label.trim() !== category.label || image !== category.image;

  const save = () => {
    onError(null);
    startSaving(async () => {
      const result = await saveCategoryAction(category.slug, { label, image });
      if (!result.ok) onError(result.error);
      router.refresh();
    });
  };

  return (
    <li className={`rounded-[18px] p-4 shadow-soft ${category.visible ? "bg-white" : "bg-white/60"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1 md:max-w-[340px]">
          <label className="block">
            <span className="text-[13px] font-medium">Nome</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${input} mt-1.5`} />
          </label>
          <p className="mt-1 text-xs text-ink-mute">
            {count === 1 ? "1 produto" : `${count} produtos`}
            {!category.visible && <span className="font-semibold text-offer"> · Oculta no site</span>}
          </p>
        </div>
        <div className="flex-1"><ImageField label="Imagem" value={image} onChange={setImage} onBusyChange={setBusy} compress={CATEGORY_IMAGE} /></div>
        <div className="flex items-center justify-end gap-0.5">
          {dirty && (
            <button type="button" disabled={saving || busy} onClick={save} className="btn btn-dark mr-2 !px-4 !py-2 !text-[13px]">
              {saving ? "Salvando…" : "Salvar"}
            </button>
          )}
          <button type="button" aria-pressed={!category.visible} aria-label={category.visible ? `Ocultar ${category.label}` : `Mostrar ${category.label}`} title={category.visible ? "Ocultar no site" : "Mostrar no site"} disabled={pending} onClick={onToggle} className={iconButton}>
            {category.visible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button type="button" aria-label={`Subir ${category.label}`} disabled={first || pending} onClick={() => onMove(-1)} className={iconButton}><ArrowUp size={15} /></button>
          <button type="button" aria-label={`Descer ${category.label}`} disabled={last || pending} onClick={() => onMove(1)} className={iconButton}><ArrowDown size={15} /></button>
          <button type="button" aria-label={`Excluir ${category.label}`} title={count > 0 ? "Mova ou exclua os produtos antes" : undefined} disabled={count > 0} onClick={onDelete} className={`${iconButton} hover:!bg-[#fbeceb] hover:!text-danger`}><Trash2 size={14} /></button>
        </div>
      </div>
    </li>
  );
}

export function CategoriesManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const [source, setSource] = useState(categories);
  if (categories !== source) {
    setSource(categories);
    setItems(categories);
  }
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);

  const run = (work: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (result.ok) after?.();
      else setError(result.error ?? "Não foi possível concluir a ação.");
      router.refresh();
    });
  };

  const move = (index: number, offset: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    setItems(next);
    run(() => reorderCategoriesAction(next.map((c) => c.slug)));
  };

  const toggle = (category: Category) => {
    const visible = !category.visible;
    setItems(items.map((c) => (c.slug === category.slug ? { ...c, visible } : c)));
    run(() => setCategoryVisibleAction(category.slug, visible));
  };

  const create = () => run(() => saveCategoryAction(null, { label: draft, image: null }), () => setDraft(""));

  const confirmDelete = () => {
    if (!toDelete) return;
    const { slug } = toDelete;
    dialog.current?.close();
    run(() => deleteCategoryAction(slug));
  };

  return (
    <div className="mt-7">
      <form
        onSubmit={(e) => { e.preventDefault(); create(); }}
        className="flex flex-col gap-2.5 rounded-[18px] bg-white p-4 shadow-soft sm:flex-row sm:items-end"
      >
        <label className="block flex-1">
          <span className="text-[13px] font-medium">Nova categoria</span>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nome da categoria" className={`${input} mt-1.5`} />
        </label>
        <button type="submit" disabled={pending || !draft.trim()} className="btn btn-dark !px-4 !py-2.5 !text-sm disabled:opacity-40">
          <Plus size={16} />
          Criar categoria
        </button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fbeceb] px-4 py-3 text-sm text-danger">{error}</p>}

      <ul className="mt-4 space-y-2">
        {items.map((category, index) => (
          <CategoryRow
            // A chave inclui os valores salvos: ao recarregar, a linha descarta o rascunho antigo.
            key={`${category.slug}:${category.label}:${category.image}`}
            category={category}
            count={counts[category.slug] ?? 0}
            first={index === 0}
            last={index === items.length - 1}
            pending={pending}
            onMove={(offset) => move(index, offset)}
            onToggle={() => toggle(category)}
            onDelete={() => { setToDelete(category); dialog.current?.showModal(); }}
            onError={setError}
          />
        ))}
        {items.length === 0 && <li className="rounded-[18px] bg-white px-6 py-10 text-center text-sm text-ink-mute shadow-soft">Nenhuma categoria. Crie a primeira acima.</li>}
      </ul>

      <dialog ref={dialog} className="modal" aria-labelledby="delete-category-title">
        <div className="p-6">
          <h2 id="delete-category-title" className="text-lg font-semibold tracking-[-0.015em]">Excluir categoria?</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            <strong className="font-medium">{toDelete?.label}</strong> sairá do site. Links do menu e banners que apontem para ela precisam ser ajustados à parte.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-outline !px-4 !py-2 !text-sm">Cancelar</button>
            <button type="button" onClick={confirmDelete} className="btn !bg-danger !px-4 !py-2 !text-sm text-white">Excluir</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
