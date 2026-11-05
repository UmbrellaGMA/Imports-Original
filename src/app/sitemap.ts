import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...products.map((p) => ({
      url: `${site.url}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
