"use server";

import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";
import {
  adminOrderUpdateSchema,
  productInputSchema,
  bannerSchema,
  couponSchema,
  type AdminOrderUpdateInput,
  type ProductInput,
  type BannerInput,
  type CouponInput,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import {
  FALLBACK_PRODUCTS,
  FALLBACK_HERO_BANNERS,
} from "@/lib/db/fallback-data";

async function assertAdmin() {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("varnam_demo_role")?.value;
    if (demoRole === "admin") {
      return {
        user: { id: "demo-admin-id", email: "admin@varnam.luxury" },
        supabase: null as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>,
        isDemo: true,
      };
    }
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.role !== "admin" &&
      user.email?.toLowerCase() !== "mahalakshmipulluru@gmail.com")
  ) {
    throw new Error("Access denied: Administrator privileges required.");
  }

  return { user, supabase, isDemo: false };
}

// ==========================================
// Admin Metrics Dashboard
// ==========================================

export async function getAdminMetrics() {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    return {
      totalRevenuePaise: 42890000, // ₹4,28,900
      totalOrders: 38,
      pendingOrders: 3,
      totalProducts: 12,
      lowStockVariants: 2,
      lowStockList: [
        {
          id: "demo-var-1",
          sku: "VAR-MPP-CRIM-4Y",
          stock: 2,
          size_age: "4-5 Years",
          size_name: "4-5Y",
          products: { name: "Maharani Pattu Pavadai" },
        },
        {
          id: "demo-var-2",
          sku: "VAR-ASA-BLUE-6Y",
          stock: 3,
          size_age: "6-7 Years",
          size_name: "6-7Y",
          products: { name: "Ayodhya Silk Anarkali Gown" },
        },
      ],
    };
  }

  // 1. Total revenue from confirmed/delivered/paid orders
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .in("payment_status", ["paid"]);

  const totalRevenuePaise = (paidOrders || []).reduce(
    (acc, o) => acc + (o.total_amount || 0),
    0
  );

  // 2. Orders count
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed", "packed"]);

  // 3. Products count
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // 4. Low stock variants (< 5 units)
  const { data: lowStockVariants } = await supabase
    .from("product_variants")
    .select("id, sku, stock, size_age, size_name, products(name)")
    .lt("stock", 5)
    .eq("is_active", true)
    .limit(10);

  return {
    totalRevenuePaise,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    totalProducts: totalProducts || 0,
    lowStockVariants: (lowStockVariants || []).length,
    lowStockList: lowStockVariants || [],
  };
}

// ==========================================
// Admin Orders Management
// ==========================================

export async function getAdminOrders(statusFilter?: string) {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    const list = [
      {
        id: "demo-ord-1",
        order_number: "VARNAM-2024-8842",
        user_id: "demo-customer-1",
        status: "confirmed",
        payment_method: "prepaid_upi",
        payment_status: "paid",
        total_amount: 389900,
        carrier: "BlueDart Express",
        tracking_number: "BD983248102IN",
        tracking_url: "https://www.bluedart.com",
        shipping_address: {
          name: "Ananya Sharma",
          city: "Bengaluru",
          state: "Karnataka",
        },
        notes: "Gift packaging with hand-embroidered blessing card requested",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        order_items: [
          {
            id: "item-1",
            product_name: "Maharani Pattu Pavadai - Pure Kanjeevaram Silk",
            size_name: "4-5Y",
            size_age: "4-5 Years",
            color_name: "Sindhoori Crimson & Mustard Gold",
            quantity: 1,
            price: 389900,
          },
        ],
      },
      {
        id: "demo-ord-2",
        order_number: "VARNAM-2024-8841",
        user_id: "demo-customer-2",
        status: "pending",
        payment_method: "cashfree",
        payment_status: "paid",
        total_amount: 549800,
        carrier: null,
        tracking_number: null,
        tracking_url: null,
        shipping_address: {
          name: "Dr. Priyamvada Rao",
          city: "Hyderabad",
          state: "Telangana",
        },
        notes: "Urgent wedding dispatch for upcoming auspicious muhurtham",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        order_items: [
          {
            id: "item-2",
            product_name: "Devi Kasavu Temple Twirl",
            size_name: "3-4Y",
            size_age: "3-4 Years",
            color_name: "Off-White & Temple Gold",
            quantity: 2,
            price: 274900,
          },
        ],
      },
      {
        id: "demo-ord-3",
        order_number: "VARNAM-2024-7621",
        user_id: "demo-customer-1",
        status: "delivered",
        payment_method: "cashfree",
        payment_status: "paid",
        total_amount: 249900,
        carrier: "Delhivery Surface",
        tracking_number: "DEL1298471203",
        tracking_url: "https://www.delhivery.com",
        shipping_address: {
          name: "Ananya Sharma",
          city: "Bengaluru",
          state: "Karnataka",
        },
        notes: null,
        created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        order_items: [
          {
            id: "item-3",
            product_name: "Ayodhya Silk Anarkali Gown",
            size_name: "6-7Y",
            size_age: "6-7 Years",
            color_name: "Peacock Blue",
            quantity: 1,
            price: 249900,
          },
        ],
      },
    ];

    if (statusFilter && statusFilter !== "all") {
      return list.filter((o) => o.status === statusFilter);
    }
    return list;
  }

  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      user_id,
      status,
      payment_method,
      payment_status,
      total_amount,
      carrier,
      tracking_number,
      tracking_url,
      shipping_address,
      notes,
      created_at,
      order_items(
        id,
        product_name,
        size_name,
        size_age,
        color_name,
        quantity,
        price
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching admin orders:", error);
    return [];
  }

  return data || [];
}

