"use client";

import { ArrowRight, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { catalogHref } from "@/lib/categories";
import { whatsappUrl } from "@/lib/site";
import { Logo } from "./Logo";
import { useStore } from "./StoreProvider";
import { WhatsAppIcon } from "./WhatsAppIcon";

type Panel = "menu" | "search" | null;

export function Header() {
  const { brand, contact, nav, categories } = useStore();
  const generalLink = whatsappUrl(contact.whatsapp, contact.message);
  const quickLinks = categories.slice(0, 5);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const close = () => setPanel(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (panel === "search") inputRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [panel]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    setQuery("");
    close();
    router.push(term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo");
  };

  const iconButton =
    "flex size-9 items-center justify-center rounded-full text-ink/80 transition-colors hover:bg-black/5 hover:text-ink";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-header max-w-[1320px] items-center justify-between gap-4 pl-5 pr-3 md:pl-8 md:pr-6">
          <Link href="/" onClick={close} aria-label={`${brand.name}, página inicial`} className="flex shrink-0">
            <Logo name={brand.name} logoUrl={brand.logoUrl} />
          </Link>

          <nav aria-label="Principal" className="hidden items-center lg:flex">
            {nav.map((item) => {
              const active = item.href === "/" && pathname === "/";
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  onClick={close}
                  className={`rounded-full px-2.5 py-1.5 text-[12.5px] tracking-[-0.005em] transition-colors hover:text-ink xl:px-3 ${
                    active ? "text-ink" : "text-ink/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label={panel === "search" ? "Fechar pesquisa" : "Pesquisar produtos"}
              aria-expanded={panel === "search"}
              onClick={() => setPanel(panel === "search" ? null : "search")}
              className={iconButton}
            >
              {panel === "search" ? <X size={18} strokeWidth={1.7} /> : <Search size={17} strokeWidth={1.7} />}
            </button>
            <a
              href={generalLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar pelo WhatsApp"
              className={iconButton}
            >
              <WhatsAppIcon size={17} />
            </a>
            <button
              type="button"
              aria-label={panel === "menu" ? "Fechar menu" : "Abrir menu"}
              aria-expanded={panel === "menu"}
              onClick={() => setPanel(panel === "menu" ? null : "menu")}
              className={`${iconButton} lg:hidden`}
            >
              {panel === "menu" ? <X size={19} strokeWidth={1.7} /> : <Menu size={19} strokeWidth={1.7} />}
            </button>
          </div>
        </div>
      </header>

      {panel === "search" && (
        <>
          <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[3px] fade-up" onClick={close} aria-hidden="true" />
          <div className="fixed inset-x-0 top-header z-40 bg-white shadow-lift">
            <div className="mx-auto max-w-[760px] px-5 py-8 md:py-12">
              <form onSubmit={submitSearch} role="search" className="flex items-center gap-3">
                <Search size={24} strokeWidth={1.6} className="shrink-0 text-ink-mute" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Buscar na ${brand.name}`}
                  aria-label="Buscar produtos"
                  className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-ink-mute/70 md:text-[32px] [&::-webkit-search-cancel-button]:hidden"
                />
              </form>
              <p className="mt-7 text-xs font-medium text-ink-mute">Navegação rápida</p>
              <ul className="mt-2.5">
                {quickLinks.map((category, index) => (
                  <li key={category.slug} className="fade-up" style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}>
                    <Link href={catalogHref(category.slug)} onClick={close} className="group flex items-center gap-2 py-1.5 text-[15px] font-medium hover:text-accent">
                      <ArrowRight size={14} className="text-ink-mute transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {panel === "menu" && (
        <div className="fixed inset-x-0 bottom-0 top-header z-40 overflow-y-auto bg-white lg:hidden">
          <nav aria-label="Menu" className="px-6 pb-10 pt-5">
            <ul>
              {nav.map((item, index) => (
                <li key={`${item.label}-${item.href}`} className="fade-up" style={{ "--delay": `${index * 30}ms` } as React.CSSProperties}>
                  <Link href={item.href} onClick={close} className="block py-2 text-[28px] font-semibold tracking-[-0.025em] transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={generalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent fade-up mt-7 w-full"
              style={{ "--delay": "300ms" } as React.CSSProperties}
            >
              <WhatsAppIcon size={17} />
              Falar pelo WhatsApp
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
