-- Harvest Bites — schema inicial
-- Convenção: identificadores em camelCase com aspas duplas para alinhar com os tipos
-- TypeScript existentes em src/app/types/meal.ts e nos componentes.

create extension if not exists "pgcrypto";

-- Enums
create type meal_category as enum ('Chicken', 'Beef', 'Veggie', 'Fish', 'Combo', 'Carbs', 'Other');
create type order_status as enum ('pending', 'preparing', 'delivery', 'completed', 'cancelled');
create type lead_status as enum ('pending', 'responded');

-- Tabelas
create table public.meals (
  id text primary key,
  name text not null,
  category meal_category not null,
  description text default '',
  price numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  calories numeric not null default 0,
  "imageUrl" text,
  rating numeric,
  "isDairyFree" boolean default false,
  "isGlutenFree" boolean default false,
  "isSugarFree" boolean default false,
  "isArchived" boolean default false,
  "isAvailableForCombo" boolean default true,
  "stockQuantity" integer,
  configuration jsonb,
  "createdAt" timestamptz not null default now()
);

create table public.categories (
  id text primary key,
  label text not null,
  "sortOrder" integer default 0
);

create table public.users (
  phone text primary key,
  name text not null,
  address jsonb,
  "createdAt" timestamptz not null default now()
);

create table public.orders (
  id text primary key,
  "userId" text,
  "customerName" text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  "deliveryFee" numeric not null default 0,
  total numeric not null default 0,
  status order_status not null default 'pending',
  "paymentMethod" text,
  address jsonb,
  "couponCode" text,
  "changeFor" text,
  "createdAt" timestamptz not null default now()
);

create table public.leads (
  id text primary key,
  "userId" text,
  "customerName" text,
  "textPlan" text,
  "photoDataUri" text,
  status lead_status not null default 'pending',
  "createdAt" timestamptz not null default now()
);

create table public.coupons (
  id text primary key,
  code text not null unique,
  "discountPercent" numeric not null default 0,
  "isActive" boolean not null default true,
  description text,
  owner text,
  "createdAt" timestamptz not null default now()
);

create table public.settings (
  id text primary key default 'global',
  "isAiAnalysisEnabled" boolean default true,
  "isCouponsEnabled" boolean default true,
  "isVeggieCategoryVisible" boolean default true,
  "isDeliveryOpen" boolean default true,
  "activeCouponCode" text,
  "couponDiscountPercent" numeric,
  "nextDeliveryDate" text,
  "orderDeadline" text,
  "openingHours" text,
  "detailedSchedule" jsonb,
  "specialDates" jsonb
);

-- Singleton de settings
insert into public.settings (id) values ('global') on conflict (id) do nothing;

-- Índices úteis
create index meals_category_idx on public.meals (category);
create index meals_archived_idx on public.meals ("isArchived");
create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders ("createdAt" desc);
create index leads_status_idx on public.leads (status);
create index leads_created_idx on public.leads ("createdAt" desc);

-- Realtime nas tabelas que o painel admin precisa observar ao vivo
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.leads;

-- ========================================================
-- Row Level Security
-- ========================================================

-- meals: catálogo público; só authenticated escreve
alter table public.meals enable row level security;
create policy meals_public_select on public.meals for select using (true);
create policy meals_admin_all on public.meals for all
  to authenticated using (true) with check (true);

-- categories: catálogo público; só authenticated escreve
alter table public.categories enable row level security;
create policy categories_public_select on public.categories for select using (true);
create policy categories_admin_all on public.categories for all
  to authenticated using (true) with check (true);

-- coupons: público pode ler (validar código no checkout); só authenticated escreve
alter table public.coupons enable row level security;
create policy coupons_public_select on public.coupons for select using (true);
create policy coupons_admin_all on public.coupons for all
  to authenticated using (true) with check (true);

-- settings: leitura pública (toggles consumidos pelo cliente); só authenticated escreve
alter table public.settings enable row level security;
create policy settings_public_select on public.settings for select using (true);
create policy settings_admin_all on public.settings for all
  to authenticated using (true) with check (true);

-- users: cliente cria/atualiza por telefone (sem auth) — leitura/admin total para authenticated
-- NOTA: leitura pública preserva o lookup atual por telefone no IdentificationDialog.
-- Substituir por RPC restrita quando endurecer a segurança de PII.
alter table public.users enable row level security;
create policy users_public_select on public.users for select using (true);
create policy users_public_insert on public.users for insert with check (true);
create policy users_public_update on public.users for update using (true) with check (true);
create policy users_admin_delete on public.users for delete to authenticated using (true);

-- orders: cliente cria; só authenticated lista/atualiza/deleta
alter table public.orders enable row level security;
create policy orders_public_insert on public.orders for insert with check (true);
create policy orders_admin_select on public.orders for select to authenticated using (true);
create policy orders_admin_update on public.orders for update to authenticated using (true) with check (true);
create policy orders_admin_delete on public.orders for delete to authenticated using (true);

-- leads: cliente cria; só authenticated lista/atualiza/deleta
alter table public.leads enable row level security;
create policy leads_public_insert on public.leads for insert with check (true);
create policy leads_admin_select on public.leads for select to authenticated using (true);
create policy leads_admin_update on public.leads for update to authenticated using (true) with check (true);
create policy leads_admin_delete on public.leads for delete to authenticated using (true);

-- Categorias padrão
insert into public.categories (id, label, "sortOrder") values
  ('Chicken', 'Frango', 1),
  ('Beef', 'Carne Bovina', 2),
  ('Fish', 'Outros', 3),
  ('Carbs', 'Carboidratos', 4),
  ('Veggie', 'Legumes e Vegetais', 5),
  ('Combo', 'Combo', 6)
on conflict (id) do nothing;
