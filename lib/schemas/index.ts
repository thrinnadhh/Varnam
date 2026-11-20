import { z } from "zod";

// ==========================================
// Age & Sizing Constants
// ==========================================
export const AGE_SIZES = [
  "2-3Y",
  "4-5Y",
  "6-7Y",
  "8-9Y",
  "10-11Y",
  "12-14Y",
] as const;

export type AgeSize = (typeof AGE_SIZES)[number];

// ==========================================
// Customer Address Schema
// ==========================================
export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  address_line1: z.string().min(5, "Address must be at least 5 characters").max(200),
  address_line2: z.string().max(200).optional().nullable(),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  state: z.string().min(2, "State must be at least 2 characters").max(100),
  postal_code: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit Indian PIN code"),
  country: z.string().default("India"),
  is_default: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ==========================================
// Cart Item Schemas
// ==========================================
export const cartItemSchema = z.object({
  variant_id: z.string().uuid("Invalid variant ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum 10 items allowed per SKU"),
});

export const guestCartItemSchema = z.object({
  variant_id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_slug: z.string(),
  size_age: z.string(),
  color_name: z.string(),
  price: z.number().int(), // in paise
  mrp: z.number().int(),   // in paise
  image_url: z.string(),
  quantity: z.number().int().min(1).max(10),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type GuestCartItem = z.infer<typeof guestCartItemSchema>;

// ==========================================
// Checkout & Order Creation Schemas
// ==========================================
export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  shipping_address: addressSchema,
  payment_method: z.enum(["cashfree", "cod"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ==========================================
// Admin Order Update Schema (Strict Field Boundary)
// ==========================================
// ONLY permits status and tracking mutations. Modifying price/totals/user is strictly disallowed!
export const adminOrderUpdateSchema = z.object({
  order_id: z.string().uuid("Invalid order ID"),
  status: z
    .enum(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"])
    .optional(),
  carrier: z.string().max(100).optional().nullable(),
  tracking_number: z.string().max(100).optional().nullable(),
  tracking_url: z.string().url("Must be a valid URL").optional().nullable(),
  estimated_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD").optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;

// ==========================================
// Admin Product & Variant Schemas
// ==========================================
export const sizeChartRowSchema = z.object({
  age: z.string(),
  chest: z.string(),
  length: z.string(),
  waist: z.string(),
});

export const productVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  size_age: z.enum(AGE_SIZES),
  color_name: z.string().min(1, "Color name required"),
  color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be valid 6-character hex (e.g. #881337)"),
  sku: z.string().min(3, "SKU must be at least 3 characters").max(50),
  price: z.number().int().min(0, "Price in paise must be non-negative"),
  mrp: z.number().int().min(0, "MRP in paise must be non-negative"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  is_active: z.boolean().default(true),
});

export const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid("Category required"),
  name: z.string().min(3, "Product name must be at least 3 characters").max(200),
  slug: z.string().min(3).max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fabric: z.string().min(2, "Fabric details required"),
  lining: z.string().min(2, "Inner lining details required (e.g. 100% Breathable Cotton)"), // Mandatory
  care_instructions: z.string().min(2, "Care instructions required"),
  size_chart: z.array(sizeChartRowSchema).optional().nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  variants: z.array(productVariantInputSchema).min(1, "At least one variant required"),
  images: z
    .array(
      z.object({
        image_url: z.string().url("Valid image URL required"),
        alt_text: z.string(),
        display_order: z.number().int().default(0),
        is_primary: z.boolean().default(false),
      })
    )
    .min(1, "At least one product image required"),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
