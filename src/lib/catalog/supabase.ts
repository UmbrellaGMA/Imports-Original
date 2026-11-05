import "server-only";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/categories";
import { normalizeContent } from "@/lib/content";
import { isStaleCopySlug, slugify } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";
import type { Product, ProductFlag, ProductInput } from "@/lib/types";
import type { CatalogRepository } from "./repository";

const BUCKET = "product-images";

type Row = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  additional_info: string;
  price: number | string | null;
  promo_price: number | string | null;
  specs: Product["specs"];
  colors: Product["colors"];
  capacities: string[];
  images: string[];
  cover_adjust: Product["coverAdjust"];
  featured: boolean;
  is_new: boolean;
  available: boolean;
  visible: boolean;
  condition: Product["condition"];
  conservation: Product["conservation"];
  battery_health: number | null;
  sealed: boolean;
  has_damage: boolean;
  damage_notes: string;
  repair_notes: string;
  warranty: string;
  included: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// O Postgres devolve `numeric` como texto; convertemos para número aqui.
const toNumber = (value: number | string | null) => (value === null ? null : Number(value));

const fromRow = (row: Row): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  brand: row.brand,
  category: row.category,
  description: row.description,
  additionalInfo: row.additional_info,
  price: toNumber(row.price),
  promoPrice: toNumber(row.promo_price),
  specs: row.specs,
  colors: row.colors,
  capacities: row.capacities,
  images: row.images,
  coverAdjust: row.cover_adjust,
  featured: row.featured,
  isNew: row.is_new,
  available: row.available,
  visible: row.visible,
  condition: row.condition,
  conservation: row.conservation,
  batteryHealth: row.battery_health,
  sealed: row.sealed,
  hasDamage: row.has_damage,
  damageNotes: row.damage_notes,
  repairNotes: row.repair_notes,
  warranty: row.warranty,
  included: row.included,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toRow = (input: ProductInput) => ({
  name: input.name,
  brand: input.brand,
  category: input.category,
  description: input.description,
  additional_info: input.additionalInfo,
  price: input.price,
  promo_price: input.promoPrice,
  specs: input.specs,
  colors: input.colors,
  capacities: input.capacities,
  images: input.images,
  cover_adjust: input.coverAdjust,
  featured: input.featured,
  is_new: input.isNew,
  available: input.available,
  visible: input.visible,
  condition: input.condition,
  conservation: input.conservation,
  battery_health: input.batteryHealth,
  sealed: input.sealed,
  has_damage: input.hasDamage,
  damage_notes: input.damageNotes,
  repair_notes: input.repairNotes,
  warranty: input.warranty,
  included: input.included,
});

const FLAG_COLUMNS: Record<ProductFlag, string> = {
  featured: "featured",
  isNew: "is_new",
  available: "available",
  visible: "visible",
};

/** Cliente sem sessão: leitura pública, compatível com páginas em cache. */
const publicClient = (): SupabaseClient =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

async function uniqueSlug(db: SupabaseClient, name: string) {
  const base = slugify(name);
  const rows = unwrap<{ slug: string }[]>(
    await db.from("products").select("slug").like("slug", `${base}%`),
  );
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const storagePath = (url: string) => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
};

export const supabaseRepository: CatalogRepository = {
  async list() {
    const rows = unwrap<Row[]>(
      await publicClient().from("products").select("*").order("sort_order").order("created_at"),
    );
    return rows.map(fromRow);
  },
  async getById(id) {
    const row = unwrap<Row | null>(
      await publicClient().from("products").select("*").eq("id", id).maybeSingle(),
    );
    return row ? fromRow(row) : null;
  },
  async create(input) {
    const db = await createSessionClient();
    const last = unwrap<{ sort_order: number } | null>(
      await db.from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle(),
    );
    const row = unwrap<Row>(
      await db
        .from("products")
        .insert({
          ...toRow(input),
          slug: await uniqueSlug(db, input.name),
          sort_order: (last?.sort_order ?? 0) + 1,
        })
        .select()
        .single(),
    );
    return fromRow(row);
  },
  async update(id, input) {
    const db = await createSessionClient();
    const current = unwrap<{ slug: string }>(await db.from("products").select("slug").eq("id", id).single());
    const slug = isStaleCopySlug(current.slug, input.name) ? { slug: await uniqueSlug(db, input.name) } : {};
    const row = unwrap<Row>(await db.from("products").update({ ...toRow(input), ...slug }).eq("id", id).select().single());
    return fromRow(row);
  },
  async setFlag(id, flag, value) {
    const db = await createSessionClient();
    unwrap(await db.from("products").update({ [FLAG_COLUMNS[flag]]: value }).eq("id", id));
  },
  async remove(id) {
    const db = await createSessionClient();
    unwrap(await db.from("products").delete().eq("id", id));
  },
  async reorder(orderedIds) {
    const db = await createSessionClient();
    unwrap(await db.rpc("reorder_products", { ordered_ids: orderedIds }));
  },
  async uploadImage(data, extension, contentType) {
    const db = await createSessionClient();
    const path = `${randomUUID()}.${extension}`;
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, data, { contentType, cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },
  async removeImages(urls) {
    const paths = urls.map(storagePath).filter((p): p is string => p !== null);
    if (!paths.length) return;
    const db = await createSessionClient();
    // Arquivo que sobra não pode impedir a alteração já salva: registra e segue.
    const { error } = await db.storage.from(BUCKET).remove(paths);
    if (error) console.error("Falha ao apagar imagens:", error.message);
  },
  async copyImage(url) {
    const from = storagePath(url);
    if (!from) return url;
    const db = await createSessionClient();
    const to = `${randomUUID()}.${from.split(".").pop()}`;
    const { error } = await db.storage.from(BUCKET).copy(from, to);
    if (error) throw new Error(error.message);
    return db.storage.from(BUCKET).getPublicUrl(to).data.publicUrl;
  },

  async listCategories() {
    return unwrap<Category[]>(
      await publicClient().from("categories").select("slug,label,image,visible").order("sort_order").order("created_at"),
    );
  },
  async createCategory(input) {
    const db = await createSessionClient();
    const rows = unwrap<{ slug: string; sort_order: number }[]>(await db.from("categories").select("slug,sort_order"));
    const base = slugify(input.label);
    const taken = new Set(rows.map((r) => r.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    const sort_order = Math.max(0, ...rows.map((r) => r.sort_order)) + 1;
    return unwrap<Category>(
      await db.from("categories").insert({ ...input, slug, sort_order }).select("slug,label,image,visible").single(),
    );
  },
  async updateCategory(slug, input) {
    const db = await createSessionClient();
    unwrap(await db.from("categories").update(input).eq("slug", slug));
  },
  async setCategoryVisible(slug, visible) {
    const db = await createSessionClient();
    unwrap(await db.from("categories").update({ visible }).eq("slug", slug));
  },
  async removeCategory(slug) {
    const db = await createSessionClient();
    unwrap(await db.from("categories").delete().eq("slug", slug));
  },
  async reorderCategories(orderedSlugs) {
    const db = await createSessionClient();
    unwrap(await db.rpc("reorder_categories", { ordered_slugs: orderedSlugs }));
  },

  async getContent() {
    const row = unwrap<{ data: unknown } | null>(
      await publicClient().from("site_settings").select("data").eq("id", true).maybeSingle(),
    );
    return normalizeContent(row?.data);
  },
  async saveContent(content) {
    const db = await createSessionClient();
    unwrap(await db.from("site_settings").upsert({ id: true, data: content, updated_at: new Date().toISOString() }));
  },
};
