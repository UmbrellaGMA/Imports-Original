"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Produtos", match: (p: string) => p === "/admin" || p.startsWith("/admin/produtos") },
  { href: "/admin/categorias", label: "Categorias", match: (p: string) => p.startsWith("/admin/categorias") },
  { href: "/admin/home", label: "Página inicial", match: (p: string) => p.startsWith("/admin/home") },
  { href: "/admin/identidade", label: "Identidade e contato", match: (p: string) => p.startsWith("/admin/identidade") },
];

export function PanelNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Seções do painel" className="no-scrollbar mx-auto flex max-w-[1120px] gap-1 overflow-x-auto px-4 pb-2 md:px-6">
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${active ? "bg-ink text-white" : "text-ink-soft hover:bg-canvas hover:text-ink"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
