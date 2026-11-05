import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { catalogHref, categoryArt, pointsOnlyToHidden, type Category } from "@/lib/categories";
import { isDark, type ArtKey, type BannerSection, type CategoriesSection, type HeroSection, type ShelfSection, type SiteContent, type StepsSection, type TilesSection } from "@/lib/content";
import { whatsappUrl } from "@/lib/site";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { ProductShelf } from "./ProductShelf";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Peça de uma composição: posição e tamanho definidos por classes. */
function Art({ src, className, priority, style }: { src: string; className: string; priority?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={`absolute ${className}`} style={style}>
      <Image src={src} alt="" width={1600} height={1600} unoptimized priority={priority} className="h-auto w-full" />
    </div>
  );
}

function DevicesArt({ priority }: { priority?: boolean }) {
  return (
    <div aria-hidden="true" className="relative mx-auto mt-8 aspect-[10/7.4] max-w-[1180px] md:mt-6 md:aspect-[16/7]">
      <Art priority={priority} src="/art/laptop.svg" className="rise bottom-[-2%] left-[4%] w-[92%] md:left-[17%] md:w-[66%]" style={{ "--delay": "260ms", "--rise": "60px" } as React.CSSProperties} />
      <Art priority={priority} src="/art/tablet.svg" className="rise bottom-[-2%] left-[-7%] w-[40%] md:left-[1%] md:w-[26%]" style={{ "--delay": "420ms", "--rise": "70px" } as React.CSSProperties} />
      <Art priority={priority} src="/art/phone-back-natural.svg" className="rise bottom-[-3%] right-[1%] w-[27%] md:right-[9%] md:w-[15%]" style={{ "--delay": "540ms", "--rise": "80px" } as React.CSSProperties} />
      <Art priority={priority} src="/art/phone-front-aurora.svg" className="rise bottom-[-3%] right-[-11%] w-[27%] md:right-[0%] md:w-[15%]" style={{ "--delay": "640ms", "--rise": "80px" } as React.CSSProperties} />
      <Art priority={priority} src="/art/watch.svg" className="rise bottom-[-2%] left-[28%] hidden w-[9%] md:left-[25%] md:block" style={{ "--delay": "720ms", "--rise": "80px" } as React.CSSProperties} />
    </div>
  );
}

function IphonesArt() {
  return (
    <div aria-hidden="true" className="drift relative mx-auto -mb-[6%] mt-8 aspect-[10/8.2] max-w-[980px] md:mt-6 md:aspect-[10/6.4]" style={{ "--drift": "8%" } as React.CSSProperties}>
      <Art src="/art/phone-back-graphite.svg" className="left-[1%] top-[12%] w-[38%] -rotate-[7deg] md:left-[10%] md:w-[28%]" />
      <Art src="/art/phone-back-copper.svg" className="right-[1%] top-[12%] w-[38%] rotate-[7deg] md:right-[10%] md:w-[28%]" />
      <Art src="/art/phone-front-dawn.svg" className="left-[28%] top-[2%] w-[44%] md:left-[34%] md:w-[32%]" />
    </div>
  );
}

function RhythmArt() {
  return (
    <div aria-hidden="true" className="drift relative mt-4 aspect-[10/8] lg:mt-0 lg:aspect-auto" style={{ "--drift": "6%" } as React.CSSProperties}>
      <Art src="/art/tablet.svg" className="left-[5%] top-[7%] w-[50%] lg:left-[12%] lg:top-[9%] lg:w-[44%]" />
      <Art src="/art/laptop.svg" className="bottom-[1%] right-[-7%] w-[84%] lg:bottom-[9%] lg:right-[-6%] lg:w-[78%]" />
      <Art src="/art/watch-dark.svg" className="bottom-[3%] left-[3%] w-[21%] lg:bottom-[7%] lg:left-[7%] lg:w-[17%]" />
    </div>
  );
}

function CenterArt({ art, priority }: { art: ArtKey | null; priority?: boolean }) {
  if (art === "devices") return <DevicesArt priority={priority} />;
  if (art === "iphones") return <IphonesArt />;
  return null;
}

const coverScrim = "linear-gradient(180deg, rgb(0 0 0 / 0.45) 0%, rgb(0 0 0 / 0.3) 55%, rgb(0 0 0 / 0.5) 100%)";

function CoverImage({ src, priority }: { src: string; priority?: boolean }) {
  return (
    <>
      <ProductImage src={src} alt="" sizes="100vw" priority={priority} className="!object-cover" />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: coverScrim }} />
    </>
  );
}

