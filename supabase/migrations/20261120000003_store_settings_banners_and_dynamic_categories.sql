-- ==============================================================================
-- Varnam Girls' Couture & Indian Festive Luxury Storefront
-- Migration: 20261120000003_store_settings_banners_and_dynamic_categories.sql
-- Store Settings (Rotation Duration Control), Dynamic Hero Banners,
-- Category Tree Navigation (Subheadings & Clothing Types), and FK Deletion Safety
-- ==============================================================================

-- ==========================================
-- 1. Store Settings Table (Singleton)
-- ==========================================
create table if not exists public.store_settings (
  id text primary key check (id = 'default'),
  hero_banner_duration_sec integer not null default 3 check (hero_banner_duration_sec between 1 and 30),
  announcement_bar_text text default '✨ Festive Special: Free Shipping across India on prepaid orders above ₹1,499 | Handcrafted with 1-inch inner growth seam allowance',
  active_theme text not null default 'warm_kraft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.store_settings is 'Storewide configuration including rotating hero banner duration and announcement bar text.';

alter table public.store_settings enable row level security;

-- Public can view store settings
drop policy if exists "store_settings_public_select" on public.store_settings;
create policy "store_settings_public_select"
  on public.store_settings for select
  using (true);

-- Admins can update store settings
drop policy if exists "store_settings_admin_all" on public.store_settings;
create policy "store_settings_admin_all"
  on public.store_settings for all
  to authenticated
  using ((select is_admin()))
  with check ((select is_admin()));

-- Seed initial singleton record
insert into public.store_settings (id, hero_banner_duration_sec, announcement_bar_text, active_theme)
values (
  'default',
  3,
  '✨ Festive Special: Free Shipping across India on prepaid orders above ₹1,499 | Handcrafted with 1-inch inner growth seam allowance',
  'warm_kraft'
)
on conflict (id) do update set
  hero_banner_duration_sec = coalesce(public.store_settings.hero_banner_duration_sec, 3),
  updated_at = now();

-- ==========================================
-- 2. Hero Banners Table & Storage Bucket
-- ==========================================
create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow_text text,
  title text not null,
  subtitle text,
  cta_label text not null default 'Explore Collection',
  cta_href text not null default '/collections',
  desktop_image_url text not null,
  mobile_image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hero_banners is 'Admin-managed rotating hero banners with customizable timer and responsive imagery.';

alter table public.hero_banners enable row level security;

drop policy if exists "hero_banners_public_select" on public.hero_banners;
create policy "hero_banners_public_select"
  on public.hero_banners for select
  using (is_active = true or (select is_admin()));

drop policy if exists "hero_banners_admin_all" on public.hero_banners;
create policy "hero_banners_admin_all"
  on public.hero_banners for all
  to authenticated
  using ((select is_admin()))
  with check ((select is_admin()));

-- Create Storage bucket for banners if not exists
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do update set public = true;

-- Storage policies for banners bucket
drop policy if exists "banners_bucket_public_select" on storage.objects;
create policy "banners_bucket_public_select"
  on storage.objects for select
  using (bucket_id = 'banners');

drop policy if exists "banners_bucket_admin_manage" on storage.objects;
create policy "banners_bucket_admin_manage"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'banners' and (select is_admin()))
  with check (bucket_id = 'banners' and (select is_admin()));

-- Seed initial rotating hero banners
insert into public.hero_banners (
  id, eyebrow_text, title, subtitle, cta_label, cta_href, desktop_image_url, mobile_image_url, sort_order, is_active
) values
(
  'e1a00001-0000-0000-0000-000000000001',
  'Diwali & Wedding Celebrations',
  'Royal Zari & Handloom Tissue Lehengas',
  'Pure Kanchi tissue weaves and velvet lehengas lined in 100% breathable malmal with 1-inch inner growth seam allowance.',
  'Explore Lehengas',
  '/collections/pattu-lehengas',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  1,
  true
),
(
  'e1a00001-0000-0000-0000-000000000002',
  'Joyful Heritage Twirls',
  'Artisanal Anarkalis & Festive Shararas',
  'Floor-sweeping pure raw silk flared silhouettes crafted with artisanal gota patti and heritage marigold borders.',
  'Shop Anarkalis',
  '/collections/anarkali-shararas',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  2,
  true
),
(
  'e1a00001-0000-0000-0000-000000000003',
  'Comfort Meets Celebration',
  'Breathable Mulmul & Festive Frocks',
  'Ultra-soft tiered cotton twirl frocks with delicate handwork for girls of all ages from 1 to 16 years.',
  'Discover Frocks',
  '/collections/mulmul-festive-frocks',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  3,
  true
)
on conflict (id) do nothing;

