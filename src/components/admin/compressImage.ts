const MAX_SIDE = 2000;
const QUALITY = 0.86;

export type CompressOptions = { maxSide?: number; png?: boolean };

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

/** Reduz a foto no navegador antes do envio. Retorna um arquivo WebP, ou JPEG onde não houver suporte. */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, (options.maxSide ?? MAX_SIDE) / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível processar a imagem.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Favicon: PNG é o formato aceito por todos os navegadores e mantém a transparência.
  if (options.png) {
    const png = await toBlob(canvas, "image/png");
    if (!png) throw new Error("Não foi possível processar a imagem.");
    return new File([png], "imagem.png", { type: "image/png" });
  }

  const webp = await toBlob(canvas, "image/webp");
  if (webp?.type === "image/webp") return new File([webp], "imagem.webp", { type: webp.type });

  // Navegadores sem codificador WebP: JPEG não tem transparência, então o fundo vira branco.
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const jpeg = await toBlob(canvas, "image/jpeg");
  if (!jpeg) throw new Error("Não foi possível processar a imagem.");
  return new File([jpeg], "imagem.jpg", { type: "image/jpeg" });
}
