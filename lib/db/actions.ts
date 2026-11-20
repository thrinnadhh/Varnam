"use server";

import { createServerSupabaseClient } from "./supabase";
import {
  checkoutSchema,
  addressSchema,
  heroBannerSchema,
  categoryNodeSchema,
  type CheckoutInput,
  type AddressInput,
  type StoreSettingsInput,
  type HeroBannerInput,
  type CategoryNodeInput,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  FALLBACK_CATEGORIES,
  FALLBACK_BANNERS,
  FALLBACK_HERO_BANNERS,
  FALLBACK_STORE_SETTINGS,
  FALLBACK_PRODUCTS,
  type FallbackProduct,
  type FallbackBanner,
} from "./fallback-data";

// ==========================================
// Store Settings & Rotating Hero Banners Actions
// ==========================================

export async function getStoreSettings() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_STORE_SETTINGS;
    }
    return data;
  } catch (err) {
    console.warn("Error fetching store settings, using fallback:", err);
    return FALLBACK_STORE_SETTINGS;
  }
}

export async function updateBannerDuration(durationSec: number) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const parsed = z.number().int().min(1).max(30).safeParse(durationSec);
    if (!parsed.success) {
      return { success: false, error: "Duration must be between 1 and 30 seconds" };
    }

    const { error } = await supabase
      .from("store_settings")
      .update({
        hero_banner_duration_sec: parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    if (error) {
      console.error("Error updating banner duration:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true, duration: parsed.data };
  } catch (err) {
    console.error("updateBannerDuration error:", err);
    return { success: false, error: "Failed to update rotation duration" };
  }
}

export async function updateStoreSettings(input: Partial<StoreSettingsInput>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase
      .from("store_settings")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update store settings" };
  }
}

export async function getHeroBanners(includeInactive = false): Promise<FallbackBanner[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("hero_banners").select("*");
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query.order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_HERO_BANNERS;
    }
    return data.map((b) => ({
      ...b,
      subtitle: b.subtitle || "",
      cta_link: b.cta_href || "/collections",
      image_url: b.desktop_image_url,
    }));
  } catch (err) {
    console.warn("Error fetching hero banners, using fallback:", err);
    return FALLBACK_HERO_BANNERS;
  }
}

export async function upsertHeroBanner(input: HeroBannerInput) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const parsed = heroBannerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const bannerData = {
      eyebrow_text: parsed.data.eyebrow_text || null,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      cta_label: parsed.data.cta_label,
      cta_href: parsed.data.cta_href,
      desktop_image_url: parsed.data.desktop_image_url,
      mobile_image_url: parsed.data.mobile_image_url || null,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.id) {
      const { data, error } = await supabase
        .from("hero_banners")
        .update(bannerData)
        .eq("id", parsed.data.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath("/");
      revalidatePath("/admin/banners");
      return { success: true, banner: data };
    } else {
      const { data, error } = await supabase
        .from("hero_banners")
        .insert(bannerData)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath("/");
      revalidatePath("/admin/banners");
      return { success: true, banner: data };
    }
  } catch (err) {
    console.error("upsertHeroBanner error:", err);
    return { success: false, error: "Failed to save banner" };
  }
}

export async function deleteHeroBanner(bannerId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase.from("hero_banners").delete().eq("id", bannerId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete banner" };
  }
}

export async function toggleHeroBannerActive(bannerId: string, isActive: boolean) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase
      .from("hero_banners")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", bannerId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle banner status" };
  }
}

export async function reorderHeroBanners(ordered: string[] | { id: string; sort_order: number }[]) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const items = typeof ordered[0] === "string"
      ? (ordered as string[]).map((id, idx) => ({ id, sort_order: idx }))
      : (ordered as { id: string; sort_order: number }[]);

    for (const item of items) {
      await supabase
        .from("hero_banners")
        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reorder banners" };
  }
}

// ==========================================
// Dynamic Navigation Tree & Category Actions
// ==========================================

export interface NavigationNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  show_in_nav: boolean;
  segment: string;
  children: NavigationNode[];
}

