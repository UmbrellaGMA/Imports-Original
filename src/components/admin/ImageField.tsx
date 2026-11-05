"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImageAction } from "@/app/admin/actions";
import { ProductImage } from "@/components/store/ProductImage";
import { compressImage, type CompressOptions } from "./compressImage";

type ImageFieldProps = {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
  hint?: string;
  compress?: CompressOptions;
  /** Fundo da prévia, para conferir um logo claro ou escuro. */
  previewClass?: string;
};

/** Campo de uma única imagem: logo, favicon, banner ou categoria. */
export function ImageField({ label, value, onChange, onBusyChange, hint, compress, previewClass = "bg-canvas" }: ImageFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError(null);
    setBusy(true);
    onBusyChange?.(true);
    try {
      const form = new FormData();
      form.append("file", await compressImage(file, compress));
      const result = await uploadImageAction(form);
      if (result.ok && result.url) onChange(result.url);
      else if (!result.ok) setError(result.error);
    } catch {
      setError("Não foi possível ler esta imagem.");
    }
    setBusy(false);
    onBusyChange?.(false);
  };

  return (
    <div>
      <p className="text-[13px] font-medium">{label}</p>
      <div className="mt-1.5 flex items-center gap-3">
        <div className={`relative size-20 shrink-0 overflow-hidden rounded-2xl ${previewClass}`}>
          {value && <span className="absolute inset-[8%] block"><ProductImage src={value} alt={label} sizes="80px" /></span>}
          {busy && <span className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 size={18} className="animate-spin text-ink-mute" /></span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" disabled={busy} onClick={() => picker.current?.click()} className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[#ebebe8]">
            <ImagePlus size={14} />
            {value ? "Trocar" : "Enviar imagem"}
          </button>
          {value && (
            <button type="button" disabled={busy} onClick={() => onChange(null)} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium text-ink-mute transition-colors hover:bg-[#fbeceb] hover:text-danger">
              <X size={14} />
              Remover
            </button>
          )}
        </div>
      </div>
      <input
        ref={picker}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Selecionar arquivo: ${label}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-ink-mute">{hint}</p>}
      {error && <p role="alert" className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
