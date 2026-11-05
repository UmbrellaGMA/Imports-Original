import Image from "next/image";

type LogoProps = { name: string; logoUrl: string | null; className?: string };

/** Logo enviado pelo painel ou, sem ele, o nome da loja em texto. */
export function Logo({ name, logoUrl, className = "" }: LogoProps) {
  if (logoUrl) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Image src={logoUrl} alt={name} width={160} height={32} unoptimized priority className="h-7 w-auto max-w-[170px] object-contain" />
      </span>
    );
  }
  // O monograma "IO" só faz sentido com o nome original da marca.
  const monogram = name.trim().toLowerCase() === "imports original";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {monogram && (
        <svg width="24" height="18" viewBox="0 0 32 24" aria-hidden="true" className="shrink-0">
          <rect x="1" y="2" width="3.6" height="20" rx="1.8" fill="currentColor" />
          <circle cx="20" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="3.6" />
        </svg>
      )}
      <span className="whitespace-nowrap text-[12.5px] font-semibold uppercase tracking-[0.14em]">{name}</span>
    </span>
  );
}