function buildFallbackNavigationTree(): NavigationNode[] {
  return [
    {
      id: "c1a00001-0000-0000-0000-000000000001",
      name: "Pattu & Lehengas",
      slug: "pattu-lehengas",
      description: "Traditional South Indian Pattu Pavadais and grand wedding lehengas.",
      image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      sort_order: 1,
      is_active: true,
      show_in_nav: true,
      segment: "all",
      children: [
        {
          id: "c1a00001-0000-0000-0000-000000000011",
          name: "Pattu Pavadai",
          slug: "pattu-pavadai",
          description: "Classic handloom silk pavadais with gold zari pallus.",
          image_url: null,
          sort_order: 1,
          is_active: true,
          show_in_nav: true,
          segment: "girls",
          children: [],
        },
        {
          id: "c1a00001-0000-0000-0000-000000000012",
          name: "Velvet & Brocade Lehengas",
          slug: "velvet-brocade-lehengas",
          description: "Opulent royal velvet flared lehengas with artisanal embroidery.",
          image_url: null,
          sort_order: 2,
          is_active: true,
          show_in_nav: true,
          segment: "all",
          children: [],
        },
        {
          id: "c1a00001-0000-0000-0000-000000000013",
          name: "Handloom Kanchi Tissue Sets",
          slug: "handloom-kanchi-tissue-sets",
          description: "Shimmering gold and silver tissue silk sets.",
          image_url: null,
          sort_order: 3,
          is_active: true,
          show_in_nav: true,
          segment: "all",
          children: [],
        },
      ],
    },
    {
      id: "c1a00001-0000-0000-0000-000000000002",
      name: "Anarkali & Shararas",
      slug: "anarkali-shararas",
      description: "High-flare silk anarkalis, festive sharara sets, and peplum kurtas.",
      image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      sort_order: 2,
      is_active: true,
      show_in_nav: true,
      segment: "all",
      children: [
        {
          id: "c1a00001-0000-0000-0000-000000000021",
          name: "Floor-Length Silk Anarkalis",
          slug: "floor-length-silk-anarkalis",
          description: "Flared multi-kali silhouette anarkalis crafted from Varanasi raw silk.",
          image_url: null,
          sort_order: 1,
          is_active: true,
          show_in_nav: true,
          segment: "women",
          children: [],
        },
        {
          id: "c1a00001-0000-0000-0000-000000000022",
          name: "Twirl Flare Sharara Suits",
          slug: "twirl-flare-sharara-suits",
          description: "Voluminous tiered shararas with short kurtis.",
          image_url: null,
          sort_order: 2,
          is_active: true,
          show_in_nav: true,
          segment: "all",
          children: [],
        },
        {
          id: "c1a00001-0000-0000-0000-000000000023",
          name: "Angrakha Peplum Sets",
          slug: "angrakha-peplum-sets",
          description: "Cross-over tie-up angrakhas paired with flared pants.",
          image_url: null,
          sort_order: 3,
          is_active: true,
          show_in_nav: true,
          segment: "teens",
          children: [],
        },
      ],
    },
    {
      id: "c1a00001-0000-0000-0000-000000000003",
      name: "Mulmul & Festive Frocks",
      slug: "mulmul-festive-frocks",
      description: "Breathable pure cotton and organza twirl frocks with artisanal motifs.",
      image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      sort_order: 3,
      is_active: true,
      show_in_nav: true,
      segment: "girls",
      children: [
        {
          id: "c1a00001-0000-0000-0000-000000000031",
          name: "Tiered Festive Cotton Frocks",
          slug: "tiered-festive-cotton-frocks",
          description: "Soft malmal cotton twirl dresses with handblock printed ruffles.",
          image_url: null,
          sort_order: 1,
          is_active: true,
          show_in_nav: true,
          segment: "girls",
          children: [],
        },
        {
          id: "c1a00001-0000-0000-0000-000000000032",
          name: "Embroidered Yoke Twirl Dresses",
          slug: "embroidered-yoke-twirl-dresses",
          description: "Frocks featuring zari yoke embroidery and gather skirts.",
          image_url: null,
          sort_order: 2,
          is_active: true,
          show_in_nav: true,
          segment: "girls",
          children: [],
        },
        {
          id: "c1a00001-0000-0000-0000-000000000033",
          name: "Zari-Trimmed Organza Frocks",
          slug: "zari-trimmed-organza-frocks",
          description: "Airy sheer organza occasion frocks with festive borders.",
          image_url: null,
          sort_order: 3,
          is_active: true,
          show_in_nav: true,
          segment: "girls",
          children: [],
        },
      ],
    },
  ];
}

