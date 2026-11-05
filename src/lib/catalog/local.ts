import "server-only";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { DEFAULT_CATEGORIES, type Category } from "@/lib/categories";
import { normalizeContent, type SiteContent } from "@/lib/content";
import { isStaleCopySlug, slugify } from "@/lib/format";
import type { Product } from "@/lib/types";
import type { CatalogRepository } from "./repository";
import { buildSeed } from "./seed";

export const LOCAL_IMAGE_ROUTE = "/api/imagens/";

const dataDir = () => process.env.LOCAL_DATA_DIR || join(/* turbopackIgnore: true */ process.cwd(), ".data");
const catalogFile = () => join(dataDir(), "catalog.json");
export const uploadsDir = () => join(dataDir(), "uploads");

async function readAll(): Promise<Product[]> {
  try {
    return JSON.parse(await readFile(catalogFile(), "utf8")) as Product[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return buildSeed();
    throw error;
  }
}

async function writeAll(products: Product[]) {
  await mkdir(dataDir(), { recursive: true });
  const temp = `${catalogFile()}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(products, null, 2), "utf8");
  await rename(temp, catalogFile());
}

// Serializa as gravações para que duas ações simultâneas não se sobrescrevam.
let queue: Promise<unknown> = Promise.resolve();
function mutate<T>(work: (products: Product[]) => { next: Product[]; result: T }): Promise<T> {
  const run = queue.then(async () => {
    const { next, result } = work(await readAll());
    await writeAll(next);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(dataDir(), name), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(name: string, value: unknown) {
  await mkdir(dataDir(), { recursive: true });
  const target = join(dataDir(), name);
  const temp = `${target}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await rename(temp, target);
}

const CATEGORIES_FILE = "categories.json";
const CONTENT_FILE = "content.json";

function mutateCategories(work: (categories: Category[]) => Category[]) {
  const run = queue.then(async () => {
    await writeJson(CATEGORIES_FILE, work(await readJson(CATEGORIES_FILE, DEFAULT_CATEGORIES)));
  });
  queue = run.catch(() => undefined);
  return run;
}

const bySortOrder = (a: Product, b: Product) => a.sortOrder - b.sortOrder;

function uniqueSlug(name: string, products: Product[]) {
  const base = slugify(name);
  const taken = new Set(products.map((p) => p.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export const localRepository: CatalogRepository = {
  async list() {
    return (await readAll()).sort(bySortOrder);
  },
  async getById(id) {
    return (await readAll()).find((p) => p.id === id) ?? null;
  },
  create(input) {
    return mutate((products) => {
      const now = new Date().toISOString();
      const product: Product = {
        ...input,
        id: randomUUID(),
        slug: uniqueSlug(input.name, products),
        sortOrder: Math.max(0, ...products.map((p) => p.sortOrder)) + 1,
        createdAt: now,
        updatedAt: now,
      };
      return { next: [...products, product], result: product };
    });
  },
  update(id, input) {
    return mutate((products) => {
      const current = products.find((p) => p.id === id);
      if (!current) throw new Error("Produto não encontrado.");
      const slug = isStaleCopySlug(current.slug, input.name) ? uniqueSlug(input.name, products) : current.slug;
      const product: Product = { ...current, ...input, slug, updatedAt: new Date().toISOString() };
      return { next: products.map((p) => (p.id === id ? product : p)), result: product };
    });
  },
  setFlag(id, flag, value) {
    return mutate((products) => ({
      next: products.map((p) => (p.id === id ? { ...p, [flag]: value } : p)),
      result: undefined,
    }));
  },
  remove(id) {
    return mutate((products) => ({ next: products.filter((p) => p.id !== id), result: undefined }));
  },
  reorder(orderedIds) {
    return mutate((products) => {
      const position = new Map(orderedIds.map((id, index) => [id, index + 1]));
      return {
        next: products.map((p) => ({ ...p, sortOrder: position.get(p.id) ?? p.sortOrder })),
        result: undefined,
      };
    });
  },
  async uploadImage(data, extension) {
    await mkdir(uploadsDir(), { recursive: true });
    const file = `${randomUUID()}.${extension}`;
    await writeFile(join(uploadsDir(), file), data);
    return `${LOCAL_IMAGE_ROUTE}${file}`;
  },
  async removeImages(urls) {
    await Promise.all(
      urls
        .filter((url) => url.startsWith(LOCAL_IMAGE_ROUTE))
        .map((url) => unlink(join(uploadsDir(), basename(url))).catch(() => undefined)),
    );
  },
  async copyImage(url) {
    if (!url.startsWith(LOCAL_IMAGE_ROUTE)) return url;
    const file = `${randomUUID()}.${url.split(".").pop()}`;
    await copyFile(join(uploadsDir(), basename(url)), join(uploadsDir(), file));
    return `${LOCAL_IMAGE_ROUTE}${file}`;
  },

  listCategories() {
    return readJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
  },
  async createCategory(input) {
    let created!: Category;
    await mutateCategories((categories) => {
      const base = slugify(input.label);
      const taken = new Set(categories.map((c) => c.slug));
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      created = { ...input, slug, visible: true };
      return [...categories, created];
    });
    return created;
  },
  updateCategory(slug, input) {
    return mutateCategories((categories) => categories.map((c) => (c.slug === slug ? { ...c, ...input } : c)));
  },
  setCategoryVisible(slug, visible) {
    return mutateCategories((categories) => categories.map((c) => (c.slug === slug ? { ...c, visible } : c)));
  },
  async removeCategory(slug) {
    // Mesma regra da chave estrangeira do banco.
    if ((await readAll()).some((p) => p.category === slug)) throw new Error("Esta categoria ainda tem produtos.");
    await mutateCategories((categories) => categories.filter((c) => c.slug !== slug));
  },
  reorderCategories(orderedSlugs) {
    return mutateCategories((categories) => {
      const position = new Map(orderedSlugs.map((slug, index) => [slug, index]));
      return [...categories].sort((a, b) => (position.get(a.slug) ?? 0) - (position.get(b.slug) ?? 0));
    });
  },

  async getContent() {
    return normalizeContent(await readJson<unknown>(CONTENT_FILE, {}));
  },
  saveContent(content: SiteContent) {
    const run = queue.then(() => writeJson(CONTENT_FILE, content));
    queue = run.catch(() => undefined);
    return run;
  },
};
