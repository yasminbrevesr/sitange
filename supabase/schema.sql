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
