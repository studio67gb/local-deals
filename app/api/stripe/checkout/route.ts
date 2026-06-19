import { NextRequest, NextResponse } from "next/server";
import { stripe, getPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { businessId, tier } = await req.json();

    if (!businessId || !tier || !["standard", "featured"].includes(tier)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const priceId = getPriceId(tier);
    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Create or reuse Stripe customer
    let customerId = business.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.ownerEmail || business.email || undefined,
        name: business.name,
        metadata: { businessId: String(businessId) },
      });
      customerId = customer.id;
      await prisma.business.update({
        where: { id: businessId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://local-deals.uk"}/business/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://local-deals.uk"}/pricing?cancelled=true`,
      metadata: { businessId: String(businessId), tier },
      subscription_data: {
        metadata: { businessId: String(businessId), tier },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
