-- Varnam Girls' Dress & Apparel Storefront Seed Data
-- Categories, Products, Variants (Ages 2-14), Images, Size Charts

-- ==========================================
-- 1. Categories
-- ==========================================
insert into public.categories (id, name, slug, description, image_url, display_order, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Festive & Ethnic', 'festive-ethnic', 'Handcrafted zari lehengas, anarkalis, and sharara sets designed for weddings and festivals.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Party Dresses', 'party-dresses', 'Whimsical tiered tulle gowns, organza frocks, and celebration dresses.', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Daily Frocks', 'daily-frocks', 'Soft, breathable pure cotton twirl frocks with playful prints for everyday comfort.', 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Comfort Casuals', 'comfort-casuals', 'Coord sets, jumpsuits, and cotton apparel with grow-room ease.', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80', 4, true)
on conflict (id) do nothing;

-- ==========================================
-- 2. Products with Mandatory Lining & Size Charts
-- ==========================================
insert into public.products (id, category_id, name, slug, description, fabric, lining, care_instructions, size_chart, is_active, is_featured)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Blush Peony Tiered Tulle Party Gown',
    'blush-peony-tiered-tulle-party-gown',
    'A fairy-tale tiered gown featuring soft French net, hand-appliqued blossom embroidery, and generous flare. Engineered with child comfort in mind: zero scratchy internal seams and hidden +2 inch side margins for easy letting out as your little girl grows.',
    'French Tulle & Shimmer Organza',
    '100% Breathable Mulmul Cotton',
    'Gentle hand wash in cold water or dry clean. Do not wring. Steam iron on reverse.',
    '[
      {"age": "2-3Y", "chest": "21 in / 53 cm", "waist": "20 in / 51 cm", "length": "24 in / 61 cm"},
      {"age": "4-5Y", "chest": "23 in / 58 cm", "waist": "22 in / 56 cm", "length": "28 in / 71 cm"},
      {"age": "6-7Y", "chest": "25 in / 63 cm", "waist": "24 in / 61 cm", "length": "32 in / 81 cm"},
      {"age": "8-9Y", "chest": "27 in / 68 cm", "waist": "26 in / 66 cm", "length": "36 in / 91 cm"},
      {"age": "10-11Y", "chest": "29 in / 73 cm", "waist": "28 in / 71 cm", "length": "40 in / 101 cm"},
      {"age": "12-14Y", "chest": "31 in / 78 cm", "waist": "30 in / 76 cm", "length": "44 in / 112 cm"}
    ]'::jsonb,
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Marigold Silk Brocade Festive Sharara Set',
    'marigold-silk-brocade-festive-sharara-set',
    'Royal gold zari brocade peplum kurta paired with a flared tiered sharara and sheer dupatta. Lined with premium feather-soft cotton voile so your princess can celebrate Diwali and weddings without itching or fuss.',
    'Pure Chanderi Silk Brocade & Georgette',
    '100% Feather-Soft Cotton Voile',
    'Dry clean recommended to preserve zari sheen. Low heat iron with protective press cloth.',
    '[
      {"age": "2-3Y", "chest": "21 in / 53 cm", "waist": "20 in / 51 cm", "length": "22 in / 56 cm"},
      {"age": "4-5Y", "chest": "23 in / 58 cm", "waist": "22 in / 56 cm", "length": "26 in / 66 cm"},
      {"age": "6-7Y", "chest": "25 in / 63 cm", "waist": "24 in / 61 cm", "length": "30 in / 76 cm"},
      {"age": "8-9Y", "chest": "27 in / 68 cm", "waist": "26 in / 66 cm", "length": "34 in / 86 cm"},
      {"age": "10-11Y", "chest": "29 in / 73 cm", "waist": "28 in / 71 cm", "length": "38 in / 96 cm"},
      {"age": "12-14Y", "chest": "31 in / 78 cm", "waist": "30 in / 76 cm", "length": "42 in / 106 cm"}
    ]'::jsonb,
    true,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Gulabi Meadow Hand-Blocked Cotton Twirl Frock',
    'gulabi-meadow-hand-blocked-cotton-twirl-frock',
    'Everyday joy in handcrafted floral hand-block prints. Featuring double circular flare for 360-degree twirls, soft fabric-covered buttons, and gentle elasticated flutter sleeves.',
    '100% Organic Cambric Cotton',
    '100% Ultra-Soft Cambric Cotton Self-Lined',
    'Machine wash gentle cycle cold with like colors. Line dry in shade.',
    '[
      {"age": "2-3Y", "chest": "21 in / 53 cm", "waist": "20 in / 51 cm", "length": "20 in / 51 cm"},
      {"age": "4-5Y", "chest": "23 in / 58 cm", "waist": "22 in / 56 cm", "length": "24 in / 61 cm"},
      {"age": "6-7Y", "chest": "25 in / 63 cm", "waist": "24 in / 61 cm", "length": "28 in / 71 cm"},
      {"age": "8-9Y", "chest": "27 in / 68 cm", "waist": "26 in / 66 cm", "length": "32 in / 81 cm"},
      {"age": "10-11Y", "chest": "29 in / 73 cm", "waist": "28 in / 71 cm", "length": "36 in / 91 cm"},
      {"age": "12-14Y", "chest": "31 in / 78 cm", "waist": "30 in / 76 cm", "length": "39 in / 99 cm"}
    ]'::jsonb,
    true,
    true
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'Mayur Emerald Zari Hand-Embroidered Lehenga Set',
    'mayur-emerald-zari-hand-embroidered-lehenga-set',
    'Regal emerald green tissue skirt adorned with traditional peacock motifs in golden zari threadwork, paired with a ruby blouse and scalloped border organza dupatta.',
    'Pure Tissue Silk & Metallic Weave',
    '100% Pure Breathable Malmul Cotton',
    'Dry clean only. Store wrapped in muslin cloth.',
    '[
      {"age": "2-3Y", "chest": "21 in / 53 cm", "waist": "20 in / 51 cm", "length": "22 in / 56 cm"},
      {"age": "4-5Y", "chest": "23 in / 58 cm", "waist": "22 in / 56 cm", "length": "26 in / 66 cm"},
      {"age": "6-7Y", "chest": "25 in / 63 cm", "waist": "24 in / 61 cm", "length": "30 in / 76 cm"},
      {"age": "8-9Y", "chest": "27 in / 68 cm", "waist": "26 in / 66 cm", "length": "34 in / 86 cm"},
      {"age": "10-11Y", "chest": "29 in / 73 cm", "waist": "28 in / 71 cm", "length": "38 in / 96 cm"},
      {"age": "12-14Y", "chest": "31 in / 78 cm", "waist": "30 in / 76 cm", "length": "42 in / 106 cm"}
    ]'::jsonb,
    true,
    true
  )
