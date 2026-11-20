-- Varnam Multi-Segment Storefront Seed Data
-- Supporting Women, Teens, and Girls across Shared Occasion Categories
-- All with Mandatory 100% Breathable Pure Cotton Linings & Explicit Bust/Waist/Hip Sizing

-- ==========================================
-- 1. Shared Occasion Categories
-- ==========================================
insert into public.categories (id, name, slug, segment, description, image_url, display_order, is_active)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Festive & Wedding',
    'festive-wedding',
    'all',
    'Handcrafted zari lehengas, royal anarkalis, and pure silk heritage wear for grand family celebrations.',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    1,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Party & Evening Gowns',
    'party-gowns',
    'all',
    'Whimsical tiered tulle gowns, organza flared silhouettes, and celebration couture with non-scratch linings.',
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    2,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Cotton Twirl Frocks & Day Dresses',
    'cotton-dresses',
    'all',
    'Soft, breathable organic cotton twirl frocks and elegant flared midi dresses for breezy comfort.',
    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
    3,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Casuals & Co-ords',
    'casuals-coords',
    'all',
    'Modern co-ord sets, contemporary fusion silhouettes, and easy everyday apparel with growth room.',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80',
    4,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  segment = excluded.segment,
  description = excluded.description,
  image_url = excluded.image_url,
  display_order = excluded.display_order;

