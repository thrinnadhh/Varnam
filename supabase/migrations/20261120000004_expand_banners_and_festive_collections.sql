-- ==============================================================================
-- Varnam Migration: 20261120000004_expand_banners_and_festive_collections.sql
-- Seed 10 Dynamic Hero Banners (Unlimited Admin uploads supported)
-- Seed Dynamic Collections: Xmas Collection, Daily Wear, Cottonwears, Tops,
-- Trending Collections, and New Arrivals
-- ==============================================================================

-- 1. Seed / Upsert the 10 Hero Banners
insert into public.hero_banners (
  id, eyebrow_text, title, subtitle, cta_label, cta_href, desktop_image_url, sort_order, is_active
) values
(
  'e1a00001-0000-0000-0000-000000000001',
  'Diwali & Wedding Celebrations',
  'Royal Zari & Handloom Tissue Lehengas',
  'Handcrafted pure silk lehengas with authentic zari borders and 100% breathable cotton lining.',
  'Explore Festive Lehengas',
  '/collections/pattu-lehengas',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
  1,
  true
),
(
  'e1a00001-0000-0000-0000-000000000002',
  'Holiday Season Special',
  'Xmas & Winter Festive Red Couture',
  'Velvet crimson frocks, gold-embroidered holiday twirl dresses, and luxury winter partywear.',
  'Shop Xmas Collection',
  '/collections/xmas-collection',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=85',
  2,
  true
),
(
  'e1a00001-0000-0000-0000-000000000003',
  'Joyful Heritage Twirls',
  'Artisanal Anarkalis & Festive Shararas',
  'Multi-kali flared silhouettes tailored from Varanasi raw silk with generous ease margins.',
  'Shop Anarkali Suits',
  '/collections/anarkali-shararas',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
  3,
  true
),
(
  'e1a00001-0000-0000-0000-000000000004',
  '100% Skin-Soft Comfort',
  'Pure Cottonwears & Breathable Day Dresses',
  'Handblock printed cotton twirl frocks with zero synthetic contact and soft gathers.',
  'Shop Cottonwears',
  '/collections/cottonwears',
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1600&q=85',
  4,
  true
),
(
  'e1a00001-0000-0000-0000-000000000005',
  'Effortless Everyday',
  'Daily Wear Casuals & Playtime Co-ords',
  'Play-ready cotton ensembles designed for freedom of movement and easy care.',
  'Explore Daily Wear',
  '/collections/daily-wear',
  'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1600&q=85',
  5,
  true
),
(
  'e1a00001-0000-0000-0000-000000000006',
  'Modern Ethnic Silhouettes',
  'Festive Peplum Kurtis & Angrakha Tops',
  'Handcrafted festive tops and short kurtis to style with lehengas, skirts, or denims.',
  'Shop Festive Tops',
  '/collections/tops',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
  6,
  true
),
(
  'e1a00001-0000-0000-0000-000000000007',
  'Most Loved by Families',
  'Trending Celebratory Collections',
  'Discover our top-trending festive styles loved across India for comfort and regal sheen.',
  'Explore Trending',
  '/collections/trending-collections',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
  7,
  true
),
(
  'e1a00001-0000-0000-0000-000000000008',
  'Just Dropped for Celebrations',
  'Fresh New Arrivals Atelier',
  'Brand-new handwoven silks and festive twirl designs fresh off the looms.',
  'Shop New Arrivals',
  '/collections/new-arrivals',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85',
  8,
  true
),
(
  'e1a00001-0000-0000-0000-000000000009',
  'Traditional Temple Weaves',
  'Heritage Kanchipuram Pattu Pavadais',
  'Pure zari South Indian langa voni sets with 1-inch inner growth seam margins.',
  'Shop Pattu Pavadais',
  '/collections/pattu-lehengas',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
  9,
  true
),
(
  'e1a00001-0000-0000-0000-000000000010',
  'Birthday & Evening Elegance',
  'Party & Evening Shimmer Gowns',
  'Fairy-tale tiered shimmer gowns and organza frocks with soft cotton linings.',
  'Shop Party Gowns',
  '/collections/party-gowns',
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1600&q=85',
  10,
  true
)
on conflict (id) do update set
  eyebrow_text = excluded.eyebrow_text,
  title = excluded.title,
  subtitle = excluded.subtitle,
  cta_label = excluded.cta_label,
  cta_href = excluded.cta_href,
  desktop_image_url = excluded.desktop_image_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

