import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { uploadsDir } from "@/lib/catalog/local";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Serve as imagens enviadas no modo demonstração. */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safe = basename(file);
  const type = TYPES[extname(safe).toLowerCase()];
  if (!type || safe !== file) return new Response("Não encontrado", { status: 404 });
  try {
    const data = await readFile(join(uploadsDir(), safe));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
