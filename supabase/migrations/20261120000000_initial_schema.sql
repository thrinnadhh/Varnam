-- Varnam Girls' Dress & Apparel Storefront
-- Migration: 20261120000000_initial_schema.sql
-- Production Hardened Edition

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Profiles Table
-- ==========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles linked to auth.users, supporting customer and admin roles.';

-- ==========================================
-- 2. Categories Table
-- ==========================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  segment text check (segment in ('girls', 'teens', 'women', 'all')) default 'all',
  description text,
  image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is 'Catalog categories (e.g. Frocks, Ethnic & Festive, Party Dresses, Casuals).';

-- ==========================================
-- 3. Products Table
-- ==========================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  segment text not null check (segment in ('girls', 'teens', 'women')),
  name text not null,
  slug text not null unique,
  description text not null,
  fabric text not null,
  lining text not null, -- No default: explicit declaration mandatory for comfort transparency
  care_instructions text not null,
  model_height text, -- e.g. "5'8\" (173 cm)" or "4'2\" (127 cm)"
  model_size_worn text, -- e.g. "Size S" or "Ages 6-7Y"
  size_chart jsonb, -- e.g. [{"size": "S", "bust_in": 34, "bust_cm": 86.4, "waist_in": 28, "waist_cm": 71.1, "hip_in": 38, "hip_cm": 96.5, "length_in": 52, "length_cm": 132}]
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Base dress products with rich fabric, explicit inner lining, and size chart disclosures.';

-- ==========================================
-- 4. Product Variants Table
-- ==========================================
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_group text not null check (size_group in ('kids', 'teen', 'women')),
  size_name text not null, -- e.g. '2-3Y', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', 'Free Size'
  size_age text, -- Alias/backwards compatible column
  bust_inches numeric(4,1),
  bust_cm numeric(5,1),
  waist_inches numeric(4,1),
  waist_cm numeric(5,1),
  hip_inches numeric(4,1),
  hip_cm numeric(5,1),
  length_inches numeric(4,1),
  length_cm numeric(5,1),
  color_name text not null,
  color_hex text not null,
  sku text not null unique,
  price bigint not null check (price >= 0), -- Stored in paise (INR)
  mrp bigint not null check (mrp >= price), -- Stored in paise (INR)
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_product_size_color unique (product_id, size_name, color_name)
);

comment on table public.product_variants is 'SKU variants partitioned by age/size and color with prices stored in paise.';

-- ==========================================
-- 5. Product Images Table
-- ==========================================
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.product_images is 'High-resolution dress imagery for PDP galleries and cards.';

-- ==========================================
-- 6. Cart Items Table
-- ==========================================
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_cart_variant unique (user_id, variant_id)
);

comment on table public.cart_items is 'Customer database cart items; synced from client guest cart on sign-in.';

-- ==========================================
-- 7. Wishlist Items Table
-- ==========================================
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_user_wishlist_product unique (user_id, product_id)
);

comment on table public.wishlist_items is 'Customer saved favorites with move-to-cart capability.';

-- ==========================================
-- 8. Customer Addresses Table
-- ==========================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.addresses is 'Customer shipping and delivery addresses.';

-- Enforce at most ONE default address per user via partial unique index
create unique index uq_addresses_user_default 
  on public.addresses (user_id) 
  where (is_default = true);

-- Auto toggle previous defaults when setting a new default address
create or replace function public.handle_address_default()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default = true then
    update public.addresses
    set is_default = false
    where user_id = new.user_id and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
  end if;
  return new;
end;
$$;

create trigger tr_address_default
  before insert or update of is_default on public.addresses
  for each row execute function public.handle_address_default();