export async function getNavigationTree(): Promise<NavigationNode[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .eq("show_in_nav", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return buildFallbackNavigationTree();
    }

    const parents = data.filter((c) => !c.parent_id);
    if (parents.length === 0) {
      return buildFallbackNavigationTree();
    }

    const children = data.filter((c) => !!c.parent_id);

    return parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      image_url: parent.image_url,
      sort_order: parent.sort_order || parent.display_order || 0,
      is_active: parent.is_active,
      show_in_nav: parent.show_in_nav,
      segment: parent.segment || "all",
      children: children
        .filter((child) => child.parent_id === parent.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          image_url: child.image_url,
          sort_order: child.sort_order || child.display_order || 0,
          is_active: child.is_active,
          show_in_nav: child.show_in_nav,
          segment: child.segment || "all",
          children: [],
        })),
    }));
  } catch (err) {
    console.warn("getNavigationTree error, using fallback:", err);
    return buildFallbackNavigationTree();
  }
}

export async function getCategoryTreeAdmin(): Promise<NavigationNode[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return buildFallbackNavigationTree();
    }

    const parents = data.filter((c) => !c.parent_id);
    const children = data.filter((c) => !!c.parent_id);

    return parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      image_url: parent.image_url,
      sort_order: parent.sort_order || parent.display_order || 0,
      is_active: parent.is_active,
      show_in_nav: parent.show_in_nav,
      segment: parent.segment || "all",
      children: children
        .filter((child) => child.parent_id === parent.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          image_url: child.image_url,
          sort_order: child.sort_order || child.display_order || 0,
          is_active: child.is_active,
          show_in_nav: child.show_in_nav,
          segment: child.segment || "all",
          children: [],
        })),
    }));
  } catch (err) {
    console.error("getCategoryTreeAdmin error:", err);
    return buildFallbackNavigationTree();
  }
}

export async function upsertCategoryNode(input: CategoryNodeInput) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const parsed = categoryNodeSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const catData = {
      parent_id: parsed.data.parent_id || null,
      name: parsed.data.name,
      slug: parsed.data.slug.toLowerCase().trim(),
      description: parsed.data.description || null,
      image_url: parsed.data.image_url || null,
      sort_order: parsed.data.sort_order,
      display_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
      show_in_nav: parsed.data.show_in_nav,
      segment: parsed.data.segment,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.id) {
      const { data, error } = await supabase
        .from("categories")
        .update(catData)
        .eq("id", parsed.data.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath("/");
      revalidatePath("/collections");
      revalidatePath("/admin/categories");
      revalidatePath("/admin/products");
      return { success: true, category: data };
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert(catData)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath("/");
      revalidatePath("/collections");
      revalidatePath("/admin/categories");
      revalidatePath("/admin/products");
      return { success: true, category: data };
    }
  } catch (err) {
    console.error("upsertCategoryNode error:", err);
    return { success: false, error: "Failed to save category" };
  }
}

export async function deleteCategoryNode(categoryId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) {
      console.error("deleteCategoryNode error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete category" };
  }
}

export async function reorderCategoryNodes(ordered: string[] | { id: string; sort_order: number }[]) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const items = typeof ordered[0] === "string"
      ? (ordered as string[]).map((id, idx) => ({ id, sort_order: idx }))
      : (ordered as { id: string; sort_order: number }[]);

    for (const item of items) {
      await supabase
        .from("categories")
        .update({ sort_order: item.sort_order, display_order: item.sort_order })
        .eq("id", item.id);
    }
    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reorder categories" };
  }
}

// ==========================================
// Catalog Queries
// ==========================================

export async function getCategories() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return data;
  } catch (err) {
    console.warn("Error fetching categories from DB, using fallback:", err);
    return FALLBACK_CATEGORIES;
  }
}

export async function getBanners() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_BANNERS;
    }
    return data;
  } catch (err) {
    console.warn("Error fetching banners from DB, using fallback:", err);
    return FALLBACK_BANNERS;
  }
}

export type ProductListItem = FallbackProduct;
export type ProductWithDetails = FallbackProduct;

