// ==============================================================================
// Varnam Storefront Operational & Policy Constants
// All terms marked [OWNER TO CONFIRM] are placeholders awaiting merchant sign-off.
// ==============================================================================

export const POLICY_CONFIG = {
  // Free Shipping Threshold (in paise)
  // [OWNER TO CONFIRM: Free Shipping Threshold]
  FREE_SHIPPING_THRESHOLD_PAISE: 99900,
  FREE_SHIPPING_THRESHOLD_RUPEES: 999,
  FREE_SHIPPING_THRESHOLD_LABEL: "[OWNER TO CONFIRM: ₹999]",

  // Flat Standard Shipping Fee (in paise)
  // [OWNER TO CONFIRM: Flat Shipping Fee]
  STANDARD_SHIPPING_FEE_PAISE: 9900,
  STANDARD_SHIPPING_FEE_RUPEES: 99,
  STANDARD_SHIPPING_FEE_LABEL: "[OWNER TO CONFIRM: ₹99]",

  // Dispatch & Tailoring Turnaround
  // [OWNER TO CONFIRM: Dispatch Window]
  DISPATCH_TIMELINE: "[OWNER TO CONFIRM: 24–48 Business Hours]",
  DISPATCH_BADGE: "[OWNER TO CONFIRM: Fast Dispatch]",

  // Logistics & Courier Partners
  // [OWNER TO CONFIRM: Courier Partners]
  COURIER_PARTNERS: "[OWNER TO CONFIRM: Blue Dart / Delhivery / DTDC / Speed Post]",
  COURIER_AIR_EXPRESS: "[OWNER TO CONFIRM: Express Air Courier]",
  COURIER_SURFACE_EXPRESS: "[OWNER TO CONFIRM: Express Surface Courier]",
  COURIER_POSTAL: "[OWNER TO CONFIRM: National Postal / Surface Courier]",

  // Exchange & Return Policy Window
  // [OWNER TO CONFIRM: Return & Size Exchange Window]
  EXCHANGE_RETURN_WINDOW: "[OWNER TO CONFIRM: 7-Day Doorstep Size Exchange]",
  EXCHANGE_RETURN_DAYS: "[OWNER TO CONFIRM: 7 Days]",
  RETURN_PICKUP_TIMELINE: "[OWNER TO CONFIRM: 24–48 Hours]",
  REFUND_CREDIT_TIMELINE: "[OWNER TO CONFIRM: 5–7 Business Days]",
} as const;
