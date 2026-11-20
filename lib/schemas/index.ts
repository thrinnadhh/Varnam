import { z } from "zod";

// ==========================================
// Segment & Sizing Constants
// ==========================================
export const SEGMENTS = ["girls", "teens", "women"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const SIZE_GROUPS = ["kids", "teen", "women"] as const;
export type SizeGroup = (typeof SIZE_GROUPS)[number];

export const MEASUREMENT_TYPES = ["garment", "body"] as const;
export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

// Non-overlapping distinct demographic size milestones
// Girls: 2–12Y
export const KIDS_AGE_SIZES = [
  "2-3Y",
  "4-5Y",
  "6-7Y",
  "8-9Y",
  "10-11Y",
  "12Y",
] as const;

// Teens: 13–18Y & Youth Alphas
export const TEEN_SIZES = [
  "13-14Y",
  "15-16Y",
  "17-18Y",
  "XS",
  "S",
  "M",
] as const;

// Women: Adult Alphas & Free Size
export const WOMEN_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Free Size",
] as const;

export const NUMERIC_SIZES = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
] as const;

export const ALL_SIZES = [
  ...KIDS_AGE_SIZES,
  ...TEEN_SIZES,
  ...WOMEN_SIZES,
  ...NUMERIC_SIZES,
] as const;

// Backward compatible export
export const AGE_SIZES = KIDS_AGE_SIZES;
export type AgeSize = (typeof KIDS_AGE_SIZES)[number];

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
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(10, "Maximum 10 items allowed per SKU"),
});

export const guestCartItemSchema = z.object({
  variant_id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_slug: z.string(),
  size_name: z.string(),
  size_age: z.string().optional(),
  color_name: z.string(),
  price: z.number().int().min(0),
  mrp: z.number().int().min(0),
  image_url: z.string().url(),
  quantity: z.number().int().min(1).max(10),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type GuestCartItem = z.infer<typeof guestCartItemSchema>;

// ==========================================
// Checkout Schemas
// ==========================================
export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Your cart is empty"),
  shipping_address: addressSchema,
  payment_method: z.enum(["cashfree", "cod"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ==========================================
// Admin Order Status Update Schema
// ==========================================
export const adminOrderUpdateSchema = z.object({
  order_id: z.string().uuid("Valid order ID required"),
  status: z
    .enum(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"])
    .optional(),
  carrier: z.string().max(100).optional(),
  tracking_number: z.string().max(100).optional(),
  tracking_url: z.string().url("Valid tracking URL required").optional().or(z.literal("")),
  estimated_delivery_date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;

// ==========================================
// Catalog Product & Variant Schemas (Multi-Segment)
// ==========================================
export const sizeChartRowSchema = z.object({
  size: z.string(),
  bust_in: z.number().optional(),
  bust_cm: z.number().optional(),
  waist_in: z.number().optional(),
  waist_cm: z.number().optional(),
  hip_in: z.number().optional(),
  hip_cm: z.number().optional(),
  length_in: z.number().optional(),
  length_cm: z.number().optional(),
  measurement_type: z.enum(MEASUREMENT_TYPES).optional(),
  // For backwards compatibility with legacy strings
  chest: z.string().optional(),
  waist: z.string().optional(),
  length: z.string().optional(),
});

export const productVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  size_group: z.enum(SIZE_GROUPS),
  size_name: z.string().min(1, "Size name required"),
  size_age: z.string().optional(),
  bust_inches: z.number().optional().nullable(),
  bust_cm: z.number().optional().nullable(),
  waist_inches: z.number().optional().nullable(),
  waist_cm: z.number().optional().nullable(),
  hip_inches: z.number().optional().nullable(),
  hip_cm: z.number().optional().nullable(),
  length_inches: z.number().optional().nullable(),
  length_cm: z.number().optional().nullable(),
  color_name: z.string().min(1, "Color name required"),
  color_hex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be valid 6-character hex (e.g. #881337)"),
  sku: z.string().min(3, "SKU must be at least 3 characters").max(50),
  price: z.number().int().min(0, "Price in paise must be non-negative"),
  mrp: z.number().int().min(0, "MRP in paise must be non-negative"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  is_active: z.boolean().default(true),
});

export const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid("Category required"),
  segment: z.enum(SEGMENTS),
  name: z.string().min(3, "Product name must be at least 3 characters").max(200),
  slug: z.string().min(3).max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fabric: z.string().min(2, "Fabric details required"),
  lining: z.string().min(2, "Inner lining details required (e.g. 100% Breathable Cotton)"), // Mandatory
  care_instructions: z.string().min(2, "Care instructions required"),
  measurement_type: z.enum(MEASUREMENT_TYPES).default("garment"),
  model_height: z.string().optional().nullable(),
  model_size_worn: z.string().optional().nullable(),
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
