import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getSiteContent } from "@/lib/catalog";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const { brand, seo } = await getSiteContent();
  const icon = brand.faviconUrl ?? "/favicon.svg";
  return {
    metadataBase: new URL(site.url),
    title: { default: seo.title, template: `%s | ${brand.name}` },
    description: seo.description,
    applicationName: brand.name,
    icons: { icon, ...(brand.faviconUrl ? { apple: brand.faviconUrl } : {}) },
    keywords: ["iPhone", "smartphones", "MacBook", "iPad", "Apple Watch", "AirPods", "fones de ouvido", "eletrônicos originais", brand.name],
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: brand.name,
      title: seo.title,
      description: seo.description,
      url: "/",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Habilita as animações de entrada; sem JavaScript o conteúdo aparece normalmente. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
