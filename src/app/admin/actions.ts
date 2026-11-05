"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin, signIn, signOut } from "@/lib/auth";
import { getRepository, isSupabaseConfigured, STORE_TAG } from "@/lib/catalog";
import type { Category } from "@/lib/categories";
import { contentImages, type SiteContent } from "@/lib/content";
import { createSessionClient } from "@/lib/supabase/server";
import type { ProductDraft, ProductFlag } from "@/lib/types";
import { categorySchema, contentSchema, productSchema, sniffImage } from "@/lib/validation";

export type ActionResult = { ok: true; id?: string; url?: string; category?: Category } | { ok: false; error: string; fields?: Record<string, string> };

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function refreshStore() {
  updateTag(STORE_TAG);
  revalidatePath("/", "layout");
}

const failure = (error: unknown, fallback: string): ActionResult => {
  console.error(error);
  return { ok: false, error: error instanceof Error && error.message ? error.message : fallback };
};

export async function loginAction(_: string | null, form: FormData): Promise<string | null> {
  const error = await signIn(String(form.get("email") ?? "").trim(), String(form.get("password") ?? ""));
  if (error) return error;
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

export async function saveProductAction(id: string | null, input: ProductDraft): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fields[key] ??= issue.message;
      }
      return { ok: false, error: "Revise os campos destacados.", fields };
    }
    const repo = getRepository();
    if (!(await repo.listCategories()).some((c) => c.slug === parsed.data.category)) {
      return { ok: false, error: "Revise os campos destacados.", fields: { category: "Selecione uma categoria." } };
    }
    const previous = id ? await repo.getById(id) : null;
    const saved = id ? await repo.update(id, parsed.data) : await repo.create(parsed.data);
    if (previous) {
      await repo.removeImages(previous.images.filter((url) => !saved.images.includes(url)));
    }
    refreshStore();
    return { ok: true, id: saved.id };
  } catch (error) {
    return failure(error, "Não foi possível salvar o produto.");
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const repo = getRepository();
    const product = await repo.getById(id);
    await repo.remove(id);
    if (product) await repo.removeImages(product.images);
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível excluir o produto.");
  }
}

export async function setFlagAction(id: string, flag: ProductFlag, value: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!["featured", "isNew", "available"].includes(flag)) throw new Error("Campo inválido.");
    await getRepository().setFlag(id, flag, Boolean(value));
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível atualizar o produto.");
  }
}

export async function reorderAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await assertAdmin();
    await getRepository().reorder(orderedIds.map(String));
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível salvar a nova ordem.");
  }
}

export async function uploadImageAction(form: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
    const file = form.get("file");
    if (!(file instanceof File)) return { ok: false, error: "Arquivo não recebido." };
    if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Imagem acima de 3 MB." };
    const data = Buffer.from(await file.arrayBuffer());
    const kind = sniffImage(data);
    if (!kind) return { ok: false, error: "Use imagens JPG, PNG ou WebP." };
    const url = await getRepository().uploadImage(data, kind.extension, kind.contentType);
    return { ok: true, url };
  } catch (error) {
    return failure(error, "Não foi possível enviar a imagem.");
  }
}

export async function saveCategoryAction(slug: string | null, input: { label: string; image: string | null }): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const repo = getRepository();
    if (!slug) {
      const category = await repo.createCategory(parsed.data);
      refreshStore();
      return { ok: true, category };
    }
    const previous = (await repo.listCategories()).find((c) => c.slug === slug);
    await repo.updateCategory(slug, parsed.data);
    if (previous?.image && previous.image !== parsed.data.image) await repo.removeImages([previous.image]);
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível salvar a categoria.");
  }
}

export async function setCategoryVisibleAction(slug: string, visible: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    await getRepository().setCategoryVisible(String(slug), Boolean(visible));
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível alterar a categoria.");
  }
}

export async function deleteCategoryAction(slug: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const repo = getRepository();
    const count = (await repo.list()).filter((p) => p.category === slug).length;
    if (count > 0) {
      return { ok: false, error: `Esta categoria tem ${count === 1 ? "1 produto" : `${count} produtos`}. Mova ou exclua antes de removê-la.` };
    }
    const category = (await repo.listCategories()).find((c) => c.slug === slug);
    await repo.removeCategory(slug);
    if (category?.image) await repo.removeImages([category.image]);
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível excluir a categoria.");
  }
}

export async function reorderCategoriesAction(orderedSlugs: string[]): Promise<ActionResult> {
  try {
    await assertAdmin();
    await getRepository().reorderCategories(orderedSlugs.map(String));
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível salvar a nova ordem.");
  }
}

/** Salva só a parte editada: a home e a identidade têm telas separadas no mesmo documento. */
export async function saveContentAction(patch: Partial<SiteContent>): Promise<ActionResult> {
  try {
    await assertAdmin();
    const repo = getRepository();
    const previous = await repo.getContent();
    const parsed = contentSchema.safeParse({ ...previous, ...patch });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue.path[0] === "home" && typeof issue.path[1] === "number" ? `Seção ${issue.path[1] + 1}: ` : "";
      return { ok: false, error: `${where}${issue.message}` };
    }
    const next = parsed.data as SiteContent;
    await repo.saveContent(next);
    const kept = new Set(contentImages(next));
    await repo.removeImages(contentImages(previous).filter((url) => !kept.has(url)));
    refreshStore();
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível salvar as alterações.");
  }
}

export async function changePasswordAction(password: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!isSupabaseConfigured()) return { ok: false, error: "No modo demonstração, a senha fica no arquivo .env.local." };
    if (password.length < 10) return { ok: false, error: "Use pelo menos 10 caracteres." };
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (error) {
    return failure(error, "Não foi possível alterar a senha.");
  }
}