-- 2. Seed Dynamic Storefront Subheadings / Collections
insert into public.categories (
  id, name, slug, description, image_url, sort_order, is_active, show_in_nav, segment
) values
(
  'c1a00001-0000-0000-0000-000000000004',
  'Xmas Collection',
  'xmas-collection',
  'Velvet crimson dresses, holiday red frocks, and festive winter partywear.',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80',
  4,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000005',
  'Daily Wear',
  'daily-wear',
  'Soft, breathable everyday cotton dresses, frocks, and comfortable co-ords.',
  'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=600&q=80',
  5,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000006',
  'Cottonwears',
  'cottonwears',
  'Pure handblock mulmul cotton frocks and breathable casuals with zero irritation.',
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80',
  6,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000007',
  'Tops',
  'tops',
  'Handcrafted angrakha tie-up tops, peplum blouses, and versatile ethnic tunics.',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
  7,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000008',
  'Trending Collections',
  'trending-collections',
  'Most-loved celebration twirls, viral lehengas, and bestselling celebratory frocks.',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  8,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000009',
  'New Arrivals',
  'new-arrivals',
  'Freshly handcrafted silhouettes and looms just added to the atelier.',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80',
  9,
  true,
  true,
  'all'
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  show_in_nav = excluded.show_in_nav,
  segment = excluded.segment;

-- 3. Seed Child Dropdown Clothing Types for the new collections
insert into public.categories (
  id, parent_id, name, slug, description, sort_order, is_active, show_in_nav, segment
) values
-- Under Xmas Collection
(
  'c1a00001-0000-0000-0000-000000000041',
  'c1a00001-0000-0000-0000-000000000004',
  'Velvet Christmas Frocks',
  'velvet-christmas-frocks',
  'Rich crimson velvet dresses with gold lace trims and soft cotton linings.',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000042',
  'c1a00001-0000-0000-0000-000000000004',
  'Winter Red Twirl Dresses',
  'winter-red-twirl-dresses',
  'Joyful red flare dresses tailored for holiday parties and photoshoots.',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000043',
  'c1a00001-0000-0000-0000-000000000004',
  'Holiday Festive Gowns',
  'holiday-festive-gowns',
  'Shimmering floor-length holiday gowns with layered underskirts.',
  3,
  true,
  true,
  'all'
),

-- Under Daily Wear
(
  'c1a00001-0000-0000-0000-000000000051',
  'c1a00001-0000-0000-0000-000000000005',
  'Everyday A-Line Dresses',
  'everyday-a-line-dresses',
  'Classic A-line cotton dresses for everyday elegance and play.',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000052',
  'c1a00001-0000-0000-0000-000000000005',
  'Comfort Play Frocks',
  'comfort-play-frocks',
  'Lightweight breathable dresses designed for active playtime.',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000053',
  'c1a00001-0000-0000-0000-000000000005',
  'Casual Co-ord Sets',
  'casual-coord-sets',
  'Matching top and shorts/pants sets in 100% skin-safe cotton.',
  3,
  true,
  true,
  'all'
),

-- Under Cottonwears
(
  'c1a00001-0000-0000-0000-000000000061',
  'c1a00001-0000-0000-0000-000000000006',
  'Handblock Mulmul Twirls',
  'handblock-mulmul-twirls',
  'Artisanal handblock printed Jaipur mulmul dresses with soft ruffles.',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000062',
  'c1a00001-0000-0000-0000-000000000006',
  'Pure Cotton Midi Dresses',
  'pure-cotton-midi-dresses',
  'Knee and calf length pure cotton dresses for tropical weather.',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000063',
  'c1a00001-0000-0000-0000-000000000006',
  'Summer Breathable Frocks',
  'summer-breathable-frocks',
  'Featherlight twirl dresses keeping children cool and happy all day.',
  3,
  true,
  true,
  'all'
),

-- Under Tops
(
  'c1a00001-0000-0000-0000-000000000071',
  'c1a00001-0000-0000-0000-000000000007',
  'Angrakha Wrap Tops',
  'angrakha-wrap-tops',
  'Traditional side tie-up wrap tops with handmade cloth latkans.',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000072',
  'c1a00001-0000-0000-0000-000000000007',
  'Embroidered Peplum Tops',
  'embroidered-peplum-tops',
  'Fitted bust with flared peplum hem and delicate zari embroidery.',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000073',
  'c1a00001-0000-0000-0000-000000000007',
  'Festive Silk Blouses',
  'festive-silk-blouses',
  'Ready-to-wear choli blouses with margin allowances for growing kids.',
  3,
  true,
  true,
  'all'
),

-- Under Trending Collections
(
  'c1a00001-0000-0000-0000-000000000081',
  'c1a00001-0000-0000-0000-000000000008',
  'Best-Selling Twirl Lehengas',
  'best-selling-twirl-lehengas',
  'Our most coveted 360-degree flare festive lehenga sets.',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000082',
  'c1a00001-0000-0000-0000-000000000008',
  'Trending Royal Anarkalis',
  'trending-royal-anarkalis',
  'Viral silk anarkalis praised by families across India.',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000083',
  'c1a00001-0000-0000-0000-000000000008',
  'Celebration Viral Frocks',
  'celebration-viral-frocks',
  'Top-rated twirl frocks with over 98% 5-star fit satisfaction.',
  3,
  true,
  true,
  'all'
),

-- Under New Arrivals
(
  'c1a00001-0000-0000-0000-000000000091',
  'c1a00001-0000-0000-0000-000000000009',
  'This Week''s Drops',
  'this-weeks-drops',
  'Freshly listed handcrafted apparel ready for fast dispatch.',
  1,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000092',
  'c1a00001-0000-0000-0000-000000000009',
  'Latest Handloom Weaves',
  'latest-handloom-weaves',
  'Direct-from-loom Kanchipuram and Chanderi pure silk weaves.',
  2,
  true,
  true,
  'all'
),
(
  'c1a00001-0000-0000-0000-000000000093',
  'c1a00001-0000-0000-0000-000000000009',
  'Fresh Festive Silhouettes',
  'fresh-festive-silhouettes',
  'Innovative contemporary festive cuts with traditional soul.',
  3,
  true,
  true,
  'all'
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  show_in_nav = excluded.show_in_nav,
  segment = excluded.segment;
