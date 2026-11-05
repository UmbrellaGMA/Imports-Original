/** Enquadramento da foto de capa no card: posição em % e zoom. */
export type CoverAdjust = { x: number; y: number; zoom: number };

export const DEFAULT_COVER: CoverAdjust = { x: 50, y: 50, zoom: 1 };
export const MAX_COVER_ZOOM = 3;

export const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Estilo para uma imagem com `object-fit: cover`. Usar o mesmo ponto na posição e na
 * origem do zoom faz o deslocamento ser sempre (quadro - imagem) × x%, em qualquer quadro.
 */
export function coverStyle(adjust: CoverAdjust = DEFAULT_COVER) {
  const position = `${adjust.x}% ${adjust.y}%`;
  return { objectPosition: position, transformOrigin: position, transform: `scale(${adjust.zoom})` };
}
