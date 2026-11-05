import { useSyncExternalStore } from "react";
import { site } from "@/lib/site";

const noChange = () => () => {};

/**
 * Endereço do produto para a mensagem do WhatsApp. Sem domínio configurado, usa o
 * endereço pelo qual o site foi aberto. No servidor fica `site.url`, para não haver
 * diferença entre o HTML gerado e a primeira renderização no navegador.
 */
export function useProductUrl(slug: string) {
  const origin = useSyncExternalStore(
    noChange,
    () => (site.hasPublicUrl ? site.url : window.location.origin),
    () => site.url,
  );
  return `${origin}/produto/${slug}`;
}
