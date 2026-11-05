# Imports Original

Catálogo de celulares e eletrônicos com painel administrativo. Não há carrinho nem pagamento: cada produto leva a uma conversa no WhatsApp com a mensagem já preenchida.

Feito com Next.js, Tailwind CSS e Supabase.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O painel fica em http://localhost:3000/admin.

Sem as chaves do Supabase, o site roda em **modo demonstração**:

- Os produtos de exemplo aparecem sem preço, especificações ou cores.
- O que for cadastrado no painel fica na pasta `.data/`, somente neste computador.
- A senha do painel é o valor de `LOCAL_ADMIN_PASSWORD` no arquivo `.env.local`.

## Editar a loja pelo painel

| Tela | O que muda |
| --- | --- |
| Produtos | Cadastro, condição (novo ou seminovo), avarias, garantia, imagens, ajuste da capa, preços, destaque, esgotado, ordem, ocultar e duplicar |
| Categorias | Criar, renomear, trocar a imagem, reordenar, ocultar e excluir (só sem produtos) |
| Página inicial | Banners, títulos, vitrines e demais seções: editar, reordenar, ocultar, adicionar e excluir |
| Identidade e contato | Nome, logo, favicon, WhatsApp, Instagram, menu, rodapé, SEO e senha do painel |

O domínio final vai em `NEXT_PUBLIC_SITE_URL`, no `.env.local` e na hospedagem.

## Conectar outro projeto Supabase

O projeto atual já está configurado. Para recriar em outro:


1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas, as categorias iniciais, as regras de acesso e o espaço de imagens.
3. Em **Authentication > Users**, crie o usuário administrador com e-mail e senha.
4. Ainda no SQL Editor, dê acesso ao painel a esse usuário:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'seu-email@exemplo.com';
   ```

5. Em **Authentication > Sign In / Providers**, desative o cadastro público (*Allow new users to sign up*).
6. Em **Project Settings > API**, copie a URL e a chave `anon` para o `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

7. Reinicie o servidor. O aviso de demonstração some e o catálogo passa a vir do banco, inicialmente vazio.

Os dados do modo demonstração não são migrados: cadastre os produtos reais pelo painel.

## Publicar

Na Vercel, importe o projeto e cadastre as mesmas variáveis de ambiente. O modo demonstração não serve para produção, pois o disco do servidor não é permanente. Conecte o Supabase antes de publicar.

## Comandos

| Comando | Ação |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` e `npm start` | Versão de produção |
| `npm test` | Testes de preços, busca e filtros |
| `npm run lint` e `npm run typecheck` | Verificações de código |

## Onde fica cada coisa

- `src/app/(store)`: páginas públicas (início, catálogo, produto, privacidade)
- `src/app/admin`: painel, login e ações de gravação
- `src/lib/catalog`: acesso a dados, com as versões Supabase e local
- `src/lib/content.ts`: formato e valores iniciais do conteúdo editável
- `src/components/store/HomeSections.tsx`: seções da página inicial
- `public/art/`: ilustrações originais, geradas por `npm run art`
- `supabase/schema.sql`: estrutura do banco e regras de acesso
