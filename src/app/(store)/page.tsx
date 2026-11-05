import { HomeSections } from "@/components/store/HomeSections";
import { getCategories, getHiddenCategorySlugs, getProducts, getSiteContent } from "@/lib/catalog";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories, content, hiddenCategories] = await Promise.all([getProducts(), getCategories(), getSiteContent(), getHiddenCategorySlugs()]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: content.brand.name,
    url: site.url,
    description: content.seo.description,
    ...(content.contact.instagram ? { sameAs: [content.contact.instagram] } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
      <HomeSections content={content} categories={categories} products={products} hiddenCategories={hiddenCategories} />
    </>
  );
}
