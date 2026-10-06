-- TANGÈ: tabelas do site no Supabase.
-- Como usar: Supabase → SQL Editor → New query → colar tudo → Run.
-- Pode rodar mais de uma vez sem duplicar nada.

-- =====================================================================
-- 1) PERFIS: uma linha para cada conta criada no site (tela "Criar conta")
-- =====================================================================
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text,
  name              text,
  marketing_consent boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada cliente só vê e edita o próprio perfil
drop policy if exists "perfil: ver o proprio" on public.profiles;
create policy "perfil: ver o proprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "perfil: editar o proprio" on public.profiles;
create policy "perfil: editar o proprio" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, marketing_consent)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém o e-mail do perfil igual ao da conta se a pessoa trocar o e-mail
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email, updated_at = now() where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- =====================================================================
-- 2) LEADS: cadastros do popup "10% OFF no seu primeiro pedido"
-- =====================================================================
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (char_length(email) between 3 and 254 and email like '%@%'),
  phone      text check (phone is null or phone ~ '^\+[0-9]{8,15}$'),
  source     text not null default 'popup-cupom-10' check (char_length(source) <= 50),
  consent    boolean not null check (consent = true),
  created_at timestamptz not null default now(),
  unique (email, source) -- evita cadastro duplicado da mesma pessoa no mesmo formulário
);

alter table public.leads enable row level security;

-- O site só pode INSERIR leads. Ninguém consegue ler a lista pelo site;
-- vocês veem os dados pelo painel do Supabase (Table Editor).
drop policy if exists "leads: site pode inserir" on public.leads;
create policy "leads: site pode inserir" on public.leads
  for insert to anon, authenticated with check (consent = true);

-- =====================================================================
-- 3) MINHA CONTA: dados extras do perfil e endereços
-- =====================================================================
alter table public.profiles add column if not exists cpf        text check (cpf is null or cpf ~ '^[0-9]{11}$');
alter table public.profiles add column if not exists phone      text check (phone is null or phone ~ '^\+[0-9]{8,15}$');
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists ring_size  smallint check (ring_size is null or ring_size between 10 and 26);

-- Permite criar o próprio perfil (para contas feitas antes do gatilho existir)
drop policy if exists "perfil: criar o proprio" on public.profiles;
create policy "perfil: criar o proprio" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label       text check (label is null or char_length(label) <= 40),
  recipient   text not null check (char_length(recipient) between 2 and 120),
  cep         text not null check (cep ~ '^[0-9]{8}$'),
  street      text not null check (char_length(street) <= 200),
  number      text not null check (char_length(number) <= 20),
  complement  text check (complement is null or char_length(complement) <= 100),
  district    text not null check (char_length(district) <= 100),
  city        text not null check (char_length(city) <= 100),
  state       text not null check (state ~ '^[A-Z]{2}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);
-- No máximo um endereço principal por cliente
create unique index if not exists addresses_one_default_idx on public.addresses (user_id) where is_default;

alter table public.addresses enable row level security;

-- Cada cliente vê, cria, edita e apaga só os próprios endereços
drop policy if exists "enderecos: ver os proprios" on public.addresses;
create policy "enderecos: ver os proprios" on public.addresses
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "enderecos: criar os proprios" on public.addresses;
create policy "enderecos: criar os proprios" on public.addresses
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "enderecos: editar os proprios" on public.addresses;
create policy "enderecos: editar os proprios" on public.addresses
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "enderecos: apagar os proprios" on public.addresses;
create policy "enderecos: apagar os proprios" on public.addresses
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Pedidos
-- Criados e atualizados SÓ pelas funções do servidor (criar-pix e webhook-mercadopago),
-- que usam a chave de serviço do Supabase. O cliente só consegue LER os próprios pedidos.
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  number            bigint generated always as identity,
  user_id           uuid not null references auth.users (id) on delete restrict,
  status            text not null default 'aguardando_pagamento'
                    check (status in ('aguardando_pagamento', 'pago', 'em_producao', 'enviado', 'entregue', 'cancelado', 'expirado')),
  items             jsonb not null,           -- [{ productId, name, priceCents, sizes, engraving }]
  subtotal_cents    integer not null,
  shipping_cents    integer not null,
  discount_cents    integer not null default 0,
  total_cents       integer not null,
  shipping_service  text not null,
  shipping_days     integer,
  shipping_address  jsonb not null,           -- cópia do endereço no momento da compra
  payment_method    text not null check (payment_method in ('pix', 'cartao')),
  mp_payment_id     text,
  pix_qr_code       text,
  pix_qr_base64     text,
  pix_expires_at    timestamptz,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);