-- ==========================================
-- 9. Orders Table
-- ==========================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  total_amount bigint not null check (total_amount >= 0), -- Total in paise
  subtotal_amount bigint not null check (subtotal_amount >= 0),
  shipping_amount bigint not null default 0 check (shipping_amount >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  shipping_address jsonb not null,
  payment_method text not null check (payment_method in ('cashfree', 'cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  carrier text, -- e.g. Delhivery, BlueDart, DTDC
  tracking_number text,
  tracking_url text,
  estimated_delivery_date date,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz, -- Reservation TTL for online checkouts (15 min); NULL for COD!
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Customer orders with snapshot totals, delivery tracking, and status lifecycle.';

-- ==========================================
-- 10. Order Items Table
-- ==========================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  size_age text not null,
  size_group text,
  size_name text,
  color_name text not null,
  price bigint not null check (price >= 0), -- Unit price in paise snapshot
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now()
);

comment on table public.order_items is 'Immutable snapshot of ordered items with locked price and attributes.';

-- ==========================================
-- 11. Payments Table
-- ==========================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  gateway text not null default 'cashfree',
  gateway_order_id text,
  gateway_payment_id text,
  payment_status text not null default 'pending',
  refund_status text not null default 'none' check (refund_status in ('none', 'refund_required', 'refund_initiated', 'refunded')),
  amount bigint not null check (amount >= 0), -- paise
  currency text not null default 'INR',
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_payments_gateway_payment unique (gateway, gateway_payment_id)
);

comment on table public.payments is 'Payment transaction log, idempotently verified from gateway webhooks.';

-- ==========================================
-- FOREIGN KEY & COMPOSITE PERFORMANCE INDEXES
-- ==========================================
create index idx_products_category on public.products(category_id);
create index idx_products_category_active on public.products(category_id, is_active);
create index idx_product_variants_product on public.product_variants(product_id);
create index idx_product_images_product on public.product_images(product_id);
create index idx_cart_items_user on public.cart_items(user_id);
create index idx_cart_items_variant on public.cart_items(variant_id);
create index idx_wishlist_items_user on public.wishlist_items(user_id);
create index idx_wishlist_items_product on public.wishlist_items(product_id);
create index idx_addresses_user on public.addresses(user_id);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_expires on public.orders(expires_at) where (status = 'pending' and payment_status = 'pending');
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_variant on public.order_items(variant_id);
create index idx_order_items_product on public.order_items(product_id);
create index idx_payments_order on public.payments(order_id);
create index idx_payments_gateway_order on public.payments(gateway_order_id);

-- Catalog filtering composite indexes
create index idx_products_active_featured on public.products(is_active, is_featured);
create index idx_variants_active_stock on public.product_variants(is_active, stock);
create index idx_categories_active_order on public.categories(is_active, display_order);

-- ==========================================
-- SECURITY FUNCTIONS & RBAC
-- ==========================================

-- Check if current authenticated user is admin (with short-circuit for anonymous)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select case 
    when (select auth.uid()) is null then false
    else exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    )
  end;
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Auto create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Guard: Prevent role escalation & unauthorized email spoofing
create or replace function public.prevent_profile_tampering()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Prevent role modification unless done by an admin or service_role
  if new.role is distinct from old.role then
    if coalesce(current_setting('role', true), '') not in ('service_role', 'postgres') and not (select public.is_admin()) then
      raise exception 'Unauthorized: Only an administrator can modify user roles.';
    end if;
  end if;

  -- Prevent direct email modification unless done by admin or service_role
  if new.email is distinct from old.email then
    if coalesce(current_setting('role', true), '') not in ('service_role', 'postgres') and not (select public.is_admin()) then
      raise exception 'Unauthorized: Profile email cannot be modified directly.';
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create trigger tr_prevent_profile_tampering
  before update on public.profiles
  for each row execute function public.prevent_profile_tampering();

-- Auto update updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tr_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger tr_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger tr_product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger tr_cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
create trigger tr_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger tr_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger tr_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

-- ==========================================
-- IDEMPOTENT RESTOCK TRIGGER & CANCELLATION GUARDS
-- ==========================================
create or replace function public.restore_stock_on_order_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Block cancelling orders that are already shipped or delivered
  if new.status = 'cancelled' and old.status in ('shipped', 'delivered') then
    raise exception 'Cannot cancel order %: order is already %.', old.order_number, old.status;
  end if;

  -- Idempotent stock restoration: restore ONLY IF transitioning from active state and NOT already cancelled
  if new.status = 'cancelled' and old.status in ('pending', 'confirmed', 'packed') and old.cancelled_at is null then
    update public.product_variants pv
    set stock = pv.stock + oi.quantity,
        updated_at = now()
    from public.order_items oi
    where oi.order_id = new.id and pv.id = oi.variant_id;

    new.cancelled_at = coalesce(new.cancelled_at, now());
  end if;

  return new;
end;
$$;

create trigger tr_restore_stock_on_cancel
  before update on public.orders
  for each row execute function public.restore_stock_on_order_cancel();

-- ==========================================
-- LATE PAYMENT HANDLING TRIGGER
-- ==========================================
create or replace function public.handle_late_payment_arrival()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_status text;
  v_order_num text;
