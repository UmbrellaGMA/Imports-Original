const clean = (value: string | undefined) => value?.trim() || undefined;

export const site = {
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  hasPublicUrl: Boolean(clean(process.env.NEXT_PUBLIC_SITE_URL)),
};

export const whatsappUrl = (number: string, message: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export function productMessage(
  name: string,
  options: { color?: string; capacity?: string; url?: string; condition?: string } = {},
) {
  const lines = [`Olá! Gostaria de consultar a disponibilidade de: *${name}*`];
  if (options.condition) lines.push(`Condição: ${options.condition}`);
  if (options.capacity) lines.push(`Capacidade: ${options.capacity}`);
  if (options.color) lines.push(`Cor: ${options.color}`);
  if (options.url) lines.push(options.url);
  return lines.join("\n");
}