-- ==========================================
-- 2. Products across Women, Teens, and Girls
-- ==========================================
insert into public.products (
  id,
  category_id,
  segment,
  name,
  slug,
  description,
  fabric,
  lining,
  care_instructions,
  model_height,
  model_size_worn,
  size_chart,
  is_active,
  is_featured
)
values
  -- WOMEN 1: Festive & Wedding Anarkali Gown
  (
    'aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'women',
    'Aashna Royal Crimson Raw Silk Zari Anarkali Gown',
    'aashna-royal-crimson-raw-silk-zari-anarkali-gown',
    'A majestic floor-length royal crimson anarkali tailored from handloom Varanasi raw silk. Featuring hand-embroidered antique gold zardozi motifs across the neckline and flare. Tailored with 3-inch interior margins for effortless custom alteration and lined entirely in featherlight malmal cotton.',
    'Pure Varanasi Raw Silk & Zari',
    '100% Breathable Malmal Cotton',
    'Dry clean only. Steam iron on reverse under protective cloth.',
    '5''8" (173 cm)',
    'Size S',
    '[
      {"size": "XS", "bust_in": 32, "bust_cm": 81.3, "waist_in": 26, "waist_cm": 66.0, "hip_in": 36, "hip_cm": 91.4, "length_in": 52, "length_cm": 132.1},
      {"size": "S", "bust_in": 34, "bust_cm": 86.4, "waist_in": 28, "waist_cm": 71.1, "hip_in": 38, "hip_cm": 96.5, "length_in": 52, "length_cm": 132.1},
      {"size": "M", "bust_in": 36, "bust_cm": 91.4, "waist_in": 30, "waist_cm": 76.2, "hip_in": 40, "hip_cm": 101.6, "length_in": 53, "length_cm": 134.6},
      {"size": "L", "bust_in": 38, "bust_cm": 96.5, "waist_in": 32, "waist_cm": 81.3, "hip_in": 42, "hip_cm": 106.7, "length_in": 54, "length_cm": 137.2},
      {"size": "XL", "bust_in": 40, "bust_cm": 101.6, "waist_in": 34, "waist_cm": 86.4, "hip_in": 44, "hip_cm": 111.8, "length_in": 54, "length_cm": 137.2},
      {"size": "XXL", "bust_in": 42, "bust_cm": 106.7, "waist_in": 36, "waist_cm": 91.4, "hip_in": 46, "hip_cm": 116.8, "length_in": 55, "length_cm": 139.7}
    ]'::jsonb,
    true,
    true
  ),

  -- WOMEN 2: Party Organza Gown
  (
    'aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'women',
    'Noor Hand-Painted Floral Organza Tiered Gown',
    'noor-hand-painted-floral-organza-tiered-gown',
    'Ethereal multi-tiered evening gown rendered in sheer blush silk organza with delicate floral brushwork. Soft structured bodice with non-scratch internal boning wrapped in pure cotton.',
    'Silk Organza & Soft French Net',
    '100% Pure Mulmul Cotton',
    'Dry clean recommended to preserve delicate floral hand-painting.',
    '5''7" (170 cm)',
    'Size S',
    '[
      {"size": "XS", "bust_in": 32, "bust_cm": 81.3, "waist_in": 26, "waist_cm": 66.0, "hip_in": 36, "hip_cm": 91.4, "length_in": 54, "length_cm": 137.2},
      {"size": "S", "bust_in": 34, "bust_cm": 86.4, "waist_in": 28, "waist_cm": 71.1, "hip_in": 38, "hip_cm": 96.5, "length_in": 54, "length_cm": 137.2},
      {"size": "M", "bust_in": 36, "bust_cm": 91.4, "waist_in": 30, "waist_cm": 76.2, "hip_in": 40, "hip_cm": 101.6, "length_in": 55, "length_cm": 139.7},
      {"size": "L", "bust_in": 38, "bust_cm": 96.5, "waist_in": 32, "waist_cm": 81.3, "hip_in": 42, "hip_cm": 106.7, "length_in": 55, "length_cm": 139.7},
      {"size": "XL", "bust_in": 40, "bust_cm": 101.6, "waist_in": 34, "waist_cm": 86.4, "hip_in": 44, "hip_cm": 111.8, "length_in": 56, "length_cm": 142.2}
    ]'::jsonb,
    true,
    true
  ),

  -- TEENS 1: Youth Mint & Gold Tissue Co-ord Set
  (
    'bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'teens',
    'Meera Youth Mint & Gold Tissue Festive Co-ord Set',
    'meera-youth-mint-gold-tissue-festive-coord-set',
    'Contemporary two-piece festive silhouette designed for modern teens. Lightweight Chanderi tissue peplum crop top paired with high-waist flared palazzo trousers. Finished with smooth elastic back-waist and rash-free mulmul lining.',
    'Chanderi Zari Tissue & Silk Georgette',
    '100% Breathable Malmal Cotton',
    'Dry clean or gentle hand wash. Warm iron on reverse.',
    '5''2" (157 cm)',
    'Size XS / 13-14Y',
    '[
      {"size": "13-14Y", "bust_in": 31, "bust_cm": 78.7, "waist_in": 26, "waist_cm": 66.0, "hip_in": 34, "hip_cm": 86.4, "length_in": 40, "length_cm": 101.6},
      {"size": "15-16Y", "bust_in": 33, "bust_cm": 83.8, "waist_in": 27, "waist_cm": 68.6, "hip_in": 36, "hip_cm": 91.4, "length_in": 42, "length_cm": 106.7},
      {"size": "17-18Y", "bust_in": 35, "bust_cm": 88.9, "waist_in": 28, "waist_cm": 71.1, "hip_in": 38, "hip_cm": 96.5, "length_in": 44, "length_cm": 111.8},
      {"size": "XS", "bust_in": 31, "bust_cm": 78.7, "waist_in": 26, "waist_cm": 66.0, "hip_in": 34, "hip_cm": 86.4, "length_in": 40, "length_cm": 101.6},
      {"size": "S", "bust_in": 33, "bust_cm": 83.8, "waist_in": 27, "waist_cm": 68.6, "hip_in": 36, "hip_cm": 91.4, "length_in": 42, "length_cm": 106.7}
    ]'::jsonb,
    true,
    true
  ),

  -- TEENS 2: Lavender Ombre Tiered Party Gown
  (
    'bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'teens',
    'Zoya Lavender Ombré Tiered Party Gown',
    'zoya-lavender-ombre-tiered-party-gown',
    'Dreamy twilight lavender ombré tulle gown with flutter shoulder straps and subtle pearl sequin dusting. Tailored specifically for teen proportions with soft voile lining.',
    'Ombré Shimmer Tulle & Crepe',
    '100% Breathable Feather-Soft Voile',
    'Dry clean only. Hang on padded hanger.',
    '5''3" (160 cm)',
    'Size 13-14Y',
    '[
      {"size": "13-14Y", "bust_in": 31, "bust_cm": 78.7, "waist_in": 26, "waist_cm": 66.0, "hip_in": 34, "hip_cm": 86.4, "length_in": 48, "length_cm": 121.9},
      {"size": "15-16Y", "bust_in": 33, "bust_cm": 83.8, "waist_in": 27, "waist_cm": 68.6, "hip_in": 36, "hip_cm": 91.4, "length_in": 50, "length_cm": 127.0},
      {"size": "17-18Y", "bust_in": 35, "bust_cm": 88.9, "waist_in": 28, "waist_cm": 71.1, "hip_in": 38, "hip_cm": 96.5, "length_in": 52, "length_cm": 132.1},
      {"size": "XS", "bust_in": 31, "bust_cm": 78.7, "waist_in": 26, "waist_cm": 66.0, "hip_in": 34, "hip_cm": 86.4, "length_in": 48, "length_cm": 121.9}
    ]'::jsonb,
    true,
    true
  ),

  -- GIRLS 1: Rose Gold Zari Lehenga Choli
  (
    'cccccccc-1111-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'girls',
    'Aadhya Rose Gold Zari Lehenga Choli',
    'aadhya-rose-gold-zari-lehenga-choli',
    'A radiant rose pink brocade skirt adorned with traditional golden peacocks and floral zari jaal. Paired with a comfortable choli blouse featuring soft cotton lining and back tie-ups.',
    'Pure Brocade Silk & Tissue Organza',
    '100% Breathable Malmal Cotton',
    'Dry clean recommended to preserve zari luster. Store wrapped in cotton muslin.',
    '4''2" (127 cm)',
    'Ages 6-7Y',
    '[
      {"size": "2-3Y", "bust_in": 21, "bust_cm": 53.3, "waist_in": 20, "waist_cm": 50.8, "hip_in": 22, "hip_cm": 55.9, "length_in": 22, "length_cm": 55.9},
      {"size": "4-5Y", "bust_in": 23, "bust_cm": 58.4, "waist_in": 22, "waist_cm": 55.9, "hip_in": 24, "hip_cm": 61.0, "length_in": 26, "length_cm": 66.0},
      {"size": "6-7Y", "bust_in": 25, "bust_cm": 63.5, "waist_in": 24, "waist_cm": 61.0, "hip_in": 26, "hip_cm": 66.0, "length_in": 30, "length_cm": 76.2},
      {"size": "8-9Y", "bust_in": 27, "bust_cm": 68.6, "waist_in": 26, "waist_cm": 66.0, "hip_in": 28, "hip_cm": 71.1, "length_in": 34, "length_cm": 86.4},
      {"size": "10-11Y", "bust_in": 29, "bust_cm": 73.7, "waist_in": 28, "waist_cm": 71.1, "hip_in": 30, "hip_cm": 76.2, "length_in": 38, "length_cm": 96.5},
      {"size": "12Y", "bust_in": 31, "bust_cm": 78.7, "waist_in": 29, "waist_cm": 73.7, "hip_in": 32, "hip_cm": 81.3, "length_in": 41, "length_cm": 104.1}
    ]'::jsonb,
    true,
    true
  ),

  -- GIRLS 2: Emerald Green Flared Pure Cotton Twirl Frock
  (
    'cccccccc-2222-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'girls',
    'Avani Emerald Flared Pure Cotton Twirl Frock',
    'avani-emerald-flared-pure-cotton-twirl-frock',
    'Handcrafted 360-degree twirl frock made from heritage Bagru floral handblock prints. Double flared hem, covered fabric buttons, and zero synthetic contact for all-day skin comfort.',
    '100% Organic Handblock Cambric Cotton',
    '100% Ultra-Soft Cambric Cotton Self-Lined',
    'Machine wash gentle cold with like colors. Line dry in shade.',
    '3''10" (117 cm)',
    'Ages 4-5Y',
    '[
      {"size": "2-3Y", "bust_in": 21, "bust_cm": 53.3, "waist_in": 20, "waist_cm": 50.8, "hip_in": 22, "hip_cm": 55.9, "length_in": 20, "length_cm": 50.8},
      {"size": "4-5Y", "bust_in": 23, "bust_cm": 58.4, "waist_in": 22, "waist_cm": 55.9, "hip_in": 24, "hip_cm": 61.0, "length_in": 24, "length_cm": 61.0},
      {"size": "6-7Y", "bust_in": 25, "bust_cm": 63.5, "waist_in": 24, "waist_cm": 61.0, "hip_in": 26, "hip_cm": 66.0, "length_in": 28, "length_cm": 71.1},
      {"size": "8-9Y", "bust_in": 27, "bust_cm": 68.6, "waist_in": 26, "waist_cm": 66.0, "hip_in": 28, "hip_cm": 71.1, "length_in": 32, "length_cm": 81.3},
      {"size": "10-11Y", "bust_in": 29, "bust_cm": 73.7, "waist_in": 28, "waist_cm": 71.1, "hip_in": 30, "hip_cm": 76.2, "length_in": 36, "length_cm": 91.4}
    ]'::jsonb,
    true,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  segment = excluded.segment,
  description = excluded.description,
  fabric = excluded.fabric,
  lining = excluded.lining,
  model_height = excluded.model_height,
  model_size_worn = excluded.model_size_worn,
  size_chart = excluded.size_chart,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- ==========================================