export async function updateAdminOrderStatus(input: AdminOrderUpdateInput) {
  const { supabase, isDemo } = await assertAdmin();

  const parsed = adminOrderUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isDemo || !supabase) {
    revalidatePath("/admin/orders");
    revalidatePath("/account");
    return { success: true };
  }

  const { order_id, status, carrier, tracking_number, tracking_url, estimated_delivery_date, notes } = parsed.data;

  // STRICT COLUMN BOUNDARY: Only update status and tracking metadata.
  // Never touch totals, items, or user_id!
  const updatePayload: Database["public"]["Tables"]["orders"]["Update"] = {};

  if (status) updatePayload.status = status;
  if (carrier !== undefined) updatePayload.carrier = carrier;
  if (tracking_number !== undefined) updatePayload.tracking_number = tracking_number;
  if (tracking_url !== undefined) updatePayload.tracking_url = tracking_url;
  if (estimated_delivery_date !== undefined) updatePayload.estimated_delivery_date = estimated_delivery_date;
  if (notes !== undefined) updatePayload.notes = notes;

  if (status === "delivered") {
    updatePayload.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", order_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account");
  return { success: true };
}

// ==========================================
// Admin Products & Variants CRUD
// ==========================================

export async function getAdminProducts() {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    return FALLBACK_PRODUCTS.map((p) => ({
      id: p.id,
      segment: p.segment || "girls",
      name: p.name,
      slug: p.slug,
      fabric: p.fabric || "Pure Mulberry Silk",
      lining: p.lining || "100% Breathable Mulmul Cotton",
      model_height: p.model_height || "105 cm",
      model_size_worn: p.model_size_worn || "4-5Y",
      is_active: true,
      is_featured: p.is_featured,
      created_at: p.created_at || new Date().toISOString(),
      categories: { name: p.categories?.name || "Pattu Pavadai" },
      product_variants: (p.product_variants || []).map((v) => ({
        id: v.id,
        size_group: v.size_group,
        size_name: v.size_name,
        size_age: v.size_age,
        color_name: v.color_name,
        sku: v.sku,
        price: v.price,
        mrp: v.mrp,
        stock: v.stock,
        is_active: v.is_active,
      })),
      product_images: (p.product_images || []).map((img) => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
      })),
    }));
  }

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      segment,
      name,
      slug,
      fabric,
      lining,
      model_height,
      model_size_worn,
      is_active,
      is_featured,
      created_at,
      categories(name),
      product_variants(id, size_group, size_name, size_age, color_name, sku, price, mrp, stock, is_active),
      product_images(image_url, is_primary)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin products:", error);
    return [];
  }

  return data || [];
}