create unique index if not exists orders_mp_payment_id_idx on public.orders (mp_payment_id) where mp_payment_id is not null;

alter table public.orders enable row level security;

drop policy if exists "pedidos: ver os proprios" on public.orders;
create policy "pedidos: ver os proprios" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);
-- Sem políticas de insert/update/delete: o site não cria nem altera pedidos direto.

-- ---------------------------------------------------------------------------
-- Painel da loja (/admin): etapas do pedido e quem pode administrar
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists tracking_code  text;
alter table public.orders add column if not exists production_at  timestamptz;
alter table public.orders add column if not exists shipped_at     timestamptz;
alter table public.orders add column if not exists delivered_at   timestamptz;

-- Etapas: aguardando_pagamento → pago → em_producao → enviado → entregue (ou cancelado/expirado)
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('aguardando_pagamento', 'pago', 'em_producao', 'enviado', 'entregue', 'cancelado', 'expirado'));

-- Administradores da loja. Para incluir alguém (a pessoa precisa ter conta no site):
--   insert into public.admins (user_id) select id from auth.users where email = 'email@exemplo.com' on conflict do nothing;
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Sem políticas: ninguém lê nem altera esta tabela pelo site; só as funções abaixo consultam.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Lista de pedidos para o painel, com os dados do cliente
create or replace function public.admin_pedidos()
returns table (
  id uuid, number bigint, status text, items jsonb,
  subtotal_cents integer, shipping_cents integer, discount_cents integer, total_cents integer,
  shipping_service text, shipping_days integer, shipping_address jsonb, payment_method text,
  tracking_code text, created_at timestamptz, paid_at timestamptz, production_at timestamptz,
  shipped_at timestamptz, delivered_at timestamptz,
  customer_name text, customer_email text, customer_cpf text, customer_phone text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'acesso restrito' using errcode = '42501';
  end if;
  return query
    select o.id, o.number, o.status, o.items,
           o.subtotal_cents, o.shipping_cents, o.discount_cents, o.total_cents,
           o.shipping_service, o.shipping_days, o.shipping_address, o.payment_method,
           o.tracking_code, o.created_at, o.paid_at, o.production_at, o.shipped_at, o.delivered_at,
           p.name, p.email, p.cpf, p.phone
    from public.orders o
    left join public.profiles p on p.id = o.user_id
    order by o.created_at desc
    limit 500;
end;
$$;

-- Avança a etapa de um pedido (só administradores, só na ordem certa)
create or replace function public.admin_avancar_pedido(p_id uuid, p_status text, p_rastreio text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  atual text;
begin
  if not public.is_admin() then
    raise exception 'acesso restrito' using errcode = '42501';
  end if;
  select status into atual from public.orders where id = p_id for update;
  if atual is null then
    raise exception 'pedido não encontrado';
  end if;
  if not ((atual = 'pago' and p_status = 'em_producao')
       or (atual = 'em_producao' and p_status = 'enviado')
       or (atual = 'enviado' and p_status = 'entregue')) then
    raise exception 'etapa inválida: % para %', atual, p_status;
  end if;
  if p_status = 'enviado' and coalesce(trim(p_rastreio), '') = '' then
    raise exception 'informe o código de rastreio';
  end if;
  update public.orders set
    status        = p_status,
    tracking_code = case when p_status = 'enviado' then upper(trim(p_rastreio)) else tracking_code end,
    production_at = case when p_status = 'em_producao' then now() else production_at end,
    shipped_at    = case when p_status = 'enviado' then now() else shipped_at end,
    delivered_at  = case when p_status = 'entregue' then now() else delivered_at end,
    updated_at    = now()
  where id = p_id;
end;
$$;

revoke all on function public.admin_pedidos() from public, anon;
revoke all on function public.admin_avancar_pedido(uuid, text, text) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_pedidos() to authenticated;
grant execute on function public.admin_avancar_pedido(uuid, text, text) to authenticated;
