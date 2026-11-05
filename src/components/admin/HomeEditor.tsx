"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveContentAction } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";
import {
  moveItem,
  newId,
  newSection,
  SECTION_LABELS,
  type ArtKey,
  type BannerSection,
  type HeroSection,
  type HomeSection,
  type SectionType,
  type ShelfSource,
} from "@/lib/content";
import { ImageField } from "./ImageField";
import { addButton, ColorField, Field, iconButton, input, LinkInput, LinkSuggestions, removeButton, SaveBar } from "./ui";
import { useUnsavedWarning } from "./useUnsavedWarning";

const LINKS = "home-links";

const SOURCES: Array<[ShelfSource, string]> = [
  ["featured", "Produtos marcados como destaque"],
  ["new", "Produtos marcados como lançamento"],
  ["offers", "Produtos com preço promocional"],
  ["condition-new", "Somente produtos novos"],
  ["condition-used", "Somente produtos seminovos"],
  ["all", "Todos os produtos"],
  ["categories", "Categorias escolhidas"],
];

const ART_OPTIONS: Record<"hero" | "center" | "split", Array<[ArtKey, string]>> = {
  hero: [["devices", "Ilustração de dispositivos"], ["iphones", "Ilustração de iPhones"]],
  center: [["iphones", "Ilustração de iPhones"], ["devices", "Ilustração de dispositivos"]],
  split: [["rhythm", "Ilustração de MacBook, iPad e relógio"]],
};

const ADDABLE: SectionType[] = ["banner", "shelf", "tiles", "steps", "categories", "hero"];

type MediaChange = Partial<Pick<HeroSection, "image" | "imageMode" | "art" | "background">>;
type Busy = (busy: boolean) => void;

function move<T>(list: T[], index: number, offset: number) {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + offset, 0, item);
  return next;
}

/** Imagem e ilustração, comuns ao banner principal e aos banners. */
function MediaFields({ section, onChange, onBusy }: { section: HeroSection | BannerSection; onChange: (change: MediaChange) => void; onBusy: Busy }) {
  const options = section.type === "hero" ? ART_OPTIONS.hero : ART_OPTIONS[section.layout];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ImageField label="Imagem" value={section.image} onChange={(image) => onChange({ image })} onBusyChange={onBusy} hint="Com uma imagem enviada, a ilustração deixa de aparecer." />
      <div className="space-y-4">
        {section.image ? (
          <Field label="Como exibir a imagem">
            <select value={section.imageMode} onChange={(e) => onChange({ imageMode: e.target.value as HeroSection["imageMode"] })} className={input}>
              <option value="contain">Inteira, abaixo do texto</option>
              <option value="cover">De fundo, cobrindo a seção</option>
            </select>
          </Field>
        ) : (
          <Field label="Ilustração">
            <select value={section.art ?? ""} onChange={(e) => onChange({ art: (e.target.value || null) as ArtKey | null })} className={input}>
              <option value="">Nenhuma</option>
              {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
        )}
        <ColorField label="Cor de fundo" value={section.background} onChange={(background) => onChange({ background })} />
      </div>
    </div>
  );
}