export async function createAdminProduct(input: ProductInput) {
  const { supabase, isDemo } = await assertAdmin();

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isDemo || !supabase) {
    revalidatePath("/admin/products");
    revalidatePath("/collections");
    return { success: true, productId: "demo-created-product" };
  }

  const p = parsed.data;

  // 1. Insert product
  const { data: product, error: prodErr } = await supabase
    .from("products")
    .insert({
      category_id: p.category_id,
      segment: p.segment,
      name: p.name,
      slug: p.slug,
      description: p.description,
      fabric: p.fabric,
      lining: p.lining, // Mandatory explicit declaration!
      craft_work: p.craft_work,
      set_includes: p.set_includes,
      wash_care: p.wash_care,
      care_instructions: p.care_instructions,
      model_height: p.model_height,
      model_size_worn: p.model_size_worn,
      size_chart: p.size_chart,
      is_active: p.is_active,
      is_featured: p.is_featured,
    })
    .select()
    .single();

  if (prodErr || !product) {
    return { success: false, error: prodErr?.message || "Failed to create product" };
  }

  // 2. Insert variants
  const variantsToInsert = p.variants.map((v) => ({
    product_id: product.id,
    size_group: v.size_group,
    size_name: v.size_name,
    size_age: v.size_age || v.size_name,
    bust_inches: v.bust_inches,
    bust_cm: v.bust_cm,
    waist_inches: v.waist_inches,
    waist_cm: v.waist_cm,
    hip_inches: v.hip_inches,
    hip_cm: v.hip_cm,
    length_inches: v.length_inches,
    length_cm: v.length_cm,
    color_name: v.color_name,
    color_hex: v.color_hex,
    sku: v.sku,
    price: v.price,
    mrp: v.mrp,
    stock: v.stock,
    is_active: v.is_active,
  }));

  const { error: variantErr } = await supabase
    .from("product_variants")
    .insert(variantsToInsert);

  if (variantErr) {
    return { success: false, error: variantErr.message };
  }

  // 3. Insert images
  const imagesToInsert = p.images.map((img) => ({
    product_id: product.id,
    image_url: img.image_url,
    alt_text: img.alt_text || p.name,
    display_order: img.display_order,
    is_primary: img.is_primary,
  }));

  const { error: imgErr } = await supabase
    .from("product_images")
    .insert(imagesToInsert);

  if (imgErr) {
    return { success: false, error: imgErr.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/collections");
  return { success: true, productId: product.id };
}

// ==========================================
// Admin Banners CRUD
// ==========================================
export async function getAdminBanners() {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    return FALLBACK_HERO_BANNERS.map((b) => ({
      id: b.id,
      eyebrow_text: b.eyebrow_text,
      title: b.title,
      subtitle: b.subtitle,
      cta_label: b.cta_label,
      cta_href: b.cta_href,
      desktop_image_url: b.desktop_image_url,
      mobile_image_url: b.mobile_image_url,
      sort_order: b.sort_order,
      is_active: b.is_active,
      created_at: new Date().toISOString(),
    }));
  }

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
  return data || [];
}

export async function saveAdminBanner(input: BannerInput) {
  const { supabase, isDemo } = await assertAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isDemo || !supabase) {
    revalidatePath("/");
    revalidatePath("/admin/merchandising");
    return { success: true };
  }

  const { id, ...payload } = parsed.data;
  if (id) {
    const { error } = await supabase.from("banners").update(payload).eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("banners").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/merchandising");
  return { success: true };
}

export async function deleteAdminBanner(id: string) {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    revalidatePath("/");
    revalidatePath("/admin/merchandising");
    return { success: true };
  }

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/merchandising");
  return { success: true };
}

