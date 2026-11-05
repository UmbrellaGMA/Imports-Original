import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";

export default function NotFound() {
  return (
    <StoreShell>
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-header text-center">
        <h1 className="headline">Não encontramos esta página.</h1>
        <p className="lede mt-4 max-w-md text-ink-mute">O endereço pode ter mudado ou o produto não estar mais no catálogo.</p>
        <Link href="/catalogo" className="btn btn-dark mt-8">Ver o catálogo</Link>
      </main>
    </StoreShell>
  );
}