function SectionFields({ section, categories, onChange, onBusy }: { section: HomeSection; categories: Category[]; onChange: (change: Partial<HomeSection>) => void; onBusy: Busy }) {
  const titleField = (
    <Field label="Título">
      <input value={section.title} onChange={(e) => onChange({ title: e.target.value })} className={input} />
    </Field>
  );

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-4">
          {titleField}
          <Field label="Texto">
            <textarea rows={2} value={section.text} onChange={(e) => onChange({ text: e.target.value } as Partial<HomeSection>)} className={`${input} resize-y`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto do botão" hint="Em branco, o botão não aparece.">
              <input value={section.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value } as Partial<HomeSection>)} className={input} />
            </Field>
            <Field label="Link do botão">
              <LinkInput value={section.ctaHref} listId={LINKS} onChange={(ctaHref) => onChange({ ctaHref } as Partial<HomeSection>)} />
            </Field>
          </div>
          <MediaFields section={section} onChange={onChange as (change: MediaChange) => void} onBusy={onBusy} />
        </div>
      );

    case "categories":
      return (
        <div className="space-y-2">
          {titleField}
          <p className="text-xs text-ink-mute">Os itens desta seção vêm da tela Categorias.</p>
        </div>
      );

    case "shelf":
      return (
        <div className="space-y-4">
          {titleField}
          <Field label="Subtítulo">
            <input value={section.note} onChange={(e) => onChange({ note: e.target.value } as Partial<HomeSection>)} className={input} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Quais produtos mostrar">
              <select value={section.source} onChange={(e) => onChange({ source: e.target.value as ShelfSource } as Partial<HomeSection>)} className={input}>
                {SOURCES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Texto do link" hint="Em branco, o link não aparece.">
              <input value={section.linkLabel} onChange={(e) => onChange({ linkLabel: e.target.value } as Partial<HomeSection>)} className={input} />
            </Field>
            <Field label="Fundo">
              <select value={section.tone} onChange={(e) => onChange({ tone: e.target.value as "white" | "canvas" } as Partial<HomeSection>)} className={input}>
                <option value="white">Branco</option>
                <option value="canvas">Cinza claro</option>
              </select>
            </Field>
          </div>
          {section.source === "categories" && (
            <fieldset>
              <legend className="text-[13px] font-medium">Categorias da vitrine</legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categories.map((category) => {
                  const active = section.categories.includes(category.slug);
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ categories: active ? section.categories.filter((s) => s !== category.slug) : [...section.categories, category.slug] } as Partial<HomeSection>)}
                      className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? "bg-ink text-white" : "bg-canvas text-ink-soft hover:bg-[#ebebe8]"}`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
          <p className="text-xs text-ink-mute">Uma vitrine sem produtos fica oculta no site até haver algo para mostrar.</p>
        </div>
      );

    case "banner":
      return (
        <div className="space-y-4">
          {titleField}
          <Field label="Texto">
            <textarea rows={2} value={section.text} onChange={(e) => onChange({ text: e.target.value } as Partial<HomeSection>)} className={`${input} resize-y`} />
          </Field>
          <Field label="Disposição">
            <select
              value={section.layout}
              onChange={(e) => {
                const layout = e.target.value as BannerSection["layout"];
                // Cada ilustração foi desenhada para uma disposição.
                onChange({ layout, art: ART_OPTIONS[layout].some(([value]) => value === section.art) ? section.art : null } as Partial<HomeSection>);
              }}
              className={input}
            >
              <option value="center">Texto centralizado</option>
              <option value="split">Texto ao lado da imagem</option>
            </select>
          </Field>
          <MediaFields section={section} onChange={onChange as (change: MediaChange) => void} onBusy={onBusy} />
          <div>
            <p className="text-[13px] font-medium">Botões</p>
            <ul className="mt-2 space-y-2">
              {section.buttons.map((button, index) => {
                const setButton = (change: Partial<typeof button>) =>
                  onChange({ buttons: section.buttons.map((b, i) => (i === index ? { ...b, ...change } : b)) } as Partial<HomeSection>);
                return (
                  <li key={index} className="flex items-start gap-2">
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                      <input aria-label={`Texto do botão ${index + 1}`} placeholder="Texto" value={button.label} onChange={(e) => setButton({ label: e.target.value })} className={input} />
                      <LinkInput ariaLabel={`Link do botão ${index + 1}`} value={button.href} listId={LINKS} onChange={(href) => setButton({ href })} />
                    </div>
                    <button type="button" aria-label={`Remover botão ${index + 1}`} onClick={() => onChange({ buttons: section.buttons.filter((_, i) => i !== index) } as Partial<HomeSection>)} className={`${removeButton} mt-0.5`}><X size={15} /></button>
                  </li>
                );
              })}
            </ul>
            {section.buttons.length < 4 && (
              <button type="button" onClick={() => onChange({ buttons: [...section.buttons, { label: "", href: "/catalogo" }] } as Partial<HomeSection>)} className={addButton}><Plus size={14} />Adicionar botão</button>
            )}
          </div>
        </div>
      );

    case "tiles":
      return (
        <div className="space-y-4">
          {titleField}
          <Field label="Texto">
            <textarea rows={2} value={section.text} onChange={(e) => onChange({ text: e.target.value } as Partial<HomeSection>)} className={`${input} resize-y`} />
          </Field>
          <ColorField label="Cor de fundo" value={section.background} onChange={(background) => onChange({ background } as Partial<HomeSection>)} />
          <div>
            <p className="text-[13px] font-medium">Blocos</p>
            <ul className="mt-2 space-y-3">
              {section.tiles.map((tile, index) => {
                const setTile = (change: Partial<typeof tile>) =>
                  onChange({ tiles: section.tiles.map((t, i) => (i === index ? { ...t, ...change } : t)) } as Partial<HomeSection>);
                return (
                  <li key={tile.id} className="rounded-2xl border border-line p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-medium text-ink-mute">Bloco {index + 1}</p>
                      <div className="flex items-center gap-0.5">
                        <button type="button" aria-label={`Subir bloco ${index + 1}`} disabled={index === 0} onClick={() => onChange({ tiles: move(section.tiles, index, -1) } as Partial<HomeSection>)} className={iconButton}><ArrowUp size={14} /></button>
                        <button type="button" aria-label={`Descer bloco ${index + 1}`} disabled={index === section.tiles.length - 1} onClick={() => onChange({ tiles: move(section.tiles, index, 1) } as Partial<HomeSection>)} className={iconButton}><ArrowDown size={14} /></button>
                        <button type="button" aria-label={`Remover bloco ${index + 1}`} onClick={() => onChange({ tiles: section.tiles.filter((_, i) => i !== index) } as Partial<HomeSection>)} className={`${iconButton} hover:!bg-[#fbeceb] hover:!text-danger`}><X size={14} /></button>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <Field label="Título"><input value={tile.title} onChange={(e) => setTile({ title: e.target.value })} className={input} /></Field>
                      <Field label="Link"><LinkInput value={tile.href} listId={LINKS} onChange={(href) => setTile({ href })} /></Field>
                      <ImageField label="Imagem" value={tile.image} onChange={(image) => setTile({ image })} onBusyChange={onBusy} />
                      <ColorField label="Cor do bloco" value={tile.background} onChange={(background) => setTile({ background })} />
                    </div>
                  </li>
                );
              })}
            </ul>
            {section.tiles.length < 12 && (
              <button type="button" onClick={() => onChange({ tiles: [...section.tiles, { id: newId(), title: "Novo bloco", href: "/catalogo", background: "#ffffff", image: null }] } as Partial<HomeSection>)} className={addButton}><Plus size={14} />Adicionar bloco</button>
            )}
          </div>
        </div>
      );

    case "steps":
      return (
        <div className="space-y-4">
          {titleField}
          <div>
            <p className="text-[13px] font-medium">Passos</p>
            <ul className="mt-2 space-y-2">
              {section.steps.map((step, index) => {
                const setStep = (change: Partial<typeof step>) =>
                  onChange({ steps: section.steps.map((s, i) => (i === index ? { ...s, ...change } : s)) } as Partial<HomeSection>);
                return (
                  <li key={index} className="flex items-start gap-2">
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[2fr_3fr]">
                      <input aria-label={`Título do passo ${index + 1}`} placeholder="Título" value={step.title} onChange={(e) => setStep({ title: e.target.value })} className={input} />
                      <input aria-label={`Texto do passo ${index + 1}`} placeholder="Texto" value={step.text} onChange={(e) => setStep({ text: e.target.value })} className={input} />
                    </div>
                    <button type="button" aria-label={`Remover passo ${index + 1}`} onClick={() => onChange({ steps: section.steps.filter((_, i) => i !== index) } as Partial<HomeSection>)} className={`${removeButton} mt-0.5`}><X size={15} /></button>
                  </li>
                );
              })}
            </ul>
            {section.steps.length < 8 && (
              <button type="button" onClick={() => onChange({ steps: [...section.steps, { title: "", text: "" }] } as Partial<HomeSection>)} className={addButton}><Plus size={14} />Adicionar passo</button>
            )}
          </div>
          <Field label="Texto do botão de WhatsApp" hint="Em branco, o botão não aparece.">
            <input value={section.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value } as Partial<HomeSection>)} className={input} />
          </Field>
        </div>
      );
  }
}