function Hero({ section }: { section: HeroSection }) {
  const cover = section.image && section.imageMode === "cover" ? section.image : null;
  const contained = section.image && !cover ? section.image : null;
  const dark = Boolean(cover) || isDark(section.background);
  return (
    <section className={`relative overflow-hidden ${dark ? "text-white" : ""}`} style={{ backgroundColor: section.background }}>
      {cover && <CoverImage src={cover} priority />}
      {!dark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 55% at 50% 100%, #ffffff 0%, rgb(255 255 255 / 0) 100%)" }}
        />
      )}
      <div className={`relative mx-auto max-w-[1320px] px-5 pt-14 text-center md:px-8 md:pt-20 ${cover ? "flex min-h-[560px] flex-col items-center justify-center pb-14 md:min-h-[680px] md:pb-20" : ""} ${!cover && !contained && !section.art ? "pb-14 md:pb-20" : ""}`}>
        <h1 className="display rise mx-auto max-w-[17ch]">{section.title}</h1>
        {section.text && (
          <p className={`lede rise mx-auto mt-5 max-w-[46ch] ${dark ? "text-white/85" : "text-ink-soft"}`} style={{ "--delay": "120ms" } as React.CSSProperties}>
            {section.text}
          </p>
        )}
        {section.ctaLabel && (
          <div className="rise mt-8" style={{ "--delay": "220ms" } as React.CSSProperties}>
            <Link href={section.ctaHref} className={`btn ${dark ? "btn-light" : "btn-dark"}`}>{section.ctaLabel}</Link>
          </div>
        )}
        {contained && (
          <div className="relative mx-auto mt-8 aspect-[16/8] max-w-[1180px]">
            <ProductImage src={contained} alt="" sizes="(max-width: 1200px) 100vw, 1180px" priority className="!object-bottom" />
          </div>
        )}
        {!section.image && <CenterArt art={section.art} priority />}
      </div>
    </section>
  );
}

