"use client";

import { ArrowDown, ArrowUp, GripVertical, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteProductAction, reorderAction, setFlagAction } from "@/app/admin/actions";
import { ProductImage } from "@/components/store/ProductImage";
import { categoryArt, categoryLabel, type Category } from "@/lib/categories";
import { CONDITION_LABELS } from "@/lib/conditions";
import { formatPrice, normalizeText } from "@/lib/format";
import type { Product, ProductFlag } from "@/lib/types";
import { Switch } from "./Switch";

const FLAGS: Array<[ProductFlag, string]> = [
  ["featured", "Destaque"],
  ["isNew", "Lançamento"],
];

export function ProductsManager({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [source, setSource] = useState(products);
  // Recarregou do servidor: a lista recebida passa a valer.
  if (products !== source) {
    setSource(products);
    setItems(products);
  }

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const filtering = Boolean(query.trim() || category || condition);
  const visible = useMemo(() => {
    const term = normalizeText(query);
    return items.filter(
      (p) =>
        (!category || p.category === category) &&
        (!condition || p.condition === condition) &&
        (!term || normalizeText(`${p.name} ${p.brand}`).includes(term)),
    );
  }, [items, query, category, condition]);

  const run = (work: () => Promise<{ ok: boolean; error?: string }>, rollback?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        setError(result.error ?? "Não foi possível concluir a ação.");
        rollback?.();
      }
      router.refresh();
    });
  };

  const applyOrder = (next: Product[]) => {
    const previous = items;
    setItems(next);
    run(() => reorderAction(next.map((p) => p.id)), () => setItems(previous));
  };

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    applyOrder(next);
  };

  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((p) => p.id === dragId);
    const to = items.findIndex((p) => p.id === targetId);
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    applyOrder(next);
  };

  const setFlag = (product: Product, flag: ProductFlag, value: boolean) => {
    const previous = items;
    setItems(items.map((p) => (p.id === product.id ? { ...p, [flag]: value } : p)));
    run(() => setFlagAction(product.id, flag, value), () => setItems(previous));
  };

  const askDelete = (product: Product) => {
    setToDelete(product);
    dialog.current?.showModal();
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const { id } = toDelete;
    const previous = items;
    setItems(items.filter((p) => p.id !== id));
    dialog.current?.close();
    run(() => deleteProductAction(id), () => setItems(previous));
  };

  const arrow = "flex size-7 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-canvas hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="mt-7">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label className="flex flex-1 items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-soft">
          <Search size={15} className="text-ink-mute" />
          <span className="sr-only">Buscar produto</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou marca" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select aria-label="Filtrar por categoria" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl bg-white px-3.5 py-2.5 text-sm shadow-soft outline-none">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}{c.visible ? "" : " (oculta)"}</option>)}
        </select>
        <select aria-label="Filtrar por condição" value={condition} onChange={(e) => setCondition(e.target.value)} className="rounded-xl bg-white px-3.5 py-2.5 text-sm shadow-soft outline-none">
          <option value="">Novos e seminovos</option>
          <option value="novo">Novos</option>
          <option value="seminovo">Seminovos</option>
        </select>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fbeceb] px-4 py-3 text-sm text-danger">{error}</p>}
      {filtering && <p className="mt-3 text-xs text-ink-mute">Limpe a busca e o filtro para reorganizar a ordem de exibição.</p>}

      {items.length === 0 ? (
        <div className="mt-5 rounded-[20px] bg-white px-6 py-16 text-center shadow-soft">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Nenhum produto cadastrado.</h2>
          <p className="mt-1.5 text-sm text-ink-mute">Cadastre o primeiro para ele aparecer no catálogo.</p>
          <Link href="/admin/produtos/novo" className="btn btn-dark mt-6 !py-2.5 !text-sm">Novo produto</Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {visible.map((product) => {
            const index = items.findIndex((p) => p.id === product.id);
            return (
              <li
                key={product.id}
                draggable={!filtering}
                onDragStart={() => setDragId(product.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => { if (!filtering) e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); dropOn(product.id); }}
                className={`rounded-[18px] bg-white p-3 shadow-soft transition-opacity md:flex md:items-center md:gap-3 ${dragId === product.id ? "opacity-50" : ""}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="hidden items-center md:flex" aria-hidden="true">
                    <GripVertical size={16} className={filtering ? "text-transparent" : "cursor-grab text-[#c2c2be]"} />
                  </div>
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-canvas">
                    <span className="absolute inset-[10%] block">
                      <ProductImage src={product.images[0] ?? categoryArt(categories, product.category)} alt="" sizes="56px" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/produtos/${product.id}`} className="block truncate text-[15px] font-semibold tracking-[-0.01em] hover:text-accent">{product.name}</Link>
                    <p className="truncate text-xs text-ink-mute">
                      {product.brand} · {categoryLabel(categories, product.category)} · {product.condition ? CONDITION_LABELS[product.condition] : <span className="font-medium text-offer">Condição não informada</span>}
                      {product.hasDamage && <span className="font-medium text-danger"> · Com avaria</span>}
                    </p>
                    <p className="mt-0.5 text-[13px] font-medium">
                      {product.price === null ? <span className="font-normal text-ink-mute">Sem preço</span> : formatPrice(product.promoPrice ?? product.price)}
                      {product.promoPrice !== null && product.price !== null && (
                        <s className="ml-1.5 text-xs font-normal text-ink-mute">{formatPrice(product.price)}</s>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t border-line pt-3 md:mt-0 md:flex-nowrap md:border-0 md:pt-0">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <Switch label="Esgotado" checked={!product.available} onChange={(soldOut) => setFlag(product, "available", !soldOut)} />
                    {FLAGS.map(([flag, label]) => (
                      <Switch key={flag} label={label} checked={product[flag]} onChange={(value) => setFlag(product, flag, value)} />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button type="button" aria-label={`Subir ${product.name}`} disabled={filtering || pending || index === 0} onClick={() => move(index, -1)} className={arrow}><ArrowUp size={15} /></button>
                    <button type="button" aria-label={`Descer ${product.name}`} disabled={filtering || pending || index === items.length - 1} onClick={() => move(index, 1)} className={arrow}><ArrowDown size={15} /></button>
                    <Link href={`/admin/produtos/${product.id}`} aria-label={`Editar ${product.name}`} className={arrow}><Pencil size={14} /></Link>
                    <button type="button" aria-label={`Excluir ${product.name}`} onClick={() => askDelete(product)} className={`${arrow} hover:!bg-[#fbeceb] hover:!text-danger`}><Trash2 size={14} /></button>
                  </div>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="rounded-[18px] bg-white px-6 py-10 text-center text-sm text-ink-mute shadow-soft">Nenhum produto corresponde à busca.</li>}
        </ul>
      )}

      <dialog ref={dialog} className="modal" aria-labelledby="delete-title">
        <div className="p-6">
          <h2 id="delete-title" className="text-lg font-semibold tracking-[-0.015em]">Excluir produto?</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            <strong className="font-medium">{toDelete?.name}</strong> sairá do catálogo e as imagens enviadas serão apagadas. Esta ação não pode ser desfeita.
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
