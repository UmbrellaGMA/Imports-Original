import { getCategories, getHiddenCategorySlugs, getSiteContent, isSupabaseConfigured } from "@/lib/catalog";
import { pointsOnlyToHidden } from "@/lib/categories";
import { DemoNotice } from "./DemoNotice";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { StoreProvider } from "./StoreProvider";

/** Cabeçalho, rodapé e dados da loja, compartilhados pelas páginas públicas e pelo 404. */
export async function StoreShell({ children }: { children: React.ReactNode }) {
  const [content, categories, hidden] = await Promise.all([getSiteContent(), getCategories(), getHiddenCategorySlugs()]);
  const nav = content.nav.filter((item) => !pointsOnlyToHidden(item.href, hidden));
  return (
    <StoreProvider value={{ brand: content.brand, contact: content.contact, nav, categories }}>
      <Header />
      {children}
      <Footer content={{ ...content, nav }} categories={categories} />
      {!isSupabaseConfigured() && <DemoNotice />}
    </StoreProvider>
  );
}
