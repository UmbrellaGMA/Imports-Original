import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductOptions } from "@/components/store/ProductOptions";
import { ProductShelf } from "@/components/store/ProductShelf";
import { getCategories, getProductBySlug, getProducts, getSiteContent } from "@/lib/catalog";
import { catalogHref, categoryArt, categoryLabel } from "@/lib/categories";
import { effectivePrice } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Produto não encontrado" };
  const { brand } = await getSiteContent();
  const description = product.description.slice(0, 160) || `${product.name} na ${brand.name}. Consulte a disponibilidade pelo WhatsApp.`;
  const image = product.images.find((url) => !url.endsWith(".svg"));
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: { title: product.name, description, url: `/produto/${product.slug}`, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  const related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 8);
  const images = product.images.length ? product.images : [categoryArt(categories, product.category)];
  const label = categoryLabel(categories, product.category);
  const price = effectivePrice(product);

  const absolute = (url: string) => (url.startsWith("http") ? url : `${site.url}${url}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    category: label,
    ...(product.description ? { description: product.description } : {}),
    ...(product.images.length ? { image: product.images.map(absolute) } : {}),
    // Oferta só é publicada quando há preço cadastrado.
    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: price.toFixed(2),
            url: `${site.url}/produto/${product.slug}`,
            availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            ...(product.condition
              ? { itemCondition: product.condition === "novo" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition" }
              : {}),
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-5 md:px-8 md:pb-24">
        <nav aria-label="Trilha de navegação" className="flex items-center gap-1 text-xs text-ink-mute">
          <Link href="/catalogo" className="transition-colors hover:text-ink">Catálogo</Link>
          <ChevronRight size={12} />
          <Link href={catalogHref(product.category)} className="transition-colors hover:text-ink">{label}</Link>
          <ChevronRight size={12} />
          <span className="truncate text-ink-soft">{product.name}</span>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={images} name={product.name} />
          <div className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start">
            <ProductOptions product={product} />
          </div>
        </div>

        {(product.description || product.specs.length > 0 || product.additionalInfo) && (
          <div className="mt-16 grid gap-12 border-t border-line pt-12 md:mt-24 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-12">
              {product.description && (
                <section>
                  <h2 className="title">Descrição</h2>
                  <p className="mt-4 whitespace-pre-line text-[17px] leading-relaxed tracking-[-0.01em] text-ink-soft">{product.description}</p>
                </section>
              )}
              {product.additionalInfo && (
                <section>
                  <h2 className="title">Informações adicionais</h2>
                  <p className="mt-4 whitespace-pre-line text-[17px] leading-relaxed tracking-[-0.01em] text-ink-soft">{product.additionalInfo}</p>
                </section>
              )}
            </div>
            {product.specs.length > 0 && (
              <section>
                <h2 className="title">Especificações técnicas</h2>
                <dl className="mt-3">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-line py-3.5 text-[15px]">
                      <dt className="text-ink-mute">{spec.label}</dt>
                      <dd className="font-medium tracking-[-0.005em]">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="bg-canvas pb-16 pt-14 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-[1320px] px-5 md:px-8">
            <h2 id="relacionados" className="title">Você também pode gostar.</h2>
          </div>
          <div className="mt-2">
            <ProductShelf label="Produtos relacionados">
              {related.map((item) => <li key={item.id}><ProductCard product={item} /></li>)}
            </ProductShelf>
          </div>
        </section>
      )}
    </>
  );
}
