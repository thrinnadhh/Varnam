-- ==============================================================================
-- Varnam Girls' Couture & Indian Boutique Storefront
-- Migration: 20261120000001_craft_and_admin_operations.sql
-- Indian Craft Specifications, Banners, Coupons, Courier Tracking & Audit Logs
-- ==============================================================================

-- 1. Extend products with authentic Indian craft specifications
alter table public.products
  add column if not exists craft_work text,
  add column if not exists set_includes text,
  add column if not exists wash_care text;

comment on column public.products.craft_work is 'Artisanal embellishments and weaving techniques (e.g. Zari Border, Gota Patti, Mirror Work, Handblock Print)';
comment on column public.products.set_includes is 'List of items in the ensemble (e.g. Top + Skirt + Dupatta, Dress + Matching Potli)';
comment on column public.products.wash_care is 'Garment care instructions (e.g. Dry Clean Only, Gentle Hand Wash Cold)';

-- 2. Extend orders with dedicated courier partner and AWB number
alter table public.orders
  add column if not exists courier_partner text,
  add column if not exists awb_number text;

-- Keep carrier/courier_partner and tracking_number/awb_number in sync if one is updated
create or replace function public.sync_order_courier_fields()
returns trigger
language plpgsql
as $$
begin
  if new.courier_partner is not null and new.carrier is null then
    new.carrier := new.courier_partner;
  elsif new.carrier is not null and new.courier_partner is null then
    new.courier_partner := new.carrier;
  end if;

  if new.awb_number is not null and new.tracking_number is null then
    new.tracking_number := new.awb_number;
  elsif new.tracking_number is not null and new.awb_number is null then
    new.awb_number := new.tracking_number;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_order_courier_fields on public.orders;
create trigger trg_sync_order_courier_fields
before insert or update on public.orders
for each row execute function public.sync_order_courier_fields();

-- 3. Banners Table for Storefront Carousel & Festive Promos
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text not null default 'Shop Collection',
  cta_link text not null default '/collections',
  image_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;

-- Public can view active banners
create policy "Public can view active banners"
  on public.banners for select
  using (is_active = true or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Admins can manage banners
create policy "Admins can manage banners"
  on public.banners for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 4. Coupons & Promotion Engine Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value bigint not null check (discount_value > 0), -- Paise for fixed, or percentage points (e.g. 15 for 15%)
  min_order_amount bigint not null default 0 check (min_order_amount >= 0), -- In paise
  usage_count integer not null default 0,
  max_uses integer,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

-- Anyone can check active coupons for cart discount calculation
create policy "Anyone can read active coupons"
  on public.coupons for select
  using (is_active = true and (expires_at is null or expires_at > now()));

-- Admins can manage coupons
create policy "Admins can manage coupons"
  on public.coupons for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 5. Inventory Audit Log
create table if not exists public.inventory_audit_log (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  event_type text not null check (event_type in ('order_reserved', 'order_cancelled', 'order_restocked', 'manual_adjustment', 'karigar_restock')),
  quantity_change integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  reference_id text,
  operator text not null default 'system',
  created_at timestamptz not null default now()
);

alter table public.inventory_audit_log enable row level security;

-- Only admins can view audit log
create policy "Admins can view inventory audit log"
  on public.inventory_audit_log for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Admins or system can insert audit log
create policy "Admins can insert inventory audit log"
  on public.inventory_audit_log for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Explicit grants for newly created tables
grant select on public.banners to anon, authenticated;
grant select on public.coupons to anon, authenticated;
grant select, insert, update, delete on public.banners, public.coupons, public.inventory_audit_log to authenticated;
grant all on public.banners, public.coupons, public.inventory_audit_log to service_role;
