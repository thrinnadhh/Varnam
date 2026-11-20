"use server";

import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/db/supabase";
import type { Database } from "@/types/db";
import {
  adminOrderUpdateSchema,
  productInputSchema,
  type AdminOrderUpdateInput,
  type ProductInput,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
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

  if (!profile || profile.role !== "admin") {
    throw new Error("Access denied: Administrator privileges required.");
  }

  return { user, supabase };
}

// ==========================================
// Admin Metrics Dashboard
// ==========================================

export async function getAdminMetrics() {
  const { supabase } = await assertAdmin();

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
  const { supabase } = await assertAdmin();

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
  const { supabase } = await assertAdmin();

  const parsed = adminOrderUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
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
  const { supabase } = await assertAdmin();

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
  const { supabase } = await assertAdmin();

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
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