begin
  select status, order_number into v_order_status, v_order_num
  from public.orders
  where id = new.order_id;

  -- If payment arrives for an order that is already cancelled or expired:
  if v_order_status = 'cancelled' and new.payment_status = 'paid' then
    new.refund_status := 'refund_required';

    update public.orders
    set notes = coalesce(notes, '') || ' [ALERT: Late payment ' || coalesce(new.gateway_payment_id, '') || ' received for cancelled order. Marked refund_required via Cashfree.]'
    where id = new.order_id;
  end if;

  return new;
end;
$$;

create trigger tr_handle_late_payment
  before insert or update on public.payments
  for each row execute function public.handle_late_payment_arrival();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES & GRANTS
-- ==========================================

-- Explicit Grants for modern Supabase (where auto_expose_new_tables is false)
grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.products, public.product_variants, public.product_images to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, anon, service_role;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Profiles Policies
create policy "profiles_select_own_or_admin" on public.profiles
  for select using ((select auth.uid()) = id or (select public.is_admin()));

create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id or (select public.is_admin()));

-- Categories Policies
create policy "categories_select_active_or_admin" on public.categories
  for select using (is_active = true or (select public.is_admin()));

create policy "categories_admin_insert" on public.categories
  for insert with check ((select public.is_admin()));

create policy "categories_admin_update" on public.categories
  for update using ((select public.is_admin()));

create policy "categories_admin_delete" on public.categories
  for delete using ((select public.is_admin()));

-- Products Policies
create policy "products_select_active_or_admin" on public.products
  for select using (
    (is_active = true and exists (
      select 1 from public.categories c where c.id = category_id and c.is_active = true
    )) or (select public.is_admin())
  );

create policy "products_admin_insert" on public.products
  for insert with check ((select public.is_admin()));

create policy "products_admin_update" on public.products
  for update using ((select public.is_admin()));

create policy "products_admin_delete" on public.products
  for delete using ((select public.is_admin()));

-- Product Variants Policies (enforce parent product & category active check)
create policy "variants_select_active_or_admin" on public.product_variants
  for select using (
    (is_active = true and exists (
      select 1 from public.products p
      join public.categories c on c.id = p.category_id
      where p.id = product_id and p.is_active = true and c.is_active = true
    )) or (select public.is_admin())
  );

create policy "variants_admin_insert" on public.product_variants
  for insert with check ((select public.is_admin()));

create policy "variants_admin_update" on public.product_variants
  for update using ((select public.is_admin()));

create policy "variants_admin_delete" on public.product_variants
  for delete using ((select public.is_admin()));

-- Product Images Policies
create policy "images_select_public" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      join public.categories c on c.id = p.category_id
      where p.id = product_id and p.is_active = true and c.is_active = true
    ) or (select public.is_admin())
  );

create policy "images_admin_insert" on public.product_images
  for insert with check ((select public.is_admin()));

create policy "images_admin_update" on public.product_images
  for update using ((select public.is_admin()));

create policy "images_admin_delete" on public.product_images
  for delete using ((select public.is_admin()));

-- Cart Items Policies
create policy "cart_select_own" on public.cart_items
  for select using ((select auth.uid()) = user_id);

create policy "cart_insert_own" on public.cart_items
  for insert with check ((select auth.uid()) = user_id);

create policy "cart_update_own" on public.cart_items
  for update using ((select auth.uid()) = user_id);

create policy "cart_delete_own" on public.cart_items
  for delete using ((select auth.uid()) = user_id);

-- Wishlist Items Policies
create policy "wishlist_select_own" on public.wishlist_items
  for select using ((select auth.uid()) = user_id);

create policy "wishlist_insert_own" on public.wishlist_items
  for insert with check ((select auth.uid()) = user_id);

create policy "wishlist_delete_own" on public.wishlist_items
  for delete using ((select auth.uid()) = user_id);

-- Addresses Policies
create policy "addresses_select_own_or_admin" on public.addresses
  for select using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "addresses_insert_own" on public.addresses
  for insert with check ((select auth.uid()) = user_id);

create policy "addresses_update_own" on public.addresses
  for update using ((select auth.uid()) = user_id);

create policy "addresses_delete_own" on public.addresses
  for delete using ((select auth.uid()) = user_id);

-- Orders Policies
create policy "orders_select_own_or_admin" on public.orders
  for select using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "orders_admin_update" on public.orders
  for update using ((select public.is_admin()));

-- Order Items Policies
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

-- Payments Policies
create policy "payments_select_own_or_admin" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

