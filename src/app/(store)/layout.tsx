import { StoreShell } from "@/components/store/StoreShell";

export const revalidate = 60;

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreShell>
      <main className="pt-header">{children}</main>
    </StoreShell>
  );
}
