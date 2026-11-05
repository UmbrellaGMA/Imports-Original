export type ProductCondition = "novo" | "seminovo";
export type Conservation = "excelente" | "muito-bom" | "bom" | "regular";

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
};

export const CONSERVATION_OPTIONS: Array<{ value: Conservation; label: string; hint: string }> = [
  { value: "excelente", label: "Excelente", hint: "Sem marcas de uso visíveis." },
  { value: "muito-bom", label: "Muito bom", hint: "Marcas leves, percebidas só de perto." },
  { value: "bom", label: "Bom", hint: "Marcas de uso visíveis, sem afetar o funcionamento." },
  { value: "regular", label: "Regular", hint: "Marcas evidentes de uso." },
];

export const conservationLabel = (value: Conservation) =>
  CONSERVATION_OPTIONS.find((option) => option.value === value)?.label ?? value;

/** Atalhos do cadastro. Outros itens podem ser digitados. */
export const INCLUDED_PRESETS = ["Caixa original", "Carregador", "Cabo", "Fone de ouvido", "Capa", "Película", "Manual", "Nota fiscal"];