function Categories({ section, categories }: { section: CategoriesSection; categories: Category[] }) {
  // Até 9 categorias cabem em uma linha; acima disso a lista rola na horizontal.
  const fits = categories.length <= 9;
  return (
    <section aria-label={section.title} className="bg-white py-14 md:py-20">
      <Reveal className="mx-auto max-w-[1320px] px-5 md:px-8">
        <h2 className="title">{section.title}</h2>
      </Reveal>
      <Reveal delay={80} className="min-[86.5rem]:mx-auto min-[86.5rem]:max-w-[1320px]">
        <ul
          className={`no-scrollbar mt-7 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:px-8 ${fits ? "xl:grid xl:gap-2 xl:overflow-visible xl:[grid-template-columns:repeat(var(--columns),minmax(0,1fr))]" : ""}`}
          style={{ "--columns": Math.max(categories.length, 7) } as React.CSSProperties}
        >
          {categories.map((category) => (
            <li key={category.slug} className={`w-[116px] shrink-0 snap-start ${fits ? "xl:w-auto" : ""}`}>
              <Link href={catalogHref(category.slug)} className="group block text-center">
                <span className="relative block aspect-square overflow-hidden rounded-[22px] bg-canvas transition-colors duration-300 group-hover:bg-[#ecece9]">
                  <span className="absolute inset-[14%] block transition-transform duration-500 ease-soft group-hover:scale-[1.07]">
                    <ProductImage src={categoryArt(categories, category.slug)} alt="" sizes="130px" />
                  </span>
                </span>
                <span className="mt-2.5 block text-[13px] font-medium leading-tight tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
                  {category.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

const shelfHref = (section: ShelfSection) => {
  if (section.source === "offers") return "/catalogo?ofertas=1";
  if (section.source === "condition-new") return "/catalogo?condicao=novo";
  if (section.source === "condition-used") return "/catalogo?condicao=seminovo";
  if (section.source === "categories" && section.categories.length) return catalogHref(...section.categories);
  return "/catalogo";
};

function shelfProducts(section: ShelfSection, products: Product[]) {
  switch (section.source) {
    case "featured": return products.filter((p) => p.featured);
    case "new": return products.filter((p) => p.isNew);
    case "offers": return products.filter((p) => p.promoPrice !== null);
    case "condition-new": return products.filter((p) => p.condition === "novo");
    case "condition-used": return products.filter((p) => p.condition === "seminovo");
    case "categories": return products.filter((p) => section.categories.includes(p.category));
    default: return products;
  }
}

function Shelf({ section, products, priority }: { section: ShelfSection; products: Product[]; priority: boolean }) {
  const items = shelfProducts(section, products);
  // Vitrine sem produtos não aparece, em vez de mostrar um título vazio.
  if (items.length === 0) return null;
  return (
    <section aria-label={section.title} className={`${section.tone === "canvas" ? "bg-canvas" : "bg-white"} py-14 md:py-20`}>
      <Reveal className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-x-8 gap-y-2 px-5 md:px-8">
        <div>
          <h2 className="headline">{section.title}</h2>
          {section.note && <p className="lede mt-2.5 text-ink-mute">{section.note}</p>}
        </div>
        {section.linkLabel && (
          <Link href={shelfHref(section)} className="group inline-flex items-center gap-1 text-[15px] font-medium text-accent">
            {section.linkLabel}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </Reveal>
      <Reveal delay={100} className="mt-3">
        <ProductShelf label={section.title}>
          {items.map((product, index) => (
            <li key={product.id}><ProductCard product={product} priority={priority && index < 2} /></li>
          ))}
        </ProductShelf>
      </Reveal>
    </section>
  );
}

function BannerButtons({ section, dark, className }: { section: BannerSection; dark: boolean; className: string }) {
  if (section.buttons.length === 0) return null;
  return (
    <div className={`mt-7 flex flex-wrap gap-2.5 ${className}`}>
      {section.buttons.map((button, index) => (
        <Link key={`${button.label}-${button.href}`} href={button.href} className={`btn ${index === 0 && !dark ? "btn-dark" : "btn-light"}`}>{button.label}</Link>
      ))}
    </div>
  );
}

function Banner({ section }: { section: BannerSection }) {
  const cover = section.image && section.imageMode === "cover" ? section.image : null;
  const contained = section.image && !cover ? section.image : null;
  const dark = Boolean(cover) || isDark(section.background);
  const soft = dark ? "text-white/85" : "text-ink-soft";
  const glow = section.art === "iphones" && !section.image;

  if (section.layout === "split") {
    const showArt = !section.image && section.art === "rhythm";
    return (
      <section className="bg-white px-3 pt-3 md:px-5 md:pt-5">
        <div className={`relative mx-auto grid max-w-[1480px] overflow-hidden rounded-[32px] lg:min-h-[640px] ${cover ? "" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"} ${dark ? "text-white" : ""}`} style={{ backgroundColor: section.background }}>
          {cover && <CoverImage src={cover} />}
          <Reveal className={`relative z-10 flex flex-col items-center justify-center px-6 pt-14 text-center lg:items-start lg:py-20 lg:pl-16 lg:pr-0 lg:text-left ${cover || (!contained && !showArt) ? "pb-14" : ""}`}>
            <h2 className="headline max-w-[14ch]">{section.title}</h2>
            {section.text && <p className={`lede mt-4 max-w-[34ch] ${soft}`}>{section.text}</p>}
            <BannerButtons section={section} dark={dark} className="justify-center lg:justify-start" />
          </Reveal>
          {contained && (
            <div className="relative mt-4 aspect-[10/8] lg:mt-0 lg:aspect-auto">
              <span className="absolute inset-[6%] block"><ProductImage src={contained} alt="" sizes="(max-width: 1024px) 100vw, 60vw" /></span>
            </div>
          )}
          {showArt && <RhythmArt />}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-3 pt-3 md:px-5 md:pt-5">
      <div className={`relative mx-auto max-w-[1480px] overflow-hidden rounded-[32px] ${dark ? "text-white" : ""}`} style={{ backgroundColor: section.background }}>
        {cover && <CoverImage src={cover} />}
        {glow && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(48% 46% at 50% 86%, rgb(24 137 118 / 0.42) 0%, transparent 100%), radial-gradient(35% 36% at 78% 62%, rgb(232 138 76 / 0.2) 0%, transparent 100%), radial-gradient(35% 36% at 20% 66%, rgb(52 90 200 / 0.24) 0%, transparent 100%)",
            }}
          />
        )}
        <Reveal className={`relative px-6 pt-14 text-center md:pt-20 ${cover ? "flex min-h-[520px] flex-col items-center justify-center pb-14 md:min-h-[640px]" : ""} ${!section.image && !section.art ? "pb-14 md:pb-20" : ""}`}>
          <h2 className="display mx-auto max-w-[15ch]">{section.title}</h2>
          {section.text && <p className={`lede mx-auto mt-4 max-w-[46ch] ${soft}`}>{section.text}</p>}
          <BannerButtons section={section} dark={dark} className="justify-center" />
        </Reveal>
        {contained && (
          <div className="relative mx-auto mt-8 aspect-[16/9] max-w-[980px]">
            <ProductImage src={contained} alt="" sizes="(max-width: 1000px) 100vw, 980px" className="!object-bottom" />
          </div>
        )}
        {!section.image && <CenterArt art={section.art} />}
      </div>
    </section>
  );
}

// Enquadramento próprio das ilustrações originais. Fotos enviadas usam o padrão.
const TILE_INSETS: Record<string, string> = {
  "/art/charger.svg": "inset-x-[20%] bottom-[-6%] top-[26%]",
  "/art/case-copper.svg": "inset-x-[22%] bottom-[-34%] top-[24%]",
  "/art/earbuds.svg": "inset-x-[14%] bottom-[2%] top-[28%]",
  "/art/headphones-pearl.svg": "inset-x-[16%] bottom-[-2%] top-[26%]",
  "/art/speaker.svg": "inset-x-[20%] bottom-[-2%] top-[26%]",
};
const DEFAULT_TILE_INSET = "inset-x-[12%] bottom-[4%] top-[24%]";

/** Fecha as linhas da grade de 6 colunas, com as peças largas primeiro. */
function tileSpan(index: number, total: number) {
  if (total === 1) return "md:col-span-6";
  const wide = total % 3 === 2 ? 2 : total % 3 === 1 ? 4 : 0;
  const desktop = index < wide ? "md:col-span-3" : "md:col-span-2";
  // No celular são duas colunas: a última peça de uma lista ímpar ocupa a linha toda.
  return total % 2 === 1 && index === total - 1 ? `col-span-2 ${desktop}` : desktop;
}

function Tiles({ section }: { section: TilesSection }) {
  const dark = isDark(section.background);
  return (
    <section className="bg-white px-3 pt-3 md:px-5 md:pt-5">
      <div className={`mx-auto max-w-[1480px] rounded-[32px] px-4 pb-4 pt-14 md:px-6 md:pb-6 md:pt-20 ${dark ? "text-white" : ""}`} style={{ backgroundColor: section.background }}>
        <Reveal className="text-center">
          <h2 className="display mx-auto max-w-[14ch]">{section.title}</h2>
          {section.text && <p className={`lede mx-auto mt-4 max-w-[44ch] ${dark ? "text-white/85" : "text-ink-soft"}`}>{section.text}</p>}
        </Reveal>
        {section.tiles.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-6 md:gap-4">
            {section.tiles.map((tile, index) => (
              <Reveal as="li" key={tile.id} delay={index * 70} className={tileSpan(index, section.tiles.length)}>
                <Link href={tile.href} className={`group relative block aspect-[4/5] overflow-hidden rounded-[24px] md:aspect-auto md:h-[440px] ${isDark(tile.background) ? "text-white" : "text-ink"}`} style={{ backgroundColor: tile.background }}>
                  <span className="absolute left-5 top-5 z-10 text-lg font-semibold tracking-[-0.02em] md:left-7 md:top-6 md:text-2xl">{tile.title}</span>
                  {tile.image && (
                    <span className={`absolute block transition-transform duration-700 ease-soft group-hover:scale-[1.04] ${TILE_INSETS[tile.image] ?? DEFAULT_TILE_INSET}`}>
                      <ProductImage src={tile.image} alt="" sizes="(max-width: 768px) 50vw, 500px" />
                    </span>
                  )}
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Steps({ section, whatsapp }: { section: StepsSection; whatsapp: string }) {
  return (
    <section aria-label={section.title} className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <Reveal><h2 className="headline max-w-[16ch]">{section.title}</h2></Reveal>
        {section.steps.length > 0 && (
          <ol className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-3 md:gap-10">
            {section.steps.map((step, index) => (
              <Reveal as="li" key={`${step.title}-${index}`} delay={index * 90}>
                <span className="text-sm font-medium tabular-nums text-accent">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-ink-mute">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        )}
        {section.ctaLabel && (
          <Reveal delay={200} className="mt-11">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
              <WhatsAppIcon size={17} />
              {section.ctaLabel}
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function HomeSections({ content, categories, products, hiddenCategories }: { content: SiteContent; categories: Category[]; products: Product[]; hiddenCategories: string[] }) {
  const reachable = (href: string) => !pointsOnlyToHidden(href, hiddenCategories);
  const whatsapp = whatsappUrl(content.contact.whatsapp, content.contact.message);
  const firstShelf = content.home.find((s) => s.type === "shelf" && s.visible)?.id;
  return (
    <>
      {content.home.filter((section) => section.visible).map((section) => {
        switch (section.type) {
          case "hero": return <Hero key={section.id} section={section} />;
          case "categories": return <Categories key={section.id} section={section} categories={categories} />;
          case "shelf": return <Shelf key={section.id} section={section} products={products} priority={section.id === firstShelf} />;
          case "banner": return <Banner key={section.id} section={{ ...section, buttons: section.buttons.filter((b) => reachable(b.href)) }} />;
          case "tiles": return <Tiles key={section.id} section={{ ...section, tiles: section.tiles.filter((t) => reachable(t.href)) }} />;
          case "steps": return <Steps key={section.id} section={section} whatsapp={whatsapp} />;
        }
      })}
    </>
  );
}