-- 3. Product Variants (size_group, size_name, bust/waist/hip measurements)
-- ==========================================
insert into public.product_variants (
  product_id,
  size_group,
  size_name,
  size_age,
  bust_inches,
  bust_cm,
  waist_inches,
  waist_cm,
  hip_inches,
  hip_cm,
  length_inches,
  length_cm,
  color_name,
  color_hex,
  sku,
  price,
  mrp,
  stock,
  is_active
)
values
  -- Women 1 (Aashna): XS, S, M, L, XL, XXL
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'XS', 'XS', 32.0, 81.3, 26.0, 66.0, 36.0, 91.4, 52.0, 132.1, 'Royal Crimson', '#881337', 'AASHNA-WOMEN-XS', 349900, 499900, 12, true),
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'S', 'S', 34.0, 86.4, 28.0, 71.1, 38.0, 96.5, 52.0, 132.1, 'Royal Crimson', '#881337', 'AASHNA-WOMEN-S', 349900, 499900, 15, true),
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'M', 'M', 36.0, 91.4, 30.0, 76.2, 40.0, 101.6, 53.0, 134.6, 'Royal Crimson', '#881337', 'AASHNA-WOMEN-M', 349900, 499900, 15, true),
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'L', 'L', 38.0, 96.5, 32.0, 81.3, 42.0, 106.7, 54.0, 137.2, 'Royal Crimson', '#881337', 'AASHNA-WOMEN-L', 349900, 499900, 10, true),
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'XL', 'XL', 40.0, 101.6, 34.0, 86.4, 44.0, 111.8, 54.0, 137.2, 'Royal Crimson', '#881337', 'AASHNA-WOMEN-XL', 349900, 499900, 8, true),
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'XXL', 'XXL', 42.0, 106.7, 36.0, 91.4, 46.0, 116.8, 55.0, 139.7, 'Royal Crimson', '#881337', 'AASHNA-WOMEN-XXL', 349900, 499900, 6, true),

  -- Women 2 (Noor): XS, S, M, L, XL
  ('aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'XS', 'XS', 32.0, 81.3, 26.0, 66.0, 36.0, 91.4, 54.0, 137.2, 'Blush Peony', '#f43f5e', 'NOOR-WOMEN-XS', 429900, 599900, 8, true),
  ('aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'S', 'S', 34.0, 86.4, 28.0, 71.1, 38.0, 96.5, 54.0, 137.2, 'Blush Peony', '#f43f5e', 'NOOR-WOMEN-S', 429900, 599900, 12, true),
  ('aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'M', 'M', 36.0, 91.4, 30.0, 76.2, 40.0, 101.6, 55.0, 139.7, 'Blush Peony', '#f43f5e', 'NOOR-WOMEN-M', 429900, 599900, 10, true),
  ('aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa', 'women', 'L', 'L', 38.0, 96.5, 32.0, 81.3, 42.0, 106.7, 55.0, 139.7, 'Blush Peony', '#f43f5e', 'NOOR-WOMEN-L', 429900, 599900, 7, true),

  -- Teens 1 (Meera): 13-14Y, 15-16Y, 17-18Y, XS, S
  ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'teen', '13-14Y', '13-14Y', 31.0, 78.7, 26.0, 66.0, 34.0, 86.4, 40.0, 101.6, 'Mint Zari', '#059669', 'MEERA-TEEN-1314Y', 269900, 379900, 14, true),
  ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'teen', '15-16Y', '15-16Y', 33.0, 83.8, 27.0, 68.6, 36.0, 91.4, 42.0, 106.7, 'Mint Zari', '#059669', 'MEERA-TEEN-1516Y', 269900, 379900, 12, true),
  ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'teen', '17-18Y', '17-18Y', 35.0, 88.9, 28.0, 71.1, 38.0, 96.5, 44.0, 111.8, 'Mint Zari', '#059669', 'MEERA-TEEN-1718Y', 299900, 399900, 10, true),
  ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'teen', 'XS', 'XS', 31.0, 78.7, 26.0, 66.0, 34.0, 86.4, 40.0, 101.6, 'Mint Zari', '#059669', 'MEERA-TEEN-XS', 269900, 379900, 8, true),
  ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'teen', 'S', 'S', 33.0, 83.8, 27.0, 68.6, 36.0, 91.4, 42.0, 106.7, 'Mint Zari', '#059669', 'MEERA-TEEN-S', 269900, 379900, 8, true),

  -- Teens 2 (Zoya): 13-14Y, 15-16Y, 17-18Y, XS
  ('bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb', 'teen', '13-14Y', '13-14Y', 31.0, 78.7, 26.0, 66.0, 34.0, 86.4, 48.0, 121.9, 'Twilight Lavender', '#7c3aed', 'ZOYA-TEEN-1314Y', 289900, 399900, 12, true),
  ('bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb', 'teen', '15-16Y', '15-16Y', 33.0, 83.8, 27.0, 68.6, 36.0, 91.4, 50.0, 127.0, 'Twilight Lavender', '#7c3aed', 'ZOYA-TEEN-1516Y', 289900, 399900, 10, true),
  ('bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb', 'teen', '17-18Y', '17-18Y', 35.0, 88.9, 28.0, 71.1, 38.0, 96.5, 52.0, 132.1, 'Twilight Lavender', '#7c3aed', 'ZOYA-TEEN-1718Y', 319900, 429900, 9, true),
  ('bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb', 'teen', 'XS', 'XS', 31.0, 78.7, 26.0, 66.0, 34.0, 86.4, 48.0, 121.9, 'Twilight Lavender', '#7c3aed', 'ZOYA-TEEN-XS', 289900, 399900, 8, true),

  -- Girls 1 (Aadhya): 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12Y
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'kids', '2-3Y', '2-3Y', 21.0, 53.3, 20.0, 50.8, 22.0, 55.9, 22.0, 55.9, 'Rose Gold', '#e11d48', 'AADHYA-GIRLS-23Y', 249900, 349900, 15, true),
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'kids', '4-5Y', '4-5Y', 23.0, 58.4, 22.0, 55.9, 24.0, 61.0, 26.0, 66.0, 'Rose Gold', '#e11d48', 'AADHYA-GIRLS-45Y', 249900, 349900, 18, true),
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'kids', '6-7Y', '6-7Y', 25.0, 63.5, 24.0, 61.0, 26.0, 66.0, 30.0, 76.2, 'Rose Gold', '#e11d48', 'AADHYA-GIRLS-67Y', 249900, 349900, 20, true),
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'kids', '8-9Y', '8-9Y', 27.0, 68.6, 26.0, 66.0, 28.0, 71.1, 34.0, 86.4, 'Rose Gold', '#e11d48', 'AADHYA-GIRLS-89Y', 249900, 349900, 14, true),
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'kids', '10-11Y', '10-11Y', 29.0, 73.7, 28.0, 71.1, 30.0, 76.2, 38.0, 96.5, 'Rose Gold', '#e11d48', 'AADHYA-GIRLS-1011Y', 249900, 349900, 10, true),
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'kids', '12Y', '12Y', 31.0, 78.7, 29.0, 73.7, 32.0, 81.3, 41.0, 104.1, 'Rose Gold', '#e11d48', 'AADHYA-GIRLS-12Y', 249900, 349900, 8, true),

  -- Girls 2 (Avani): 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y
  ('cccccccc-2222-cccc-cccc-cccccccccccc', 'kids', '2-3Y', '2-3Y', 21.0, 53.3, 20.0, 50.8, 22.0, 55.9, 20.0, 50.8, 'Emerald Green', '#047857', 'AVANI-GIRLS-23Y', 179900, 239900, 16, true),
  ('cccccccc-2222-cccc-cccc-cccccccccccc', 'kids', '4-5Y', '4-5Y', 23.0, 58.4, 22.0, 55.9, 24.0, 61.0, 24.0, 61.0, 'Emerald Green', '#047857', 'AVANI-GIRLS-45Y', 179900, 239900, 20, true),
  ('cccccccc-2222-cccc-cccc-cccccccccccc', 'kids', '6-7Y', '6-7Y', 25.0, 63.5, 24.0, 61.0, 26.0, 66.0, 28.0, 71.1, 'Emerald Green', '#047857', 'AVANI-GIRLS-67Y', 179900, 239900, 18, true),
  ('cccccccc-2222-cccc-cccc-cccccccccccc', 'kids', '8-9Y', '8-9Y', 27.0, 68.6, 26.0, 66.0, 28.0, 71.1, 32.0, 81.3, 'Emerald Green', '#047857', 'AVANI-GIRLS-89Y', 179900, 239900, 12, true),
  ('cccccccc-2222-cccc-cccc-cccccccccccc', 'kids', '10-11Y', '10-11Y', 29.0, 73.7, 28.0, 71.1, 30.0, 76.2, 36.0, 91.4, 'Emerald Green', '#047857', 'AVANI-GIRLS-1011Y', 179900, 239900, 10, true)
