import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);
const money = z.number().min(0, "O preço não pode ser negativo.").max(10_000_000).nullable();
const imageUrl = z
  .string()
  .max(1000)
  .refine((url) => url.startsWith("/") ? !url.startsWith("//") : url.startsWith("https://"), "Imagem inválida.");

export const productSchema = z
  .object({
    name: text(160).min(2, "Informe o nome do produto."),
    brand: text(60).min(1, "Informe a marca."),
    category: z.string().min(1, "Selecione uma categoria.").max(80),
    description: text(5000),
    additionalInfo: text(3000),
    price: money,
    promoPrice: money,
    specs: z.array(z.object({ label: text(80).min(1), value: text(300).min(1) })).max(60),
    colors: z
      .array(
        z.object({
          name: text(40).min(1),
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida."),
        }),
      )
      .max(24),
    capacities: z.array(text(30).min(1)).max(24),
    images: z.array(imageUrl).max(12, "Use no máximo 12 imagens."),
    featured: z.boolean(),
    isNew: z.boolean(),
    available: z.boolean(),
    condition: z.enum(["novo", "seminovo"], { message: "Informe se o produto é novo ou seminovo." }).nullable(),
    conservation: z.enum(["excelente", "muito-bom", "bom", "regular"]).nullable(),
    batteryHealth: z.number("Bateria: use um número de 0 a 100.").int("Bateria: use um número inteiro.").min(0, "Bateria: use um número de 0 a 100.").max(100, "Bateria: use um número de 0 a 100.").nullable(),
    sealed: z.boolean(),
    hasDamage: z.boolean().nullable(),
    damageNotes: text(1000),
    repairNotes: text(1000),
    warranty: text(200),
    included: z.array(text(60).min(1)).max(24),
  })
  .superRefine((value, ctx) => {
    if (value.condition === null) {
      ctx.addIssue({ code: "custom", path: ["condition"], message: "Informe se o produto é novo ou seminovo." });
    }
    if (value.condition === "seminovo") {
      if (value.conservation === null) ctx.addIssue({ code: "custom", path: ["conservation"], message: "Informe o estado de conservação." });
      if (value.hasDamage === null) ctx.addIssue({ code: "custom", path: ["hasDamage"], message: "Informe se o produto tem avaria." });
    }
    if (value.hasDamage && !value.damageNotes) {
      ctx.addIssue({ code: "custom", path: ["damageNotes"], message: "Descreva a avaria para o cliente saber o que esperar." });
    }
    if (value.promoPrice !== null) {
      if (value.price === null) {
        ctx.addIssue({ code: "custom", path: ["promoPrice"], message: "Informe também o preço normal." });
      } else if (value.promoPrice >= value.price) {
        ctx.addIssue({ code: "custom", path: ["promoPrice"], message: "O preço promocional deve ser menor que o preço normal." });
      }
    }
  })
  // Descarta o que não se aplica, como o estado de conservação preenchido antes de mudar para "novo".
  .transform((value) => {
    const used = value.condition === "seminovo";
    const hasDamage = value.hasDamage ?? false;
    return {
      ...value,
      hasDamage,
      conservation: used ? value.conservation : null,
      batteryHealth: used ? value.batteryHealth : null,
      sealed: used ? false : value.sealed,
      repairNotes: used ? value.repairNotes : "",
      damageNotes: hasDamage ? value.damageNotes : "",
    };
  });

export const categorySchema = z.object({
  label: text(60).min(2, "Informe o nome da categoria."),
  image: imageUrl.nullable(),
});

// ─── Conteúdo do site ─────────────────────────────────────────────────────
// Links só podem ser internos ou https: bloqueia javascript: e afins.
const href = z
  .string()
  .trim()
  .max(500)
  .refine((url) => (url.startsWith("/") && !url.startsWith("//")) || /^https?:\/\//.test(url), "Use um link que comece com / ou https://.");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.");
const title = (max = 160) => text(max).min(1, "Preencha o título.");
const link = z.object({ label: text(60).min(1, "Preencha o nome do link."), href });
const media = { image: imageUrl.nullable(), imageMode: z.enum(["contain", "cover"]), art: z.enum(["devices", "iphones", "rhythm"]).nullable() };
const base = { id: z.string().min(1).max(40), visible: z.boolean() };

const sectionSchema = z.discriminatedUnion("type", [
  z.object({ ...base, ...media, type: z.literal("hero"), title: title(), text: text(600), ctaLabel: text(60), ctaHref: href, background: hex }),
  z.object({ ...base, type: z.literal("categories"), title: title() }),
  z.object({
    ...base,
    type: z.literal("shelf"),
    title: title(),
    note: text(200),
    source: z.enum(["featured", "new", "offers", "all", "categories", "condition-new", "condition-used"]),
    categories: z.array(z.string().max(80)).max(30),
    linkLabel: text(40),
    tone: z.enum(["white", "canvas"]),
  }),
  z.object({ ...base, ...media, type: z.literal("banner"), layout: z.enum(["center", "split"]), title: title(), text: text(600), buttons: z.array(link).max(4), background: hex }),
  z.object({
    ...base,
    type: z.literal("tiles"),
    title: title(),
    text: text(600),
    background: hex,
    tiles: z.array(z.object({ id: z.string().min(1).max(40), title: title(60), href, background: hex, image: imageUrl.nullable() })).max(12),
  }),
  z.object({
    ...base,
    type: z.literal("steps"),
    title: title(),
    steps: z.array(z.object({ title: title(80), text: text(300) })).max(8),
    ctaLabel: text(60),
  }),
]);

export const contentSchema = z.object({
  brand: z.object({ name: text(60).min(2, "Informe o nome da loja."), logoUrl: imageUrl.nullable(), faviconUrl: imageUrl.nullable() }),
  seo: z.object({ title: title(120), description: text(300) }),
  contact: z.object({
    whatsapp: z.string().trim().regex(/^\d{10,15}$/, "WhatsApp: use só números, com DDI e DDD (ex.: 5513999999999)."),
    message: text(500).min(1, "Preencha a mensagem do WhatsApp."),
    instagram: z.string().trim().max(300).refine((url) => url === "" || url.startsWith("https://"), "Instagram: use o link completo, com https://."),
    email: z.union([z.literal(""), z.email("E-mail inválido.")]),
    hours: text(200),
    address: text(300),
  }),
  nav: z.array(link).max(14),
  footer: z.object({
    navigationTitle: text(40),
    categoriesTitle: text(40),
    contactTitle: text(40),
    socialTitle: text(40),
    contactNote: text(200),
    legalNote: text(500),
  }),
  home: z.array(sectionSchema).max(40),
});

/** Detecta o tipo real pelo conteúdo do arquivo, sem confiar na extensão enviada. */
export function sniffImage(data: Buffer): { extension: string; contentType: string } | null {
  if (data.length > 12) {
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return { extension: "jpg", contentType: "image/jpeg" };
    if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { extension: "png", contentType: "image/png" };
    if (data.toString("latin1", 0, 4) === "RIFF" && data.toString("latin1", 8, 12) === "WEBP") return { extension: "webp", contentType: "image/webp" };
  }
  return null;
}
