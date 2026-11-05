import "server-only";
import type { Category } from "@/lib/categories";
import type { SiteContent } from "@/lib/content";
import type { Product, ProductFlag, ProductInput } from "@/lib/types";

export type CategoryInput = Pick<Category, "label" | "image">;

/** Contrato único de dados. O restante do site não sabe qual backend está ativo. */
export interface CatalogRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product>;
  setFlag(id: string, flag: ProductFlag, value: boolean): Promise<void>;
  remove(id: string): Promise<void>;
  reorder(orderedIds: string[]): Promise<void>;
  uploadImage(data: Buffer, extension: string, contentType: string): Promise<string>;
  removeImages(urls: string[]): Promise<void>;

  listCategories(): Promise<Category[]>;
  createCategory(input: CategoryInput): Promise<Category>;
  updateCategory(slug: string, input: CategoryInput): Promise<void>;
  setCategoryVisible(slug: string, visible: boolean): Promise<void>;
  removeCategory(slug: string): Promise<void>;
  reorderCategories(orderedSlugs: string[]): Promise<void>;

  getContent(): Promise<SiteContent>;
  saveContent(content: SiteContent): Promise<void>;
}

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