on conflict (sku) do update set
  size_group = excluded.size_group,
  size_name = excluded.size_name,
  bust_inches = excluded.bust_inches,
  bust_cm = excluded.bust_cm,
  waist_inches = excluded.waist_inches,
  waist_cm = excluded.waist_cm,
  hip_inches = excluded.hip_inches,
  hip_cm = excluded.hip_cm,
  length_inches = excluded.length_inches,
  length_cm = excluded.length_cm,
  price = excluded.price,
  mrp = excluded.mrp,
  stock = excluded.stock;

-- ==========================================
-- 4. High-Resolution Product Images
-- ==========================================
insert into public.product_images (product_id, image_url, alt_text, display_order, is_primary)
values
  -- Women 1
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', 'Aashna Crimson Zari Anarkali Gown Front', 0, true),
  ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', 'Aashna Crimson Zari Anarkali Gown Embroidery Close-up', 1, false),

  -- Women 2
  ('aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1000&q=80', 'Noor Floral Organza Tiered Gown', 0, true),

  -- Teens 1
  ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80', 'Meera Youth Mint & Gold Tissue Co-ord Set', 0, true),

  -- Teens 2
  ('bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80', 'Zoya Lavender Ombre Tiered Gown', 0, true),

  -- Girls 1
  ('cccccccc-1111-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80', 'Aadhya Rose Gold Zari Lehenga Choli', 0, true),

  -- Girls 2
  ('cccccccc-2222-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1000&q=80', 'Avani Emerald Flared Pure Cotton Twirl Frock', 0, true)
on conflict do nothing;
