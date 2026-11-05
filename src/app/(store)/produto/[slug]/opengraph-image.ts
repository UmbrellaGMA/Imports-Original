import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { getCategories, getProductBySlug } from "@/lib/catalog";
import { categoryArt } from "@/lib/categories";
import { site } from "@/lib/site";

// Imagem da prévia do link no WhatsApp e em outras redes. As fotos ficam guardadas em WebP,
// que nem todas exibem; aqui saem em JPEG, centralizadas sobre o fundo da loja.
export const alt = "Foto do produto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";
export const revalidate = 60;

const BACKGROUND = "#f5f5f3";
const MARGIN = 30;

async function loadImage(source: string) {
  // As ilustrações estão no próprio projeto. Durante a geração do site, o domínio pode ainda não responder.
  if (source.startsWith("/art/")) {
    try {
      return await readFile(join(/* turbopackIgnore: true */ process.cwd(), "public", source));
    } catch {
      // No servidor publicado, a pasta public não acompanha a função: cai na busca abaixo.
    }
  }
  const response = await fetch(new URL(source, site.url), { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Imagem respondeu ${response.status}: ${source}`);
  return Buffer.from(await response.arrayBuffer());
}

async function compose(source: string | null) {
  const canvas = sharp({ create: { ...size, channels: 3, background: BACKGROUND } });
  if (source) {
    try {
      const picture = await sharp(await loadImage(source), { density: 300 })
        .resize(size.width - MARGIN * 2, size.height - MARGIN * 2, { fit: "inside" })
        .png()
        .toBuffer();
      canvas.composite([{ input: picture, gravity: "center" }]);
    } catch (error) {
      // Sem a foto, a prévia ainda sai com o título do produto.
      console.error(error);
    }
  }
  return canvas.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, categories] = await Promise.all([getProductBySlug((await params).slug), getCategories()]);
  const source = product ? (product.images[0] ?? categoryArt(categories, product.category)) : null;
  return new Response(new Uint8Array(await compose(source)), { headers: { "Content-Type": contentType } });
}
