import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-05-27.dahlia" as any, 
});

export const TIER_LIMITS: Record<string, number> = {
  free: 1,
  standard: 3,
  featured: 999, // effectively unlimited
};

export function getPriceId(tier: string): string | null {
  switch (tier) {
    case "standard":
      return process.env.STRIPE_PRICE_STANDARD || null;
    case "featured":
      return process.env.STRIPE_PRICE_FEATURED || null;
    default:
      return null;
  }
}

export function getTierLabel(tier: string): string {
  switch (tier) {
    case "standard": return "Standard";
    case "featured": return "Featured";
    default: return "Free";
  }
}

export function getTierPrice(tier: string): string {
  switch (tier) {
    case "standard": return "£5";
    case "featured": return "£15";
    default: return "Free";
  }
}
