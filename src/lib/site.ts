const clean = (value: string | undefined) => value?.trim() || undefined;

export const site = {
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  hasPublicUrl: Boolean(clean(process.env.NEXT_PUBLIC_SITE_URL)),
};

export const whatsappUrl = (number: string, message: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export function productMessage(
  name: string,
  options: { color?: string; capacity?: string; url?: string; condition?: string; soldOut?: boolean } = {},
) {
  const details = [`*${name}*`];
  if (options.condition) details.push(`Condição: ${options.condition}`);
  if (options.capacity) details.push(`Capacidade: ${options.capacity}`);
  if (options.color) details.push(`Cor: ${options.color}`);

  // Blocos separados por linha em branco, com o link sozinho no fim.
  const blocks = options.soldOut
    ? ["Olá! Vi no site que este produto está esgotado:", details.join("\n"), "Pode me avisar quando ele voltar?"]
    : ["Olá! Tenho interesse neste produto:", details.join("\n"), "Ele está disponível?"];
  if (options.url) blocks.push(options.url);
  return blocks.join("\n\n");
}
