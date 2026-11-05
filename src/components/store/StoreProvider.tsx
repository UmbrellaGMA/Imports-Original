"use client";

import { createContext, useContext } from "react";
import type { Category } from "@/lib/categories";
import type { SiteContent } from "@/lib/content";

export type StoreData = Pick<SiteContent, "brand" | "contact" | "nav"> & { categories: Category[] };

const StoreContext = createContext<StoreData | null>(null);

export function StoreProvider({ value, children }: { value: StoreData; children: React.ReactNode }) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore precisa estar dentro de StoreProvider.");
  return value;
}
