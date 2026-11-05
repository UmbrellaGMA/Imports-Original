"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImageAction } from "@/app/admin/actions";
import { ProductImage } from "@/components/store/ProductImage";
import { compressImage } from "./compressImage";

const MAX_IMAGES = 12;

export function ImageManager({ images, onChange, onBusyChange }: { images: string[]; onChange: (update: (current: string[]) => string[]) => void; onBusyChange: (busy: boolean) => void }) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | File[]) => {
    const files = Array.from(list).filter((file) => file.type.startsWith("image/")).slice(0, MAX_IMAGES - images.length);
    if (!files.length) return;
    setError(null);
    setUploading(files.length);
    onBusyChange(true);
    const problems: string[] = [];
    for (const file of files) {
      try {
        const form = new FormData();
        form.append("file", await compressImage(file));
        const result = await uploadImageAction(form);
        if (result.ok && result.url) {
          const { url } = result;
          onChange((current) => [...current, url]);
        } else if (!result.ok) {
          problems.push(`${file.name}: ${result.error}`);
        }
      } catch {
        problems.push(`${file.name}: não foi possível ler esta imagem.`);
      }
      setUploading((count) => count - 1);
    }
    onBusyChange(false);
    if (problems.length) setError(problems.join(" "));
  };

  const move = (index: number, offset: number) =>
    onChange((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + offset, 0, item);
      return next;
    });

  const control = "flex size-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white";

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((src, index) => (
          <li key={src} className="group relative aspect-square overflow-hidden rounded-2xl bg-canvas">
            <span className="absolute inset-[8%] block"><ProductImage src={src} alt={`Imagem ${index + 1}`} sizes="160px" /></span>
            {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-white">Capa</span>}
            <button type="button" aria-label={`Remover imagem ${index + 1}`} onClick={() => onChange((current) => current.filter((url) => url !== src))} className={`absolute right-1.5 top-1.5 ${control}`}><X size={13} /></button>
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
              <button type="button" aria-label={`Mover imagem ${index + 1} para a esquerda`} disabled={index === 0} onClick={() => move(index, -1)} className={`${control} disabled:invisible`}><ChevronLeft size={14} /></button>
              <button type="button" aria-label={`Mover imagem ${index + 1} para a direita`} disabled={index === images.length - 1} onClick={() => move(index, 1)} className={`${control} disabled:invisible`}><ChevronRight size={14} /></button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <li key={i} className="skeleton flex aspect-square items-center justify-center !rounded-2xl text-ink-mute">
            <Loader2 size={18} className="animate-spin" />
          </li>
        ))}
        {images.length + uploading < MAX_IMAGES && (
          <li className="aspect-square">
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); void addFiles(e.dataTransfer.files); }}
              className={`flex size-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-xs font-medium transition-colors ${dragOver ? "border-accent bg-accent-soft text-accent-strong" : "border-[#c9c9c5] text-ink-mute hover:border-ink hover:text-ink"}`}
            >
              <ImagePlus size={20} strokeWidth={1.6} />
              Adicionar
            </button>
          </li>
        )}
      </ul>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Selecionar imagens"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-2 text-xs text-ink-mute">JPG, PNG ou WebP. Até {MAX_IMAGES} imagens, otimizadas automaticamente. A primeira é a capa.</p>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
