-- Imports Original — estrutura do banco
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute uma vez.

-- ─── Administradores ────────────────────────────────────────────────────
-- Só quem estiver nesta tabela pode alterar o catálogo.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admin lê administradores" on public.admins;
create policy "admin lê administradores" on public.admins
  for select to authenticated using (public.is_admin());

-- ─── Categorias ─────────────────────────────────────────────────────────
-- O slug fica fixo depois de criado, para que os links continuem válidos ao renomear.
create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  label text not null check (char_length(label) between 2 and 60),
  image text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
-- Categoria oculta sai do site junto com os produtos dela; nada é apagado.
alter table public.categories add column if not exists visible boolean not null default true;
alter table public.categories enable row level security;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

drop policy if exists "categorias públicas" on public.categories;
create policy "categorias públicas" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "admin insere categorias" on public.categories;
create policy "admin insere categorias" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin altera categorias" on public.categories;
create policy "admin altera categorias" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin exclui categorias" on public.categories;
create policy "admin exclui categorias" on public.categories
  for delete to authenticated using (public.is_admin());

-- Só preenche em um banco novo: rodar de novo não recria o que o painel excluiu.
insert into public.categories (slug, label, image, sort_order)
select * from (values
  ('iphones', 'iPhones', '/art/phone-back-natural.svg', 1),
  ('smartphones', 'Smartphones', '/art/android-back-sage.svg', 2),
  ('macbooks', 'MacBooks', '/art/laptop.svg', 3),
  ('ipads', 'iPads', '/art/tablet.svg', 4),
  ('apple-watch', 'Apple Watch', '/art/watch.svg', 5),
  ('airpods', 'AirPods', '/art/earbuds.svg', 6),
  ('fones', 'Fones de ouvido', '/art/headphones.svg', 7),
  ('acessorios', 'Acessórios', '/art/charger.svg', 8),
  ('outros', 'Outros eletrônicos', '/art/speaker.svg', 9)
) as seed (slug, label, image, sort_order)
where not exists (select 1 from public.categories);

create or replace function public.reorder_categories(ordered_slugs text[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.categories as c
  set sort_order = o.position
  from unnest(ordered_slugs) with ordinality as o(slug, position)
  where c.slug = o.slug;
$$;

revoke all on function public.reorder_categories(text[]) from public;
grant execute on function public.reorder_categories(text[]) to authenticated;

-- ─── Conteúdo do site ───────────────────────────────────────────────────
-- Linha única com marca, contato, menu, rodapé e seções da página inicial.
-- Tudo aqui é público; não guarde segredos neste documento.
create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

drop policy if exists "conteúdo público" on public.site_settings;
create policy "conteúdo público" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "admin insere conteúdo" on public.site_settings;
create policy "admin insere conteúdo" on public.site_settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin altera conteúdo" on public.site_settings;
create policy "admin altera conteúdo" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─── Produtos ───────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 2 and 160),
  brand text not null,
  -- Uma categoria com produtos não pode ser excluída.
  category text not null references public.categories (slug) on update cascade on delete restrict,
  description text not null default '',
  additional_info text not null default '',
  price numeric(12, 2) check (price >= 0),
  promo_price numeric(12, 2) check (promo_price >= 0),
  specs jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  capacities text[] not null default '{}',
  images text[] not null default '{}',
  featured boolean not null default false,
  is_new boolean not null default false,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_requires_lower_price check (
    promo_price is null or (price is not null and promo_price < price)
  )
);

-- Condição do produto. Fica vazia em produtos antigos até ser informada no painel,
-- para o site nunca afirmar "novo" sem alguém ter declarado isso.
alter table public.products
  add column if not exists condition text,
  add column if not exists conservation text,
  add column if not exists battery_health smallint,
  add column if not exists sealed boolean not null default false,
  add column if not exists has_damage boolean not null default false,
  add column if not exists damage_notes text not null default '',
  add column if not exists repair_notes text not null default '',
  add column if not exists warranty text not null default '',
  add column if not exists included text[] not null default '{}';

alter table public.products drop constraint if exists products_condition_check;
alter table public.products add constraint products_condition_check
  check (condition is null or condition in ('novo', 'seminovo'));

alter table public.products drop constraint if exists products_conservation_check;
alter table public.products add constraint products_conservation_check
  check (conservation is null or conservation in ('excelente', 'muito-bom', 'bom', 'regular'));

alter table public.products drop constraint if exists products_battery_check;
alter table public.products add constraint products_battery_check
  check (battery_health is null or battery_health between 0 and 100);

alter table public.products drop constraint if exists products_damage_notes_check;
alter table public.products add constraint products_damage_notes_check
  check (not has_damage or char_length(damage_notes) > 0);

create index if not exists products_sort_idx on public.products (sort_order, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.admins to authenticated;

drop policy if exists "catálogo público" on public.products;
create policy "catálogo público" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "admin insere produtos" on public.products;
create policy "admin insere produtos" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin altera produtos" on public.products;
create policy "admin altera produtos" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin exclui produtos" on public.products;
create policy "admin exclui produtos" on public.products
  for delete to authenticated using (public.is_admin());

-- Reordenação em uma única transação. Roda com as permissões de quem chama,
-- portanto as políticas acima continuam valendo.
create or replace function public.reorder_products(ordered_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.products as p
  set sort_order = o.position
  from unnest(ordered_ids) with ordinality as o(id, position)
  where p.id = o.id;
$$;

revoke all on function public.reorder_products(uuid[]) from public;
grant execute on function public.reorder_products(uuid[]) to authenticated;

-- ─── Imagens ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- O Storage precisa enxergar o arquivo para excluí-lo; sem isto, a remoção não apaga nada.
-- O acesso público às imagens vem do bucket público, não desta política.
drop policy if exists "admin lista imagens" on storage.objects;
create policy "admin lista imagens" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin envia imagens" on storage.objects;
create policy "admin envia imagens" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin altera imagens" on storage.objects;
create policy "admin altera imagens" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin remove imagens" on storage.objects;
create policy "admin remove imagens" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
