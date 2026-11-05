import Link from "next/link";
import { catalogHref, type Category } from "@/lib/categories";
import type { SiteContent } from "@/lib/content";
import { whatsappUrl } from "@/lib/site";
import { Logo } from "./Logo";

const heading = "text-xs font-semibold text-ink";
const linkClass = "text-[13px] text-ink-mute transition-colors hover:text-ink";

export function Footer({ content, categories }: { content: SiteContent; categories: Category[] }) {
  const { brand, contact, footer, nav } = content;
  const hasContact = contact.hours || contact.address || contact.email;
  const whatsapp = whatsappUrl(contact.whatsapp, contact.message);
  // As categorias já têm coluna própria; aqui ficam os demais links do menu.
  const pages = nav.filter((item) => !item.href.includes("categoria="));
  return (
    <footer className="bg-canvas">
      <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-14 md:px-8">
        <Link href="/" aria-label={`${brand.name}, página inicial`} className="inline-block">
          <Logo name={brand.name} logoUrl={brand.logoUrl} />
        </Link>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <div>
            <h2 className={heading}>{footer.navigationTitle}</h2>
            <ul className="mt-3.5 space-y-2.5">
              {pages.map((item) => (
                <li key={`${item.label}-${item.href}`}><Link href={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
              <li><Link href="/catalogo" className={linkClass}>Catálogo completo</Link></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h2 className={heading}>{footer.categoriesTitle}</h2>
            <ul className="mt-3.5 space-y-2.5">
              {categories.map((category) => (
                <li key={category.slug}><Link href={catalogHref(category.slug)} className={linkClass}>{category.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={heading}>{footer.contactTitle}</h2>
            <ul className="mt-3.5 space-y-2.5">
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp</a>
              </li>
              {contact.email && (
                <li><a href={`mailto:${contact.email}`} className={linkClass}>{contact.email}</a></li>
              )}
              {contact.hours && <li className="text-[13px] text-ink-mute">{contact.hours}</li>}
              {contact.address && <li className="text-[13px] text-ink-mute">{contact.address}</li>}
              {!hasContact && footer.contactNote && <li className="text-[13px] text-ink-mute">{footer.contactNote}</li>}
            </ul>
          </div>

          <div>
            <h2 className={heading}>{footer.socialTitle}</h2>
            <ul className="mt-3.5 space-y-2.5">
              {contact.instagram && (
                <li><a href={contact.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>Instagram</a></li>
              )}
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-5 text-xs text-ink-mute md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</p>
          <Link href="/privacidade" className="transition-colors hover:text-ink">Política de privacidade</Link>
        </div>
        {footer.legalNote && <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-ink-mute">{footer.legalNote}</p>}
      </div>
    </footer>
  );
}