export function HomeEditor({ initial, categories }: { initial: HomeSection[]; categories: Category[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [lastSaved, setLastSaved] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<SectionType>("banner");
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);

  // Soltar no lugar de onde saiu não muda nada, então não há linha a indicar.
  const showDrop = dragIndex !== null && dropAt !== null && dropAt !== dragIndex && dropAt !== dragIndex + 1;

  const endDrag = () => {
    setDragIndex(null);
    setDropAt(null);
  };

  const dirty = JSON.stringify(sections) !== JSON.stringify(lastSaved);
  useUnsavedWarning(dirty);

  const patch = (id: string, change: Partial<HomeSection>) =>
    setSections((current) => current.map((s) => (s.id === id ? ({ ...s, ...change } as HomeSection) : s)));

  const onBusy: Busy = (value) => setBusy((count) => count + (value ? 1 : -1));

  const add = () => {
    const section = newSection(adding);
    setSections((current) => [...current, section]);
    setOpen(section.id);
  };

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveContentAction({ home: sections });
      if (result.ok) {
        setLastSaved(sections);
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mt-7">
      <LinkSuggestions id={LINKS} categories={categories} />
      <ul
        className="space-y-2"
        // Fica na lista para também aceitar a soltura no vão entre duas seções.
        onDragOver={(e) => { if (dragIndex !== null) e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          if (showDrop) setSections(moveItem(sections, dragIndex, dropAt));
          endDrag();
        }}
      >
        {sections.map((section, index) => {
          const expanded = open === section.id;
          const dropLine = "pointer-events-none absolute inset-x-2 h-[3px] rounded-full bg-accent";
          return (
            <li
              key={section.id}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.dataTransfer.dropEffect = "move";
                const box = e.currentTarget.getBoundingClientRect();
                setDropAt(e.clientY < box.top + box.height / 2 ? index : index + 1);
              }}
              className={`relative rounded-[18px] bg-white shadow-soft transition-opacity ${dragIndex === index ? "opacity-40" : section.visible ? "" : "opacity-70"}`}
            >
              {showDrop && dropAt === index && <span aria-hidden="true" className={`${dropLine} -top-[5.5px]`} />}
              {showDrop && dropAt === sections.length && index === sections.length - 1 && <span aria-hidden="true" className={`${dropLine} -bottom-[5.5px]`} />}
              {/* Só o cabeçalho arrasta: nos campos abertos, o mouse precisa selecionar texto. */}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", section.title);
                  const row = e.currentTarget.closest("li");
                  if (row) e.dataTransfer.setDragImage(row, e.clientX - row.getBoundingClientRect().left, e.clientY - row.getBoundingClientRect().top);
                  setDragIndex(index);
                }}
                onDragEnd={endDrag}
                data-testid="section-header"
                className="flex items-center gap-1.5 p-2.5 pl-2"
              >
                <span aria-hidden="true" title="Arraste para mudar a posição" className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-[#b5b5b1] transition-colors hover:text-ink active:cursor-grabbing">
                  <GripVertical size={16} />
                </span>
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : section.id)} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left">
                  <ChevronDown size={16} className={`shrink-0 text-ink-mute transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">{section.title || "Sem título"}</span>
                    <span className="block text-xs text-ink-mute">{SECTION_LABELS[section.type]}{section.visible ? "" : " · oculta"}</span>
                  </span>
                </button>
                <button type="button" aria-label={section.visible ? `Ocultar ${section.title}` : `Mostrar ${section.title}`} title={section.visible ? "Ocultar no site" : "Mostrar no site"} onClick={() => patch(section.id, { visible: !section.visible })} className={iconButton}>
                  {section.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button type="button" aria-label={`Subir ${section.title}`} disabled={index === 0} onClick={() => setSections(move(sections, index, -1))} className={iconButton}><ArrowUp size={15} /></button>
                <button type="button" aria-label={`Descer ${section.title}`} disabled={index === sections.length - 1} onClick={() => setSections(move(sections, index, 1))} className={iconButton}><ArrowDown size={15} /></button>
                <button
                  type="button"
                  aria-label={`Excluir ${section.title}`}
                  onClick={() => { if (window.confirm(`Excluir a seção "${section.title}"? Ela só sai do site depois de salvar.`)) setSections(sections.filter((s) => s.id !== section.id)); }}
                  className={`${iconButton} hover:!bg-[#fbeceb] hover:!text-danger`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {expanded && (
                <div className="border-t border-line p-4 md:p-5">
                  <SectionFields section={section} categories={categories} onChange={(change) => patch(section.id, change)} onBusy={onBusy} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-2 rounded-[18px] bg-white p-4 shadow-soft sm:flex-row sm:items-center">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Tipo de seção</span>
          <select value={adding} onChange={(e) => setAdding(e.target.value as SectionType)} className={input}>
            {ADDABLE.map((type) => <option key={type} value={type}>{SECTION_LABELS[type]}</option>)}
          </select>
        </label>
        <button type="button" onClick={add} className="btn btn-outline !px-4 !py-2.5 !text-sm"><Plus size={16} />Adicionar seção</button>
      </div>

      <SaveBar dirty={dirty} pending={pending} busy={busy > 0} error={error} saved={saved} onSave={save} />
    </div>
  );
}