export interface GetProductsParams {
  categorySlug?: string;
  segment?: "girls" | "teens" | "women";
  sizeGroup?: "kids" | "teen" | "women";
  sizeName?: string;
  ageSize?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
  isFeatured?: boolean;
  limit?: number;
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductListItem[]> {
  try {
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from("products")
      .select(`
        id,
        category_id,
        segment,
        name,
        slug,
        description,
        fabric,
        lining,
        craft_work,
        set_includes,
        wash_care,
        care_instructions,
        model_height,
        model_size_worn,
        size_chart,
        is_featured,
        created_at,
        categories!inner(id, name, slug, segment, is_active),
        product_variants!inner(
          id,
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
        ),
        product_images(id, image_url, alt_text, display_order, is_primary)
      `)
      .eq("is_active", true)
      .eq("categories.is_active", true)
      .eq("product_variants.is_active", true);

    if (params.categorySlug) {
      const { data: targetCat } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("slug", params.categorySlug)
        .maybeSingle();

      if (targetCat) {
        const { data: childCats } = await supabase
          .from("categories")
          .select("id")
          .eq("parent_id", targetCat.id);
        const allCatIds = [targetCat.id, ...(childCats || []).map((c) => c.id)];
        query = query.in("category_id", allCatIds);
      } else {
        query = query.eq("categories.slug", params.categorySlug);
      }
    }

    if (params.segment) {
      query = query.eq("segment", params.segment);
    }

    if (params.sizeGroup) {
      query = query.eq("product_variants.size_group", params.sizeGroup);
    }

    const targetSize = params.sizeName || params.ageSize;
    if (targetSize) {
      query = query.eq("product_variants.size_name", targetSize);
    }

    if (params.isFeatured) {
      query = query.eq("is_featured", true);
    }

    if (params.sort === "newest") {
      query = query.order("created_at", { ascending: false });
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const results = [...data];
      if (params.sort === "price_asc") {
        results.sort((a, b) => {
          const minA = Math.min(...a.product_variants.map((v) => v.price));
          const minB = Math.min(...b.product_variants.map((v) => v.price));
          return minA - minB;
        });
      } else if (params.sort === "price_desc") {
        results.sort((a, b) => {
          const minA = Math.min(...a.product_variants.map((v) => v.price));
          const minB = Math.min(...b.product_variants.map((v) => v.price));
          return minB - minA;
        });
      }
      return (results as unknown) as ProductListItem[];
    }
  } catch (err) {
    console.warn("Error fetching products from DB, using fallback:", err);
  }

  // Filter fallback catalog
  let filtered = [...FALLBACK_PRODUCTS];
  if (params.categorySlug) {
    filtered = filtered.filter((p) => p.categories.slug === params.categorySlug);
  }
  if (params.segment) {
    filtered = filtered.filter((p) => p.segment === params.segment);
  }
  if (params.sizeGroup) {
    filtered = filtered.filter((p) =>
      p.product_variants.some((v) => v.size_group === params.sizeGroup)
    );
  }
  const targetSize = params.sizeName || params.ageSize;
  if (targetSize) {
    filtered = filtered.filter((p) =>
      p.product_variants.some((v) => v.size_name === targetSize)
    );
  }
  if (params.isFeatured) {
    filtered = filtered.filter((p) => p.is_featured);
  }
  if (params.sort === "price_asc") {
    filtered.sort((a, b) => {
      const minA = Math.min(...a.product_variants.map((v) => v.price));
      const minB = Math.min(...b.product_variants.map((v) => v.price));
      return minA - minB;
    });
  } else if (params.sort === "price_desc") {
    filtered.sort((a, b) => {
      const minA = Math.min(...a.product_variants.map((v) => v.price));
      const minB = Math.min(...b.product_variants.map((v) => v.price));
      return minB - minA;
    });
  }
  if (params.limit) {
    filtered = filtered.slice(0, params.limit);
  }
  return (filtered as unknown) as ProductListItem[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        category_id,
        segment,
        name,
        slug,
        description,
        fabric,
        lining,
        craft_work,
        set_includes,
        wash_care,
        care_instructions,
        model_height,
        model_size_worn,
        size_chart,
        is_featured,
        created_at,
        categories!inner(id, name, slug, segment),
        product_variants(
          id,
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
        ),
        product_images(id, image_url, alt_text, display_order, is_primary)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .eq("categories.is_active", true)
      .single();

    if (!error && data) {
      data.product_variants = (data.product_variants || []).filter((v) => v.is_active);
      data.product_images = (data.product_images || []).sort(
        (a, b) => a.display_order - b.display_order
      );
      return (data as unknown) as ProductWithDetails;
    }
  } catch (err) {
    console.warn("Error fetching product by slug from DB, using fallback:", err);
  }

  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (fallback) {
    return fallback;
  }
  return null;
}

// ==========================================
// Cart Actions (Authenticated & Guest Sync)
// ==========================================

export async function getCart() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      variant_id,
      product_variants!inner(
        id,
        size_age,
        color_name,
        color_hex,
        sku,
        price,
        mrp,
        stock,
        products!inner(
          id,
          name,
          slug,
          lining,
          product_images(image_url, is_primary)
        )
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  return data || [];
}

export async function addToCart(variantId: string, quantity = 1) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to add items to your cart." };
  }

  // Check if item already in cart
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("variant_id", variantId)
    .maybeSingle();

  if (existing) {
    const newQty = existing.quantity + quantity;
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, variant_id: variantId, quantity });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function mergeGuestCartAction(guestItems: Array<{ variant_id: string; quantity: number }>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !guestItems.length) {
    return { success: false };
  }

  const { error } = await supabase.rpc("merge_guest_cart", {
    p_items: guestItems,
  });

  if (error) {
    console.error("Error merging guest cart:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/cart");
  return { success: true };
}

