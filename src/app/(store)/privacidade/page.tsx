import type { Metadata } from "next";
import { getSiteContent } from "@/lib/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteContent();
  return {
    title: "Política de privacidade",
    description: `Como a ${brand.name} trata dados pessoais neste site.`,
    alternates: { canonical: "/privacidade" },
  };
}

const SECTIONS = [
  {
    title: "Dados que este site coleta",
    text: "Este site é um catálogo. Não há cadastro de clientes, carrinho nem pagamento online, e nenhum formulário solicita seus dados pessoais.",
  },
  {
    title: "Contato pelo WhatsApp",
    text: "Ao clicar em um botão de contato, você é direcionado ao WhatsApp com uma mensagem pronta, que só é enviada se você confirmar. As informações trocadas na conversa, como nome e telefone, são usadas apenas para atender à sua solicitação. O WhatsApp é um serviço de terceiro, com política de privacidade própria.",
  },
  {
    title: "Cookies",
    text: "Utilizamos apenas os cookies necessários para o funcionamento do site, como o de autenticação da área administrativa. Não usamos cookies de publicidade.",
  },
  {
    title: "Seus direitos",
    text: "Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a confirmação, o acesso, a correção ou a exclusão dos seus dados pessoais pelos nossos canais de atendimento.",
  },
  {
    title: "Alterações",
    text: "Esta política pode ser atualizada. A versão vigente estará sempre disponível nesta página.",
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[720px] px-5 pb-24 pt-14 md:pt-20">
      <h1 className="headline">Política de privacidade.</h1>
      <div className="mt-10 space-y-9">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-[-0.02em]">{section.title}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{section.text}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
