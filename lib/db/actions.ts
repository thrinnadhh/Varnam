"use server";

import { createServerSupabaseClient } from "./supabase";
import { checkoutSchema, addressSchema, type CheckoutInput, type AddressInput } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import {
  FALLBACK_CATEGORIES,
  FALLBACK_BANNERS,
  FALLBACK_PRODUCTS,
  type FallbackProduct,
} from "./fallback-data";

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
      query = query.eq("categories.slug", params.categorySlug);
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
