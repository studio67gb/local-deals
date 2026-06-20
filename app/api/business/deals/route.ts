import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBusinessSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getBusinessSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Check tier-based deal limits
  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
    include: { deals: { where: { active: true } } },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const tier = business.tier || "free";
  const limits: Record<string, number> = { free: 1, standard: 3, featured: 999 };
  const maxDeals = limits[tier] || 1;
  const activeDeals = business.deals.length;

  if (activeDeals >= maxDeals) {
    return NextResponse.json({
      error: `Your ${tier === "free" ? "Free" : tier === "standard" ? "Standard" : "Featured"} plan allows ${maxDeals} active deal${maxDeals === 1 ? "" : "s"}. Upgrade to add more!`,
      needsUpgrade: true,
      currentTier: tier,
    }, { status: 403 });
  }

  const deal = await prisma.deal.create({
    data: {
      businessId: business.id,
      title: body.title,
      description: body.description,
      offerCode: body.offerCode || null,
      terms: body.terms || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      featured: tier === "featured" ? true : (body.featured || false),
      active: true, // Auto active if created from dashboard? Or pending? Wait, the dashboard edit makes them active? Wait, dashboard created deals should be active.
    },
  });
  return NextResponse.json(deal);
}
