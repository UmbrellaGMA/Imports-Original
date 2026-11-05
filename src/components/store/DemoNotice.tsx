"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function DemoNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <p
      role="note"
      className="fixed bottom-[72px] left-3 z-30 flex items-center gap-1.5 rounded-full bg-ink/85 py-1 pl-3 pr-1 text-[11px] font-medium text-white backdrop-blur-md lg:bottom-4 lg:left-4"
    >
      Demonstração · dados de exemplo
      <button type="button" aria-label="Fechar aviso" onClick={() => setOpen(false)} className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-white/20">
        <X size={11} strokeWidth={2.5} />
      </button>
    </p>
  );
}
