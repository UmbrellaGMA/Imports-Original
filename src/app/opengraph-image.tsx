import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/catalog";

export const alt = "Imagem de compartilhamento da loja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

export default async function OpenGraphImage() {
  const { brand, home } = await getSiteContent();
  const hero = home.find((section) => section.type === "hero" && section.visible);
  const headline = hero && "title" in hero ? hero.title : brand.name;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f5f5f3",
        color: "#17171a",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase" }}>{brand.name}</div>
      <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05, maxWidth: 950 }}>{headline}</div>
    </div>,
    size,
  );
}