-- ==========================================
-- ATOMIC ORDER PLACEMENT RPC (Anti-Deadlock & Anti-Overselling)
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

    -- Lock variant row and verify that parent product AND category are active
    select v.*, p.name as product_name, p.id as prod_id
    into v_variant
    from public.product_variants v
    join public.products p on p.id = v.product_id
    join public.categories c on c.id = p.category_id
    where v.id = v_item.variant_id
      and v.is_active = true
      and p.is_active = true
      and c.is_active = true
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

    -- Write immutable order item snapshot
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

    -- Remove ordered items from user's active cart
    delete from public.cart_items
    where user_id = v_user_id and variant_id = v_variant.id;
  end loop;

  -- Shipping rules: Free shipping over ₹999 (99900 paise), else ₹99 (9900 paise)
  if v_subtotal >= 99900 then
    v_shipping := 0;
  else
    v_shipping := 9900;
  end if;

  v_total := v_subtotal + v_shipping;

  -- Update final calculated amounts on order
  update public.orders
  set subtotal_amount = v_subtotal,
      shipping_amount = v_shipping,
      total_amount = v_total
  where id = v_order_id;

  -- Return created order details
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

revoke execute on function public.create_order_atomic(jsonb, jsonb, text) from public;
grant execute on function public.create_order_atomic(jsonb, jsonb, text) to authenticated;

-- ==========================================
-- GUEST CART MERGE RPC
-- ==========================================
create or replace function public.merge_guest_cart(
  p_items jsonb -- Array of { variant_id: uuid, quantity: int }
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_item record;
  v_variant record;
  v_existing_qty int;
  v_target_qty int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required to merge cart.';
  end if;

  if p_items is not null and jsonb_array_length(p_items) > 0 then
    for v_item in (
      select x.variant_id, sum(x.quantity)::int as quantity
      from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity int)
      group by x.variant_id
    )
    loop
      if v_item.quantity > 0 then
        -- Check if variant and parents are active
        select v.id, v.stock into v_variant
        from public.product_variants v
        join public.products p on p.id = v.product_id
        join public.categories c on c.id = p.category_id
        where v.id = v_item.variant_id
          and v.is_active = true
          and p.is_active = true
          and c.is_active = true;

        if found and v_variant.stock > 0 then
          -- Check current cart quantity
          select quantity into v_existing_qty
          from public.cart_items
          where user_id = v_user_id and variant_id = v_variant.id;

          if found then
            -- Cap combined quantity at available stock
            v_target_qty := least(v_existing_qty + v_item.quantity, v_variant.stock);
            update public.cart_items
            set quantity = v_target_qty, updated_at = now()
            where user_id = v_user_id and variant_id = v_variant.id;
          else
            v_target_qty := least(v_item.quantity, v_variant.stock);
            insert into public.cart_items (user_id, variant_id, quantity)
            values (v_user_id, v_variant.id, v_target_qty);
          end if;
        end if;
      end if;
    end loop;
  end if;

  return jsonb_build_object('success', true);
end;
$$;

revoke execute on function public.merge_guest_cart(jsonb) from public;
grant execute on function public.merge_guest_cart(jsonb) to authenticated;

-- ==========================================
-- EXPIRED ORDERS RESTOCK PROCEDURE (COD Strictly Excluded)
-- ==========================================
create or replace function public.cancel_expired_orders()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  v_order record;
begin
  for v_order in (
    select id from public.orders
    where status = 'pending'
      and payment_status = 'pending'
      and payment_method <> 'cod' -- COD orders are strictly excluded from expiration
      and expires_at is not null
      and expires_at < now()
  )
  loop
    update public.orders
    set status = 'cancelled',
        notes = coalesce(notes, '') || ' [System: Cancelled due to Cashfree payment reservation timeout]'
    where id = v_order.id;
    -- Note: tr_restore_stock_on_cancel trigger automatically and idempotently restocks inventory!

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Scheduler configuration (via pg_cron if available in environment)
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule(jobid) from cron.job where jobname = 'cancel_expired_orders_cron';
    perform cron.schedule('cancel_expired_orders_cron', '*/2 * * * *', 'select public.cancel_expired_orders()');
  end if;
exception when others then
  null;
end $$;

-- ==========================================
-- STORAGE BUCKET CONFIGURATION (product-images)
-- ==========================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Storage bucket RLS policies with idempotent drop guards
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images' 
    and (select public.is_admin())
    and (storage.foldername(name))[1] = 'products'
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (
    bucket_id = 'product-images' 
    and (select public.is_admin())
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images' 
    and (select public.is_admin())
  );