-- ==========================================
-- 3. Dynamic Categories & Hierarchy
-- ==========================================
alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete cascade,
  add column if not exists sort_order integer not null default 0,
  add column if not exists show_in_nav boolean not null default true;

-- Ensure display_order and sort_order stay in sync
update public.categories set sort_order = display_order where sort_order = 0 and display_order != 0;

-- ==========================================
-- 4. Foreign Key Safety on Products
-- ==========================================
-- Allow products.category_id to be nullable so deleting a category sets it to NULL instead of throwing
alter table public.products alter column category_id drop not null;

alter table public.products drop constraint if exists products_category_id_fkey;
alter table public.products
  add constraint products_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;

alter table public.products
  add column if not exists subcategory_id uuid references public.categories(id) on delete set null;

-- ==========================================
-- 5. Seed 3 Primary Storefront Subheadings & Clothing Types
-- ==========================================
-- 1. Pattu & Lehengas
insert into public.categories (id, name, slug, segment, description, sort_order, display_order, is_active, show_in_nav)
values (
  'c1a00001-0000-0000-0000-000000000001',
  'Pattu & Lehengas',
  'pattu-lehengas',
  'all',
  'Traditional South Indian Pattu Pavadais and grand wedding lehengas with pure zari borders.',
  1,
  1,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = 1,
  show_in_nav = true,
  is_active = true;

-- Children for Pattu & Lehengas
insert into public.categories (id, parent_id, name, slug, segment, description, sort_order, display_order, is_active, show_in_nav)
values
(
  'c1a00001-0000-0000-0000-000000000011',
  'c1a00001-0000-0000-0000-000000000001',
  'Pattu Pavadai',
  'pattu-pavadai',
  'girls',
  'Classic handloom silk pavadais with gold zari pallus for festivals and poojas.',
  1,
  1,
  true,
  true
),
(
  'c1a00001-0000-0000-0000-000000000012',
  'c1a00001-0000-0000-0000-000000000001',
  'Velvet & Brocade Lehengas',
  'velvet-brocade-lehengas',
  'all',
  'Opulent royal velvet flared lehengas with artisanal embroidery and matching potli bags.',
  2,
  2,
  true,
  true
),
(
  'c1a00001-0000-0000-0000-000000000013',
  'c1a00001-0000-0000-0000-000000000001',
  'Handloom Kanchi Tissue Sets',
  'handloom-kanchi-tissue-sets',
  'all',
  'Shimmering gold and silver tissue silk sets tailored for milestone celebrations.',
  3,
  3,
  true,
  true
)
on conflict (slug) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  sort_order = excluded.sort_order,
  show_in_nav = true,
  is_active = true;

-- 2. Anarkali & Shararas
insert into public.categories (id, name, slug, segment, description, sort_order, display_order, is_active, show_in_nav)
values (
  'c1a00001-0000-0000-0000-000000000002',
  'Anarkali & Shararas',
  'anarkali-shararas',
  'all',
  'High-flare silk anarkalis, festive sharara sets, and peplum kurtas.',
  2,
  2,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = 2,
  show_in_nav = true,
  is_active = true;

-- Children for Anarkali & Shararas
insert into public.categories (id, parent_id, name, slug, segment, description, sort_order, display_order, is_active, show_in_nav)
values
(
  'c1a00001-0000-0000-0000-000000000021',
  'c1a00001-0000-0000-0000-000000000002',
  'Floor-Length Silk Anarkalis',
  'floor-length-silk-anarkalis',
  'all',
  'Flared multi-kali silhouette anarkalis crafted from Varanasi raw silk.',
  1,
  1,
  true,
  true
),
(
  'c1a00001-0000-0000-0000-000000000022',
  'c1a00001-0000-0000-0000-000000000002',
  'Twirl Flare Sharara Suits',
  'twirl-flare-sharara-suits',
  'all',
  'Voluminous tiered shararas with intricately embellished short kurtis.',
  2,
  2,
  true,
  true
),
(
  'c1a00001-0000-0000-0000-000000000023',
  'c1a00001-0000-0000-0000-000000000002',
  'Angrakha Peplum Sets',
  'angrakha-peplum-sets',
  'teens',
  'Cross-over tie-up angrakhas paired with flared dhoti pants or skirts.',
  3,
  3,
  true,
  true
)
on conflict (slug) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  sort_order = excluded.sort_order,
  show_in_nav = true,
  is_active = true;

-- 3. Mulmul & Festive Frocks
insert into public.categories (id, name, slug, segment, description, sort_order, display_order, is_active, show_in_nav)
values (
  'c1a00001-0000-0000-0000-000000000003',
  'Mulmul & Festive Frocks',
  'mulmul-festive-frocks',
  'girls',
  'Breathable pure cotton and organza twirl frocks with artisanal motifs.',
  3,
  3,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = 3,
  show_in_nav = true,
  is_active = true;

-- Children for Mulmul & Festive Frocks
insert into public.categories (id, parent_id, name, slug, segment, description, sort_order, display_order, is_active, show_in_nav)
values
(
  'c1a00001-0000-0000-0000-000000000031',
  'c1a00001-0000-0000-0000-000000000003',
  'Tiered Festive Cotton Frocks',
  'tiered-festive-cotton-frocks',
  'girls',
  'Soft malmal cotton twirl dresses with handblock printed ruffles.',
  1,
  1,
  true,
  true
),
(
  'c1a00001-0000-0000-0000-000000000032',
  'c1a00001-0000-0000-0000-000000000003',
  'Embroidered Yoke Twirl Dresses',
  'embroidered-yoke-twirl-dresses',
  'girls',
  'Frocks featuring zari yoke embroidery and joyful gather skirts.',
  2,
  2,
  true,
  true
),
(
  'c1a00001-0000-0000-0000-000000000033',
  'c1a00001-0000-0000-0000-000000000003',
  'Zari-Trimmed Organza Frocks',
  'zari-trimmed-organza-frocks',
  'girls',
  'Airy sheer organza occasion frocks with glistening festive borders.',
  3,
  3,
  true,
  true
)
on conflict (slug) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  sort_order = excluded.sort_order,
  show_in_nav = true,
  is_active = true;

-- Also associate seeded dress products with these subcategories for rich demo data if applicable
update public.products
set category_id = 'c1a00001-0000-0000-0000-000000000002',
    subcategory_id = 'c1a00001-0000-0000-0000-000000000021'
where slug = 'aashna-royal-crimson-raw-silk-zari-anarkali-gown';

-- ==========================================
-- 6. Update create_order_atomic RPC for Deletion Safety
-- ==========================================
create or replace function public.create_order_atomic(
  p_items jsonb, -- Array of { variant_id: uuid, quantity: int }
  p_shipping_address jsonb,
  p_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_item record;
  v_variant record;
  v_product record;
  v_subtotal bigint := 0;
  v_shipping bigint := 0;
  v_total bigint := 0;
  v_item_subtotal bigint;
  v_initial_status text;
  v_expires_at timestamptz;
begin
  -- 1. Identify user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required to place an order.';
  end if;

  if p_payment_method not in ('cashfree', 'cod') then
    raise exception 'Invalid payment method: %', p_payment_method;
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order items list cannot be empty.';
  end if;

  -- 2. Validate mandatory shipping address keys
  if not (
    p_shipping_address ? 'name' and
    p_shipping_address ? 'phone' and
    p_shipping_address ? 'address_line1' and
    p_shipping_address ? 'city' and
    p_shipping_address ? 'state' and
    p_shipping_address ? 'postal_code'
  ) then
    raise exception 'Malformed shipping address: mandatory fields missing.';
  end if;

  -- 3. Determine status and expiration TTL: COD IS STRICTLY EXCLUDED FROM TTL!
  if p_payment_method = 'cod' then
    v_initial_status := 'confirmed';
    v_expires_at := null; -- COD orders NEVER expire on payment timeout
  else
    v_initial_status := 'pending';
    v_expires_at := now() + interval '15 minutes'; -- 15-minute checkout reservation
  end if;

  -- 4. High-entropy, collision-resistant order number
  v_order_number := 'VRN-' || to_char(clock_timestamp(), 'YYYYMMDD-HH24MISS') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  -- 5. Create order record
  insert into public.orders (
    order_number,
    user_id,
    status,
    total_amount,
    subtotal_amount,
    shipping_amount,
    discount_amount,
    shipping_address,
    payment_method,
    payment_status,
    expires_at
  ) values (
    v_order_number,
    v_user_id,
    v_initial_status,
    0,
    0,
    0,
    0,
    p_shipping_address,
    p_payment_method,
    'pending',
    v_expires_at
  )
  returning id into v_order_id;

  -- 6. Aggregate input to deduplicate and sort by variant_id ASC to eliminate deadlocks!
  for v_item in (
    select x.variant_id, sum(x.quantity)::int as quantity
    from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity int)
    group by x.variant_id
    order by x.variant_id asc
  )
  loop
    if v_item.quantity <= 0 then
      raise exception 'Invalid item quantity: %', v_item.quantity;
    end if;

    -- Lock variant row and verify active status (allowing safe null category if category was deleted)
    select v.*, p.name as product_name, p.id as prod_id
    into v_variant
    from public.product_variants v
    join public.products p on p.id = v.product_id
    left join public.categories c on c.id = p.category_id
    where v.id = v_item.variant_id
      and v.is_active = true
      and p.is_active = true
      and (p.category_id is null or c.is_active = true)
    for update of v;

    if not found then
      raise exception 'Variant % is inactive or no longer available.', v_item.variant_id;
    end if;

    if v_variant.stock < v_item.quantity then
      raise exception 'Insufficient stock for SKU % (available: %, requested: %)',
        v_variant.sku, v_variant.stock, v_item.quantity;
    end if;

    -- Calculate line price (re-priced directly from database authority!)
    v_item_subtotal := v_variant.price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_subtotal;

    -- Decrement stock atomically
    update public.product_variants
    set stock = stock - v_item.quantity,
        updated_at = now()
    where id = v_variant.id;

    -- Record immutable order item snapshot (including sizing and pricing)
    insert into public.order_items (
      order_id,
      variant_id,
      product_id,
      product_name,
      size_age,
      size_group,
      size_name,
      color_name,
      price,
      quantity
    ) values (
      v_order_id,
      v_variant.id,
      v_variant.prod_id,
      v_variant.product_name,
      coalesce(v_variant.size_age, v_variant.size_name),
      v_variant.size_group,
      v_variant.size_name,
      v_variant.color_name,
      v_variant.price,
      v_item.quantity
    );

    -- Clear from user's persistent db cart if present
    delete from public.cart_items
    where user_id = v_user_id and variant_id = v_variant.id;
  end loop;

  -- 7. Apply standard free shipping policy: free above ₹999 (99900 paise), else ₹99 (9900 paise)
  if v_subtotal >= 99900 then
    v_shipping := 0;
  else
    v_shipping := 9900;
  end if;

  v_total := v_subtotal + v_shipping;

  -- 8. Finalize order totals
  update public.orders
  set total_amount = v_total,
      subtotal_amount = v_subtotal,
      shipping_amount = v_shipping,
      updated_at = now()
  where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_total,
    'subtotal_amount', v_subtotal,
    'shipping_amount', v_shipping,
    'payment_method', p_payment_method,
    'status', v_initial_status,
    'expires_at', v_expires_at
  );
end;
$$;

-- Table Grants for Anon & Authenticated Clients
grant select on public.store_settings to anon, authenticated;
grant all on public.store_settings to service_role;

grant select on public.hero_banners to anon, authenticated;
grant all on public.hero_banners to service_role;

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;

