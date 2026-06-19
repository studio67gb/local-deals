import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://local-deals.uk"}/business/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
