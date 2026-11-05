"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { clampPercent, coverStyle, DEFAULT_COVER, MAX_COVER_ZOOM, type CoverAdjust } from "@/lib/cover";

const KEY_STEP = 2;

/** O quadro é quadrado, como o card em telas maiores. */
export function CoverEditor({ src, value, onApply, onClose }: { src: string; value: CoverAdjust; onApply: (value: CoverAdjust) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const [draft, setDraft] = useState(value);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  /** Quanto a imagem sobra além do quadro, em pixels: é o curso disponível para arrastar. */
  const overflow = () => {
    const side = frame.current?.clientWidth ?? 0;
    if (!natural || !side) return { x: 0, y: 0 };
    const scale = Math.max(side / natural.width, side / natural.height) * draft.zoom;
    return { x: natural.width * scale - side, y: natural.height * scale - side };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerX: event.clientX, pointerY: event.clientY, x: draft.x, y: draft.y };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const spare = overflow();
    const { pointerX, pointerY, x, y } = drag.current;
    // Arrastar a foto para a direita revela o lado esquerdo dela, por isso o sinal negativo.
    setDraft((current) => ({
      ...current,
      x: spare.x > 0.5 ? clampPercent(x - ((event.clientX - pointerX) / spare.x) * 100) : current.x,
      y: spare.y > 0.5 ? clampPercent(y - ((event.clientY - pointerY) / spare.y) * 100) : current.y,
    }));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setDraft((current) => ({ ...current, x: clampPercent(current.x + move[0]), y: clampPercent(current.y + move[1]) }));
  };

  return (
    <dialog ref={dialog} className="modal" aria-labelledby="cover-title" onClose={onClose}>
      <div className="p-6">
        <h2 id="cover-title" className="text-lg font-semibold tracking-[-0.015em]">Ajustar foto da capa</h2>
        <p className="mt-1 text-sm text-ink-soft">Arraste a foto e use o zoom para escolher o que aparece no card.</p>

        <div
          ref={frame}
          role="group"
          tabIndex={0}
          aria-label="Posição da foto. Use as setas do teclado para mover."
          data-testid="cover-frame"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          onKeyDown={onKeyDown}
          className="relative mt-4 aspect-square w-full cursor-grab touch-none select-none overflow-hidden rounded-[20px] bg-canvas active:cursor-grabbing"
        >
          <Image
            src={src}
            alt="Foto da capa"
            fill
            unoptimized
            draggable={false}
            sizes="400px"
            onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            className="pointer-events-none object-cover"
            style={coverStyle(draft)}
          />
        </div>

        <label className="mt-4 block text-[13px] font-medium">
          Zoom
          <input
            type="range"
            min={1}
            max={MAX_COVER_ZOOM}
            step={0.05}
            value={draft.zoom}
            onChange={(event) => setDraft({ ...draft, zoom: Number(event.target.value) })}
            className="mt-1.5 block w-full accent-[var(--color-accent)]"
          />
        </label>
        <p className="mt-2 text-xs text-ink-mute">No celular, o card é um pouco mais largo: deixe o produto perto do centro.</p>

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <button type="button" onClick={() => setDraft(DEFAULT_COVER)} className="btn btn-outline !px-4 !py-2 !text-sm">Centralizar</button>
          <div className="flex gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-outline !px-4 !py-2 !text-sm">Cancelar</button>
            <button
              type="button"
              onClick={() => {
                // Arredonda para não guardar casas decimais que ninguém percebe.
                onApply({ x: Math.round(draft.x * 10) / 10, y: Math.round(draft.y * 10) / 10, zoom: Math.round(draft.zoom * 100) / 100 });
                dialog.current?.close();
              }}
              className="btn btn-dark !px-4 !py-2 !text-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
