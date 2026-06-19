import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  try {
    const { businessId, action } = await req.json();

    if (!businessId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "approve") {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await prisma.business.update({
        where: { id: businessId },
        data: {
          promoStatus: "approved",
          promoApprovedAt: new Date(),
          tier: "standard",
          tierExpiresAt: thirtyDaysFromNow,
        },
      });
    } else if (action === "reject") {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          promoStatus: "rejected",
          promoApprovedAt: null,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin promo error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