on conflict (id) do nothing;

-- ==========================================
-- 3. Product Variants (Age 2-14 with Prices in Paise)
-- ==========================================
insert into public.product_variants (id, product_id, size_age, color_name, color_hex, sku, price, mrp, stock, is_active)
values
  -- Blush Peony Gown Variants
  ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2-3Y', 'Blush Rose', '#F43F5E', 'VRN-BPG-23Y', 229900, 319900, 8, true),
  ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4-5Y', 'Blush Rose', '#F43F5E', 'VRN-BPG-45Y', 249900, 349900, 5, true),
  ('10000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '6-7Y', 'Blush Rose', '#F43F5E', 'VRN-BPG-67Y', 269900, 379900, 10, true),
  ('10000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '8-9Y', 'Blush Rose', '#F43F5E', 'VRN-BPG-89Y', 289900, 399900, 6, true),
  ('10000000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10-11Y', 'Blush Rose', '#F43F5E', 'VRN-BPG-1011Y', 319900, 429900, 4, true),
  ('10000000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12-14Y', 'Blush Rose', '#F43F5E', 'VRN-BPG-1214Y', 349900, 459900, 3, true),

  -- Marigold Sharara Set Variants
  ('20000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2-3Y', 'Warm Marigold', '#D97706', 'VRN-MSS-23Y', 289900, 389900, 6, true),
  ('20000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4-5Y', 'Warm Marigold', '#D97706', 'VRN-MSS-45Y', 299900, 399900, 7, true),
  ('20000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '6-7Y', 'Warm Marigold', '#D97706', 'VRN-MSS-67Y', 319900, 429900, 9, true),
  ('20000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '8-9Y', 'Warm Marigold', '#D97706', 'VRN-MSS-89Y', 339900, 449900, 4, true),
  ('20000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '10-11Y', 'Warm Marigold', '#D97706', 'VRN-MSS-1011Y', 369900, 479900, 3, true),

  -- Gulabi Meadow Cotton Frock Variants
  ('30000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2-3Y', 'Berry Pink', '#881337', 'VRN-GMF-23Y', 149900, 199900, 15, true),
  ('30000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '4-5Y', 'Berry Pink', '#881337', 'VRN-GMF-45Y', 159900, 219900, 12, true),
  ('30000000-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '6-7Y', 'Berry Pink', '#881337', 'VRN-GMF-67Y', 169900, 229900, 10, true),
  ('30000000-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '8-9Y', 'Berry Pink', '#881337', 'VRN-GMF-89Y', 189900, 249900, 8, true),

  -- Mayur Emerald Zari Lehenga Variants
  ('40000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '4-5Y', 'Emerald Green', '#065F46', 'VRN-MEZ-45Y', 329900, 449900, 6, true),
  ('40000000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '6-7Y', 'Emerald Green', '#065F46', 'VRN-MEZ-67Y', 349900, 469900, 5, true),
  ('40000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '8-9Y', 'Emerald Green', '#065F46', 'VRN-MEZ-89Y', 379900, 499900, 4, true)
on conflict (id) do nothing;

-- ==========================================
-- 4. Product Images
-- ==========================================
insert into public.product_images (id, product_id, image_url, alt_text, display_order, is_primary)
values
  -- Blush Peony Gown
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80', 'Blush Peony Tiered Tulle Party Gown Front View', 1, true),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80', 'Blush Peony Gown Back & Bow Detail', 2, false),
  ('a3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80', 'Pure Cotton Inner Lining Soft Seam Macro View', 3, false),

  -- Marigold Sharara Set
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', 'Marigold Silk Brocade Sharara Set Full View', 1, true),
  ('b2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', 'Gold Zari Work Kurta Detail', 2, false),

  -- Gulabi Meadow Cotton Frock
  ('c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1000&q=80', 'Gulabi Meadow Cotton Twirl Frock Front', 1, true),

  -- Mayur Emerald Lehenga Set
  ('d1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80', 'Mayur Emerald Zari Lehenga Set Front', 1, true)
on conflict (id) do nothing;