// ==========================================
// Wishlist Actions
// ==========================================

export async function getWishlist() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(`
      id,
      product_id,
      products!inner(
        id,
        name,
        slug,
        fabric,
        lining,
        product_variants(id, size_age, price, mrp, stock),
        product_images(image_url, is_primary)
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }

  return data || [];
}

export async function toggleWishlist(productId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to save favorite dresses." };
  }

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    revalidatePath("/account");
    return { success: true, isFavorited: false };
  } else {
    await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
    revalidatePath("/account");
    return { success: true, isFavorited: true };
  }
}

// ==========================================
// Addresses Actions
// ==========================================

export async function getAddresses() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }

  return data || [];
}

export async function saveAddress(input: AddressInput) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const addr = parsed.data;

  if (addr.id) {
    const { error } = await supabase
      .from("addresses")
      .update({
        name: addr.name,
        phone: addr.phone,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
        is_default: addr.is_default,
      })
      .eq("id", addr.id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      name: addr.name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2,
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/checkout");
  revalidatePath("/account");
  return { success: true };
}

// ==========================================
// Checkout & Orders Actions
// ==========================================

export async function createOrderAction(input: CheckoutInput) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please log in to proceed with checkout." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { items, shipping_address, payment_method } = parsed.data;

  // Invoke atomic stored procedure (handles deadlocks, stock decrement, re-pricing)
  const { data: orderResult, error: orderErr } = await supabase.rpc(
    "create_order_atomic",
    {
      p_items: items,
      p_shipping_address: shipping_address,
      p_payment_method: payment_method,
    }
  );

  if (orderErr) {
    console.error("create_order_atomic error:", orderErr);
    return { success: false, error: orderErr.message };
  }

  revalidatePath("/cart");
  revalidatePath("/account");

  return {
    success: true,
    order: orderResult as {
      order_id: string;
      order_number: string;
      total_amount: number;
      subtotal_amount: number;
      shipping_amount: number;
      payment_method: string;
      status: string;
      expires_at: string | null;
    },
  };
}

export async function getUserOrders() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_amount,
      subtotal_amount,
      shipping_amount,
      payment_method,
      payment_status,
      carrier,
      tracking_number,
      tracking_url,
      estimated_delivery_date,
      created_at,
      order_items(
        id,
        product_name,
        size_age,
        color_name,
        price,
        quantity,
        product_id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data || [];
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        product_name,
        size_age,
        color_name,
        price,
        quantity,
        product_id
      )
    `)
    .eq("order_number", orderNumber)
    .single();

  if (error) return null;
  return data;
}

// ==========================================
// Cashfree Payment Session Creator
// ==========================================

export async function createCashfreeSessionAction(orderId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Fetch order and assert ownership
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, status, payment_status, shipping_address")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderErr || !order) {
    return { success: false, error: "Order not found or access denied." };
  }

  if (order.status === "cancelled") {
    return { success: false, error: "Cannot pay for a cancelled order." };
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENVIRONMENT || "TEST";

  if (!appId || !secretKey) {
    // Return simulated session for testing / sandbox if keys not configured
    return {
      success: true,
      simulated: true,
      payment_session_id: `session_sim_${Date.now()}`,
      order_number: order.order_number,
    };
  }

  const baseUrl =
    env === "PRODUCTION"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

  const orderAmountRupees = (order.total_amount / 100).toFixed(2);
  const shipping = order.shipping_address as { name?: string; phone?: string; email?: string } | null;

  try {
    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: order.order_number,
        order_amount: Number(orderAmountRupees),
        order_currency: "INR",
        customer_details: {
          customer_id: user.id,
          customer_email: user.email || "customer@varnam.com",
          customer_phone: shipping?.phone?.replace(/\D/g, "").slice(-10) || "9876543210",
          customer_name: shipping?.name || "Customer",
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/orders/${order.order_number}?cf_id={order_id}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree API error:", data);
      return { success: false, error: data.message || "Failed to initialize payment session." };
    }

    return {
      success: true,
      payment_session_id: data.payment_session_id,
      order_number: order.order_number,
    };
  } catch (err: unknown) {
    console.error("Cashfree fetch error:", err);
    const errorMsg = err instanceof Error ? err.message : "Network error connecting to payment gateway.";
    return { success: false, error: errorMsg };
  }
}
