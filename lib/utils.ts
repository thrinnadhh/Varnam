import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer paise into human-readable Indian Rupee string
 * e.g. 249900 -> "₹2,499"
 */
export function formatPrice(paise: number): string {
  const rupees = Math.round(paise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Calculate discount percentage between MRP and selling price
 */
export function calculateDiscount(pricePaise: number, mrpPaise: number): number {
  if (!mrpPaise || mrpPaise <= pricePaise) return 0;
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}

/**
 * Format ISO timestamp to readable Indian date
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Validate that a redirect URL is strictly an internal, same-origin relative path.
 * Prevents open-redirect vulnerabilities.
 */
export function getSafeRedirectUrl(target: string | null | undefined, fallback = "/account"): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  // Must start with single '/' and must NOT start with '//' or contain '\'
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    try {
      const parsed = new URL(trimmed, "http://localhost");
      if (parsed.origin === "http://localhost") {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      return fallback;
    }
  }
  return fallback;
}
