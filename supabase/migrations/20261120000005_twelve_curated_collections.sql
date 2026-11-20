-- ==============================================================================
-- Varnam Migration: 20261120000005_twelve_curated_collections.sql
-- 1. Seed & ensure 12 Curated Occasion Collections with authentic Indian attire images
-- 2. Update hero banners to authentic Indian attire imagery
-- ==============================================================================

-- 1. Upsert the 12 Curated Occasion Collections
insert into public.categories (
  id, name, slug, description, image_url, sort_order, is_active, show_in_nav, segment
) values
(
  'c1a00001-0000-0000-0000-000000000004',
  'Xmas Collection',
  'xmas-collection',
  'Royal crimson velvet lehengas, gold-embroidered frocks, and winter holiday Indian festive wear.',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000005',
  'Daily Wear',
  'daily-wear',
  'Soft, breathable everyday Indian cotton kurtis, frocks, and comfortable flared co-ords.',
  'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000006',
  'Cottonwears',
  'cottonwears',
  'Pure handblock mulmul cotton frocks and breathable casuals with zero irritation.',
  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80',
  3,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000007',
  'Tops',
  'tops',
  'Handcrafted angrakha tie-up tops, peplum kurtis, and versatile festive Indian tunics.',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  4,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000008',
  'Trending Collections',
  'trending-collections',
  'Most-loved celebration twirls, viral lehengas, and bestselling celebratory festive frocks.',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  5,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000009',
  'New Arrivals',
  'new-arrivals',
  'Freshly handcrafted Indian weaves, zari silks, and festive silhouettes fresh off the atelier looms.',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
  6,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000001',
  'Pattu & Lehengas',
  'pattu-lehengas',
  'Authentic South Indian Kanchipuram zari pattu pavadais, dhavani sets, and handwoven lehengas.',
  'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=800&q=80',
  7,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000002',
  'Anarkali & Shararas',
  'anarkali-shararas',
  'Grand flared Mughal anarkalis, tiered festive sharara sets, and regal raw silk suits.',
  'https://images.unsplash.com/photo-1614786269829-d24616faf56d?auto=format&fit=crop&w=800&q=80',
  8,
  true,
  true,
  'all'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Festive & Wedding',
  'festive-wedding',
  'Grand celebration lehengas, pure silk weaves, and heirloom ensembles for weddings and poojas.',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
  9,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000010',
  'Haldi & Mehendi',
  'haldi-mehendi',
  'Sunshine yellow organza lehengas, turmeric silk frocks, and vibrant sangeet twirls.',
  'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80',
  10,
  true,
  true,
  'all'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Party & Evening Gowns',
  'party-gowns',
  'Twirl organza and shimmer celebration gowns with skin-soft breathable cotton underlinings.',
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
  11,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000011',
  'Temple & Pooja Wear',
  'temple-pooja-wear',
  'Sacred temple border kasavu silks, auspicious ivory & gold sets, and pure cotton festive wear.',
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80',
  12,
  true,
  true,
  'all'
)
on conflict (id) do update set
  parent_id = null,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  show_in_nav = excluded.show_in_nav,
  segment = excluded.segment;

-- 2. Update hero banners to verified authentic Indian attire images
update public.hero_banners
set
  desktop_image_url = 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1600&q=85',
  mobile_image_url = 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=800&q=85'
where id = 'e1a00001-0000-0000-0000-000000000002';

update public.hero_banners
set
  desktop_image_url = 'https://images.unsplash.com/photo-1614786269829-d24616faf56d?auto=format&fit=crop&w=1600&q=85',
  mobile_image_url = 'https://images.unsplash.com/photo-1614786269829-d24616faf56d?auto=format&fit=crop&w=800&q=85'
where id = 'e1a00001-0000-0000-0000-000000000006';