// ==========================================
// Admin Coupons CRUD
// ==========================================
export async function getAdminCoupons() {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    return [
      {
        id: "demo-coup-1",
        code: "NAMASTE10",
        discount_type: "percentage",
        discount_value: 10,
        min_order_amount: 199900,
        max_discount: 50000,
        usage_limit: 1000,
        used_count: 142,
        is_active: true,
        expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "demo-coup-2",
        code: "DIWALI500",
        discount_type: "fixed",
        discount_value: 50000,
        min_order_amount: 299900,
        max_discount: 50000,
        usage_limit: 500,
        used_count: 89,
        is_active: true,
        expires_at: new Date(Date.now() + 86400000 * 60).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
  return data || [];
}

export async function saveAdminCoupon(input: CouponInput) {
  const { supabase, isDemo } = await assertAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isDemo || !supabase) {
    revalidatePath("/admin/merchandising");
    return { success: true };
  }

  const { id, code, ...payload } = parsed.data;
  const upperCode = code.trim().toUpperCase();

  if (id) {
    const { error } = await supabase
      .from("coupons")
      .update({ code: upperCode, ...payload })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("coupons")
      .insert({ code: upperCode, ...payload });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/admin/merchandising");
  return { success: true };
}

export async function deleteAdminCoupon(id: string) {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    revalidatePath("/admin/merchandising");
    return { success: true };
  }

  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/merchandising");
  return { success: true };
}

// ==========================================
// Admin Customers & Inventory Audit Log
// ==========================================
export async function getAdminCustomers() {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    return [
      {
        id: "demo-cust-1",
        email: "ananya.parent@varnam.luxury",
        full_name: "Ananya Sharma",
        phone: "+91 98765 43210",
        role: "customer",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        total_orders: 2,
        total_spend_paise: 639800,
        zari_points: 639,
      },
      {
        id: "demo-cust-2",
        email: "priyamvada.rao@hyderabad.org",
        full_name: "Dr. Priyamvada Rao",
        phone: "+91 98112 23344",
        role: "customer",
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        total_orders: 1,
        total_spend_paise: 549800,
        zari_points: 549,
      },
      {
        id: "demo-admin-cust",
        email: "admin@varnam.luxury",
        full_name: "Varnam Head of Atelier",
        phone: "+91 99000 11223",
        role: "admin",
        created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
        total_orders: 0,
        total_spend_paise: 0,
        zari_points: 0,
      },
    ];
  }

  // Fetch profiles with order count and spend aggregation
  const [{ data: profiles, error: pError }, { data: orders, error: oError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, phone, role, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, user_id, total_amount, payment_status, status"),
  ]);

  if (pError || oError) {
    console.error("Error fetching admin customers:", pError || oError);
    return [];
  }

  const ordersByUser = new Map<string, Array<{ id: string; total_amount: number; payment_status: string }>>();
  for (const order of orders || []) {
    const list = ordersByUser.get(order.user_id) || [];
    list.push(order);
    ordersByUser.set(order.user_id, list);
  }

  return (profiles || []).map((p) => {
    const userOrders = ordersByUser.get(p.id) || [];
    const paidOrders = userOrders.filter((o) => o.payment_status === "paid");
    const totalSpendPaise = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name || "Guest Parent",
      phone: p.phone || "Not provided",
      role: p.role,
      created_at: p.created_at,
      total_orders: userOrders.length,
      total_spend_paise: totalSpendPaise,
      zari_points: Math.floor(totalSpendPaise / 1000), // 1 point per ₹10 spent
    };
  });
}

export async function getInventoryAuditLogs() {
  const { supabase, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    return [
      {
        id: "demo-log-1",
        variant_id: "demo-var-1",
        event_type: "karigar_restock",
        quantity_change: 15,
        previous_stock: 5,
        new_stock: 20,
        reference_id: "BATCH-KANCHI-2024-B",
        operator: "Mahalakshmi (Head Karigar)",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        product_variants: {
          sku: "VAR-MPP-CRIM-4Y",
          size_name: "4-5Y",
          size_age: "4-5 Years",
          color_name: "Sindhoori Crimson",
          products: { name: "Maharani Pattu Pavadai" },
        },
      },
      {
        id: "demo-log-2",
        variant_id: "demo-var-2",
        event_type: "order_fulfillment",
        quantity_change: -1,
        previous_stock: 6,
        new_stock: 5,
        reference_id: "ORDER-VARNAM-2024-8842",
        operator: "Fulfillment System",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        product_variants: {
          sku: "VAR-MPP-CRIM-4Y",
          size_name: "4-5Y",
          size_age: "4-5 Years",
          color_name: "Sindhoori Crimson",
          products: { name: "Maharani Pattu Pavadai" },
        },
      },
    ];
  }

  const { data, error } = await supabase
    .from("inventory_audit_log")
    .select(`
      id,
      variant_id,
      event_type,
      quantity_change,
      previous_stock,
      new_stock,
      reference_id,
      operator,
      created_at,
      product_variants(
        sku,
        size_name,
        size_age,
        color_name,
        products(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching inventory audit log:", error);
    return [];
  }
  return data || [];
}

export async function batchRestockVariants(
  adjustments: { variant_id: string; additional_stock: number; reference_id?: string }[]
) {
  const { supabase, user, isDemo } = await assertAdmin();

  if (isDemo || !supabase) {
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/admin/customers");
    return { success: true };
  }

  for (const adj of adjustments) {
    if (adj.additional_stock <= 0) continue;

    // Fetch current stock
    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", adj.variant_id)
      .single();

    if (!variant) continue;

    const previousStock = variant.stock;
    const newStock = previousStock + adj.additional_stock;

    await supabase
      .from("product_variants")
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq("id", adj.variant_id);

    // Record audit log
    await supabase.from("inventory_audit_log").insert({
      variant_id: adj.variant_id,
      event_type: "karigar_restock",
      quantity_change: adj.additional_stock,
      previous_stock: previousStock,
      new_stock: newStock,
      reference_id: adj.reference_id || "RAPID-RESTOCK-BATCH",
      operator: user.email || "Admin Operator",
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  return { success: true };
}
