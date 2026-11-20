export interface FallbackCategory {
  id: string;
  name: string;
  slug: string;
  segment: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface FallbackBanner {
  id: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface FallbackProductVariant {
  id: string;
  size_group: string;
  size_name: string;
  size_age: string | null;
  bust_inches: number | null;
  bust_cm: number | null;
  waist_inches: number | null;
  waist_cm: number | null;
  hip_inches: number | null;
  hip_cm: number | null;
  length_inches: number | null;
  length_cm: number | null;
  color_name: string;
  color_hex: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  is_active: boolean;
}

export interface FallbackProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

export interface FallbackProduct {
  id: string;
  category_id: string;
  segment: "girls" | "teens" | "women";
  name: string;
  slug: string;
  description: string;
  fabric: string;
  lining: string;
  craft_work: string;
  set_includes: string;
  wash_care: string;
  care_instructions: string;
  model_height: string;
  model_size_worn: string;
  size_chart: Array<Record<string, unknown>>;
  is_featured: boolean;
  created_at: string;
  categories: {
    id: string;
    name: string;
    slug: string;
    segment: string;
    is_active: boolean;
  };
  product_variants: FallbackProductVariant[];
  product_images: FallbackProductImage[];
}

export const FALLBACK_CATEGORIES: FallbackCategory[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Festive & Wedding",
    slug: "festive-wedding",
    segment: "all",
    description: "Handcrafted zari lehengas, royal anarkalis, and pure silk heritage wear for grand family celebrations.",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    display_order: 1,
    is_active: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Party & Evening Gowns",
    slug: "party-gowns",
    segment: "all",
    description: "Whimsical tiered tulle gowns, organza flared silhouettes, and celebration couture with non-scratch linings.",
    image_url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
    display_order: 2,
    is_active: true,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Cotton Twirl Frocks & Day Dresses",
    slug: "cotton-dresses",
    segment: "all",
    description: "Soft, breathable organic cotton twirl frocks and elegant flared midi dresses for breezy comfort.",
    image_url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80",
    display_order: 3,
    is_active: true,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Casuals & Co-ords",
    slug: "casuals-coords",
    segment: "all",
    description: "Modern co-ord sets, contemporary fusion silhouettes, and easy everyday apparel with growth room.",
    image_url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    display_order: 4,
    is_active: true,
  },
];

export const FALLBACK_BANNERS: FallbackBanner[] = [
  {
    id: "eeeeeeee-1111-eeee-eeee-eeeeeeeeeeee",
    title: "Festive & Wedding Couture 2026",
    subtitle: "Pure Kanchipuram Silks, Velvet Lehengas & Handwoven Brocades for Little Princesses",
    cta_label: "Shop Festive Lehengas",
    cta_link: "/collections/festive-wedding",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "eeeeeeee-2222-eeee-eeee-eeeeeeeeeeee",
    title: "Pure Mulmul Cotton Everyday Frocks",
    subtitle: "Breathable, Skin-Soft Handblock Prints with Zero Synthetic Contact",
    cta_label: "Explore Cotton Comfort",
    cta_link: "/collections/cotton-dresses",
    image_url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1200&q=80",
    is_active: true,
    sort_order: 2,
  },
];

export const FALLBACK_PRODUCTS: FallbackProduct[] = [
  {
    id: "aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa",
    category_id: "11111111-1111-1111-1111-111111111111",
    segment: "women",
    name: "Aashna Royal Crimson Raw Silk Zari Anarkali Gown",
    slug: "aashna-royal-crimson-raw-silk-zari-anarkali-gown",
    description: "A majestic floor-length royal crimson anarkali tailored from handloom Varanasi raw silk. Featuring hand-embroidered antique gold zardozi motifs across the neckline and flare. Tailored with 3-inch interior margins for effortless custom alteration and lined entirely in featherlight malmal cotton.",
    fabric: "Pure Varanasi Raw Silk & Zari",
    lining: "100% Breathable Malmal Cotton",
    craft_work: "Handwoven Zari Weave & Antique Gold Zardozi",
    set_includes: "Anarkali Gown + Net Dupatta",
    wash_care: "Dry Clean Only",
    care_instructions: "Dry clean only. Steam iron on reverse under protective cloth.",
    model_height: "5'8\" (173 cm)",
    model_size_worn: "Size S",
    size_chart: [
      { size: "XS", bust_in: 32, bust_cm: 81.3, waist_in: 26, waist_cm: 66.0, hip_in: 36, hip_cm: 91.4, length_in: 52, length_cm: 132.1 },
      { size: "S", bust_in: 34, bust_cm: 86.4, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 52, length_cm: 132.1 },
      { size: "M", bust_in: 36, bust_cm: 91.4, waist_in: 30, waist_cm: 76.2, hip_in: 40, hip_cm: 101.6, length_in: 53, length_cm: 134.6 },
      { size: "L", bust_in: 38, bust_cm: 96.5, waist_in: 32, waist_cm: 81.3, hip_in: 42, hip_cm: 106.7, length_in: 54, length_cm: 137.2 },
      { size: "XL", bust_in: 40, bust_cm: 101.6, waist_in: 34, waist_cm: 86.4, hip_in: 44, hip_cm: 111.8, length_in: 54, length_cm: 137.2 },
      { size: "XXL", bust_in: 42, bust_cm: 106.7, waist_in: 36, waist_cm: 91.4, hip_in: 46, hip_cm: 116.8, length_in: 55, length_cm: 139.7 },
    ],
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    categories: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Festive & Wedding",
      slug: "festive-wedding",
      segment: "all",
      is_active: true,
    },
    product_variants: [
      { id: "var-w1-xs", size_group: "women", size_name: "XS", size_age: "XS", bust_inches: 32.0, bust_cm: 81.3, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 36.0, hip_cm: 91.4, length_inches: 52.0, length_cm: 132.1, color_name: "Royal Crimson", color_hex: "#881337", sku: "AASHNA-WOMEN-XS", price: 349900, mrp: 499900, stock: 12, is_active: true },
      { id: "var-w1-s", size_group: "women", size_name: "S", size_age: "S", bust_inches: 34.0, bust_cm: 86.4, waist_inches: 28.0, waist_cm: 71.1, hip_inches: 38.0, hip_cm: 96.5, length_inches: 52.0, length_cm: 132.1, color_name: "Royal Crimson", color_hex: "#881337", sku: "AASHNA-WOMEN-S", price: 349900, mrp: 499900, stock: 15, is_active: true },
      { id: "var-w1-m", size_group: "women", size_name: "M", size_age: "M", bust_inches: 36.0, bust_cm: 91.4, waist_inches: 30.0, waist_cm: 76.2, hip_inches: 40.0, hip_cm: 101.6, length_inches: 53.0, length_cm: 134.6, color_name: "Royal Crimson", color_hex: "#881337", sku: "AASHNA-WOMEN-M", price: 349900, mrp: 499900, stock: 15, is_active: true },
      { id: "var-w1-l", size_group: "women", size_name: "L", size_age: "L", bust_inches: 38.0, bust_cm: 96.5, waist_inches: 32.0, waist_cm: 81.3, hip_inches: 42.0, hip_cm: 106.7, length_inches: 54.0, length_cm: 137.2, color_name: "Royal Crimson", color_hex: "#881337", sku: "AASHNA-WOMEN-L", price: 349900, mrp: 499900, stock: 10, is_active: true },
      { id: "var-w1-xl", size_group: "women", size_name: "XL", size_age: "XL", bust_inches: 40.0, bust_cm: 101.6, waist_inches: 34.0, waist_cm: 86.4, hip_inches: 44.0, hip_cm: 111.8, length_inches: 54.0, length_cm: 137.2, color_name: "Royal Crimson", color_hex: "#881337", sku: "AASHNA-WOMEN-XL", price: 349900, mrp: 499900, stock: 8, is_active: true },
      { id: "var-w1-xxl", size_group: "women", size_name: "XXL", size_age: "XXL", bust_inches: 42.0, bust_cm: 106.7, waist_inches: 36.0, waist_cm: 91.4, hip_inches: 46.0, hip_cm: 116.8, length_inches: 55.0, length_cm: 139.7, color_name: "Royal Crimson", color_hex: "#881337", sku: "AASHNA-WOMEN-XXL", price: 349900, mrp: 499900, stock: 6, is_active: true },
    ],
    product_images: [
      { id: "img-w1-1", image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80", alt_text: "Aashna Crimson Zari Anarkali Gown Front", display_order: 0, is_primary: true },
      { id: "img-w1-2", image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80", alt_text: "Aashna Crimson Zari Anarkali Gown Embroidery Close-up", display_order: 1, is_primary: false },
    ],
  },
  {
    id: "aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa",
    category_id: "22222222-2222-2222-2222-222222222222",
    segment: "women",
    name: "Noor Hand-Painted Floral Organza Tiered Gown",
    slug: "noor-hand-painted-floral-organza-tiered-gown",
    description: "Ethereal multi-tiered evening gown rendered in sheer blush silk organza with delicate floral brushwork. Soft structured bodice with non-scratch internal boning wrapped in pure cotton.",
    fabric: "Silk Organza & Soft French Net",
    lining: "100% Pure Mulmul Cotton",
    craft_work: "Hand-Painted Floral Organza & Scalloped Hem",
    set_includes: "Tiered Gown + Cotton Voile Slip",
    wash_care: "Dry Clean Only",
    care_instructions: "Dry clean recommended to preserve delicate floral hand-painting.",
    model_height: "5'7\" (170 cm)",
    model_size_worn: "Size S",
    size_chart: [
      { size: "XS", bust_in: 32, bust_cm: 81.3, waist_in: 26, waist_cm: 66.0, hip_in: 36, hip_cm: 91.4, length_in: 54, length_cm: 137.2 },
      { size: "S", bust_in: 34, bust_cm: 86.4, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 54, length_cm: 137.2 },
      { size: "M", bust_in: 36, bust_cm: 91.4, waist_in: 30, waist_cm: 76.2, hip_in: 40, hip_cm: 101.6, length_in: 55, length_cm: 139.7 },
      { size: "L", bust_in: 38, bust_cm: 96.5, waist_in: 32, waist_cm: 81.3, hip_in: 42, hip_cm: 106.7, length_in: 55, length_cm: 139.7 },
      { size: "XL", bust_in: 40, bust_cm: 101.6, waist_in: 34, waist_cm: 86.4, hip_in: 44, hip_cm: 111.8, length_in: 56, length_cm: 142.2 },
    ],
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    categories: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Party & Evening Gowns",
      slug: "party-gowns",
      segment: "all",
      is_active: true,
    },
    product_variants: [
      { id: "var-w2-xs", size_group: "women", size_name: "XS", size_age: "XS", bust_inches: 32.0, bust_cm: 81.3, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 36.0, hip_cm: 91.4, length_inches: 54.0, length_cm: 137.2, color_name: "Blush Peony", color_hex: "#f43f5e", sku: "NOOR-WOMEN-XS", price: 429900, mrp: 599900, stock: 8, is_active: true },
      { id: "var-w2-s", size_group: "women", size_name: "S", size_age: "S", bust_inches: 34.0, bust_cm: 86.4, waist_inches: 28.0, waist_cm: 71.1, hip_inches: 38.0, hip_cm: 96.5, length_inches: 54.0, length_cm: 137.2, color_name: "Blush Peony", color_hex: "#f43f5e", sku: "NOOR-WOMEN-S", price: 429900, mrp: 599900, stock: 12, is_active: true },
      { id: "var-w2-m", size_group: "women", size_name: "M", size_age: "M", bust_inches: 36.0, bust_cm: 91.4, waist_inches: 30.0, waist_cm: 76.2, hip_inches: 40.0, hip_cm: 101.6, length_inches: 55.0, length_cm: 139.7, color_name: "Blush Peony", color_hex: "#f43f5e", sku: "NOOR-WOMEN-M", price: 429900, mrp: 599900, stock: 10, is_active: true },
      { id: "var-w2-l", size_group: "women", size_name: "L", size_age: "L", bust_inches: 38.0, bust_cm: 96.5, waist_inches: 32.0, waist_cm: 81.3, hip_inches: 42.0, hip_cm: 106.7, length_inches: 55.0, length_cm: 139.7, color_name: "Blush Peony", color_hex: "#f43f5e", sku: "NOOR-WOMEN-L", price: 429900, mrp: 599900, stock: 7, is_active: true },
    ],
    product_images: [
      { id: "img-w2-1", image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1000&q=80", alt_text: "Noor Floral Organza Tiered Gown", display_order: 0, is_primary: true },
    ],
  },
  {
    id: "bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb",
    category_id: "11111111-1111-1111-1111-111111111111",
    segment: "teens",
    name: "Meera Youth Mint & Gold Tissue Festive Co-ord Set",
    slug: "meera-youth-mint-gold-tissue-festive-coord-set",
    description: "Contemporary two-piece festive silhouette designed for modern teens. Lightweight Chanderi tissue peplum crop top paired with high-waist flared palazzo trousers. Finished with smooth elastic back-waist and rash-free mulmul lining.",
    fabric: "Chanderi Zari Tissue & Silk Georgette",
    lining: "100% Breathable Malmal Cotton",
    craft_work: "Chanderi Zari Tissue & Gota Patti Borders",
    set_includes: "Peplum Crop Top + Flared Palazzo",
    wash_care: "Gentle Hand Wash Cold",
    care_instructions: "Dry clean or gentle hand wash. Warm iron on reverse.",
    model_height: "5'2\" (157 cm)",
    model_size_worn: "Size XS / 13-14Y",
    size_chart: [
      { size: "13-14Y", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
      { size: "15-16Y", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
      { size: "17-18Y", bust_in: 35, bust_cm: 88.9, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 44, length_cm: 111.8 },
      { size: "XS", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
      { size: "S", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
    ],
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    categories: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Festive & Wedding",
      slug: "festive-wedding",
      segment: "all",
      is_active: true,
    },
    product_variants: [
      { id: "var-t1-1314", size_group: "teen", size_name: "13-14Y", size_age: "13-14Y", bust_inches: 31.0, bust_cm: 78.7, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 34.0, hip_cm: 86.4, length_inches: 40.0, length_cm: 101.6, color_name: "Mint Zari", color_hex: "#059669", sku: "MEERA-TEEN-1314Y", price: 269900, mrp: 379900, stock: 14, is_active: true },
      { id: "var-t1-1516", size_group: "teen", size_name: "15-16Y", size_age: "15-16Y", bust_inches: 33.0, bust_cm: 83.8, waist_inches: 27.0, waist_cm: 68.6, hip_inches: 36.0, hip_cm: 91.4, length_inches: 42.0, length_cm: 106.7, color_name: "Mint Zari", color_hex: "#059669", sku: "MEERA-TEEN-1516Y", price: 269900, mrp: 379900, stock: 12, is_active: true },
      { id: "var-t1-1718", size_group: "teen", size_name: "17-18Y", size_age: "17-18Y", bust_inches: 35.0, bust_cm: 88.9, waist_inches: 28.0, waist_cm: 71.1, hip_inches: 38.0, hip_cm: 96.5, length_inches: 44.0, length_cm: 111.8, color_name: "Mint Zari", color_hex: "#059669", sku: "MEERA-TEEN-1718Y", price: 299900, mrp: 399900, stock: 10, is_active: true },
      { id: "var-t1-xs", size_group: "teen", size_name: "XS", size_age: "XS", bust_inches: 31.0, bust_cm: 78.7, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 34.0, hip_cm: 86.4, length_inches: 40.0, length_cm: 101.6, color_name: "Mint Zari", color_hex: "#059669", sku: "MEERA-TEEN-XS", price: 269900, mrp: 379900, stock: 8, is_active: true },
      { id: "var-t1-s", size_group: "teen", size_name: "S", size_age: "S", bust_inches: 33.0, bust_cm: 83.8, waist_inches: 27.0, waist_cm: 68.6, hip_inches: 36.0, hip_cm: 91.4, length_inches: 42.0, length_cm: 106.7, color_name: "Mint Zari", color_hex: "#059669", sku: "MEERA-TEEN-S", price: 269900, mrp: 379900, stock: 8, is_active: true },
    ],
    product_images: [
      { id: "img-t1-1", image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80", alt_text: "Meera Youth Mint & Gold Tissue Co-ord Set", display_order: 0, is_primary: true },
    ],
  },
  {
    id: "bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb",
    category_id: "22222222-2222-2222-2222-222222222222",
    segment: "teens",
    name: "Zoya Lavender Ombré Tiered Party Gown",
    slug: "zoya-lavender-ombre-tiered-party-gown",
    description: "Dreamy twilight lavender ombré tulle gown with flutter shoulder straps and subtle pearl sequin dusting. Tailored specifically for teen proportions with soft voile lining.",
    fabric: "Ombré Shimmer Tulle & Crepe",
    lining: "100% Breathable Feather-Soft Voile",
    craft_work: "Shimmer Tulle & Micro-Sequin Embroidery",
    set_includes: "Tiered Gown",
    wash_care: "Dry Clean Only",
    care_instructions: "Dry clean only. Hang on padded hanger.",
    model_height: "5'3\" (160 cm)",
    model_size_worn: "Size 13-14Y",
    size_chart: [
      { size: "13-14Y", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 48, length_cm: 121.9 },
      { size: "15-16Y", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 50, length_cm: 127.0 },
      { size: "17-18Y", bust_in: 35, bust_cm: 88.9, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 52, length_cm: 132.1 },
      { size: "XS", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 48, length_cm: 121.9 },
    ],
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    categories: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Party & Evening Gowns",
      slug: "party-gowns",
      segment: "all",
      is_active: true,
    },
    product_variants: [
      { id: "var-t2-1314", size_group: "teen", size_name: "13-14Y", size_age: "13-14Y", bust_inches: 31.0, bust_cm: 78.7, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 34.0, hip_cm: 86.4, length_inches: 48.0, length_cm: 121.9, color_name: "Twilight Lavender", color_hex: "#7c3aed", sku: "ZOYA-TEEN-1314Y", price: 289900, mrp: 399900, stock: 12, is_active: true },
      { id: "var-t2-1516", size_group: "teen", size_name: "15-16Y", size_age: "15-16Y", bust_inches: 33.0, bust_cm: 83.8, waist_inches: 27.0, waist_cm: 68.6, hip_inches: 36.0, hip_cm: 91.4, length_inches: 50.0, length_cm: 127.0, color_name: "Twilight Lavender", color_hex: "#7c3aed", sku: "ZOYA-TEEN-1516Y", price: 289900, mrp: 399900, stock: 10, is_active: true },
      { id: "var-t2-1718", size_group: "teen", size_name: "17-18Y", size_age: "17-18Y", bust_inches: 35.0, bust_cm: 88.9, waist_inches: 28.0, waist_cm: 71.1, hip_inches: 38.0, hip_cm: 96.5, length_inches: 52.0, length_cm: 132.1, color_name: "Twilight Lavender", color_hex: "#7c3aed", sku: "ZOYA-TEEN-1718Y", price: 319900, mrp: 429900, stock: 9, is_active: true },
      { id: "var-t2-xs", size_group: "teen", size_name: "XS", size_age: "XS", bust_inches: 31.0, bust_cm: 78.7, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 34.0, hip_cm: 86.4, length_inches: 48.0, length_cm: 121.9, color_name: "Twilight Lavender", color_hex: "#7c3aed", sku: "ZOYA-TEEN-XS", price: 289900, mrp: 399900, stock: 8, is_active: true },
    ],
    product_images: [
      { id: "img-t2-1", image_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80", alt_text: "Zoya Lavender Ombre Tiered Gown", display_order: 0, is_primary: true },
    ],
  },
  {
    id: "cccccccc-1111-cccc-cccc-cccccccccccc",
    category_id: "11111111-1111-1111-1111-111111111111",
    segment: "girls",
    name: "Aadhya Rose Gold Zari Lehenga Choli",
    slug: "aadhya-rose-gold-zari-lehenga-choli",
    description: "A radiant rose pink brocade skirt adorned with traditional golden peacocks and floral zari jaal. Paired with a comfortable choli blouse featuring soft cotton lining and back tie-ups.",
    fabric: "Pure Brocade Silk & Tissue Organza",
    lining: "100% Breathable Malmal Cotton",
    craft_work: "Handwoven Peacock Zari Border & Brocade Jaal",
    set_includes: "Blouse + Pavadai Skirt + Cotton Potli",
    wash_care: "Dry Clean Only",
    care_instructions: "Dry clean recommended to preserve zari luster. Store wrapped in cotton muslin.",
    model_height: "4'2\" (127 cm)",
    model_size_worn: "Ages 6-7Y",
    size_chart: [
      { size: "2-3Y", bust_in: 21, bust_cm: 53.3, waist_in: 20, waist_cm: 50.8, hip_in: 22, hip_cm: 55.9, length_in: 22, length_cm: 55.9 },
      { size: "4-5Y", bust_in: 23, bust_cm: 58.4, waist_in: 22, waist_cm: 55.9, hip_in: 24, hip_cm: 61.0, length_in: 26, length_cm: 66.0 },
      { size: "6-7Y", bust_in: 25, bust_cm: 63.5, waist_in: 24, waist_cm: 61.0, hip_in: 26, hip_cm: 66.0, length_in: 30, length_cm: 76.2 },
      { size: "8-9Y", bust_in: 27, bust_cm: 68.6, waist_in: 26, waist_cm: 66.0, hip_in: 28, hip_cm: 71.1, length_in: 34, length_cm: 86.4 },
      { size: "10-11Y", bust_in: 29, bust_cm: 73.7, waist_in: 28, waist_cm: 71.1, hip_in: 30, hip_cm: 76.2, length_in: 38, length_cm: 96.5 },
      { size: "12Y", bust_in: 31, bust_cm: 78.7, waist_in: 29, waist_cm: 73.7, hip_in: 32, hip_cm: 81.3, length_in: 41, length_cm: 104.1 },
    ],
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    categories: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Festive & Wedding",
      slug: "festive-wedding",
      segment: "all",
      is_active: true,
    },
    product_variants: [
      { id: "var-g1-23", size_group: "kids", size_name: "2-3Y", size_age: "2-3Y", bust_inches: 21.0, bust_cm: 53.3, waist_inches: 20.0, waist_cm: 50.8, hip_inches: 22.0, hip_cm: 55.9, length_inches: 22.0, length_cm: 55.9, color_name: "Rose Gold", color_hex: "#e11d48", sku: "AADHYA-GIRLS-23Y", price: 249900, mrp: 349900, stock: 15, is_active: true },
      { id: "var-g1-45", size_group: "kids", size_name: "4-5Y", size_age: "4-5Y", bust_inches: 23.0, bust_cm: 58.4, waist_inches: 22.0, waist_cm: 55.9, hip_inches: 24.0, hip_cm: 61.0, length_inches: 26.0, length_cm: 66.0, color_name: "Rose Gold", color_hex: "#e11d48", sku: "AADHYA-GIRLS-45Y", price: 249900, mrp: 349900, stock: 18, is_active: true },
      { id: "var-g1-67", size_group: "kids", size_name: "6-7Y", size_age: "6-7Y", bust_inches: 25.0, bust_cm: 63.5, waist_inches: 24.0, waist_cm: 61.0, hip_inches: 26.0, hip_cm: 66.0, length_inches: 30.0, length_cm: 76.2, color_name: "Rose Gold", color_hex: "#e11d48", sku: "AADHYA-GIRLS-67Y", price: 249900, mrp: 349900, stock: 20, is_active: true },
      { id: "var-g1-89", size_group: "kids", size_name: "8-9Y", size_age: "8-9Y", bust_inches: 27.0, bust_cm: 68.6, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 28.0, hip_cm: 71.1, length_inches: 34.0, length_cm: 86.4, color_name: "Rose Gold", color_hex: "#e11d48", sku: "AADHYA-GIRLS-89Y", price: 249900, mrp: 349900, stock: 14, is_active: true },
      { id: "var-g1-1011", size_group: "kids", size_name: "10-11Y", size_age: "10-11Y", bust_inches: 29.0, bust_cm: 73.7, waist_inches: 28.0, waist_cm: 71.1, hip_inches: 30.0, hip_cm: 76.2, length_inches: 38.0, length_cm: 96.5, color_name: "Rose Gold", color_hex: "#e11d48", sku: "AADHYA-GIRLS-1011Y", price: 249900, mrp: 349900, stock: 10, is_active: true },
      { id: "var-g1-12", size_group: "kids", size_name: "12Y", size_age: "12Y", bust_inches: 31.0, bust_cm: 78.7, waist_inches: 29.0, waist_cm: 73.7, hip_inches: 32.0, hip_cm: 81.3, length_inches: 41.0, length_cm: 104.1, color_name: "Rose Gold", color_hex: "#e11d48", sku: "AADHYA-GIRLS-12Y", price: 249900, mrp: 349900, stock: 8, is_active: true },
    ],
    product_images: [
      { id: "img-g1-1", image_url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80", alt_text: "Aadhya Rose Gold Zari Lehenga Choli", display_order: 0, is_primary: true },
    ],
  },
  {
    id: "cccccccc-2222-cccc-cccc-cccccccccccc",
    category_id: "33333333-3333-3333-3333-333333333333",
    segment: "girls",
    name: "Avani Emerald Flared Pure Cotton Twirl Frock",
    slug: "avani-emerald-flared-pure-cotton-twirl-frock",
    description: "Handcrafted 360-degree twirl frock made from heritage Bagru floral handblock prints. Double flared hem, covered fabric buttons, and zero synthetic contact for all-day skin comfort.",
    fabric: "100% Organic Handblock Cambric Cotton",
    lining: "100% Ultra-Soft Cambric Cotton Self-Lined",
    craft_work: "Heritage Bagru Handblock Print",
    set_includes: "Twirl Frock + Matching Cotton Hair Bow",
    wash_care: "Machine Wash Gentle Cold",
    care_instructions: "Machine wash gentle cold with like colors. Line dry in shade.",
    model_height: "3'10\" (117 cm)",
    model_size_worn: "Ages 4-5Y",
    size_chart: [
      { size: "2-3Y", bust_in: 21, bust_cm: 53.3, waist_in: 20, waist_cm: 50.8, hip_in: 22, hip_cm: 55.9, length_in: 20, length_cm: 50.8 },
      { size: "4-5Y", bust_in: 23, bust_cm: 58.4, waist_in: 22, waist_cm: 55.9, hip_in: 24, hip_cm: 61.0, length_in: 24, length_cm: 61.0 },
      { size: "6-7Y", bust_in: 25, bust_cm: 63.5, waist_in: 24, waist_cm: 61.0, hip_in: 26, hip_cm: 66.0, length_in: 28, length_cm: 71.1 },
      { size: "8-9Y", bust_in: 27, bust_cm: 68.6, waist_in: 26, waist_cm: 66.0, hip_in: 28, hip_cm: 71.1, length_in: 32, length_cm: 81.3 },
      { size: "10-11Y", bust_in: 29, bust_cm: 73.7, waist_in: 28, waist_cm: 71.1, hip_in: 30, hip_cm: 76.2, length_in: 36, length_cm: 91.4 },
    ],
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    categories: {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Cotton Twirl Frocks & Day Dresses",
      slug: "cotton-dresses",
      segment: "all",
      is_active: true,
    },
    product_variants: [
      { id: "var-g2-23", size_group: "kids", size_name: "2-3Y", size_age: "2-3Y", bust_inches: 21.0, bust_cm: 53.3, waist_inches: 20.0, waist_cm: 50.8, hip_inches: 22.0, hip_cm: 55.9, length_inches: 20.0, length_cm: 50.8, color_name: "Emerald Green", color_hex: "#047857", sku: "AVANI-GIRLS-23Y", price: 179900, mrp: 239900, stock: 16, is_active: true },
      { id: "var-g2-45", size_group: "kids", size_name: "4-5Y", size_age: "4-5Y", bust_inches: 23.0, bust_cm: 58.4, waist_inches: 22.0, waist_cm: 55.9, hip_inches: 24.0, hip_cm: 61.0, length_inches: 24.0, length_cm: 61.0, color_name: "Emerald Green", color_hex: "#047857", sku: "AVANI-GIRLS-45Y", price: 179900, mrp: 239900, stock: 20, is_active: true },
      { id: "var-g2-67", size_group: "kids", size_name: "6-7Y", size_age: "6-7Y", bust_inches: 25.0, bust_cm: 63.5, waist_inches: 24.0, waist_cm: 61.0, hip_inches: 26.0, hip_cm: 66.0, length_inches: 28.0, length_cm: 71.1, color_name: "Emerald Green", color_hex: "#047857", sku: "AVANI-GIRLS-67Y", price: 179900, mrp: 239900, stock: 18, is_active: true },
      { id: "var-g2-89", size_group: "kids", size_name: "8-9Y", size_age: "8-9Y", bust_inches: 27.0, bust_cm: 68.6, waist_inches: 26.0, waist_cm: 66.0, hip_inches: 28.0, hip_cm: 71.1, length_inches: 32.0, length_cm: 81.3, color_name: "Emerald Green", color_hex: "#047857", sku: "AVANI-GIRLS-89Y", price: 179900, mrp: 239900, stock: 12, is_active: true },
      { id: "var-g2-1011", size_group: "kids", size_name: "10-11Y", size_age: "10-11Y", bust_inches: 29.0, bust_cm: 73.7, waist_inches: 28.0, waist_cm: 71.1, hip_inches: 30.0, hip_cm: 76.2, length_inches: 36.0, length_cm: 91.4, color_name: "Emerald Green", color_hex: "#047857", sku: "AVANI-GIRLS-1011Y", price: 179900, mrp: 239900, stock: 10, is_active: true },
    ],
    product_images: [
      { id: "img-g2-1", image_url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1000&q=80", alt_text: "Avani Emerald Flared Pure Cotton Twirl Frock", display_order: 0, is_primary: true },
    ],
  },
];
