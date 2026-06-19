import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action } = await req.json(); // "approve" | "reject"

  const business = await prisma.business.update({
    where: { id: parseInt(id) },
    data: {
      status: action === "approve" ? "active" : "rejected",
      active: action === "approve",
    },
  });

  // Also activate their deals if approving
  if (action === "approve") {
    await prisma.deal.updateMany({
      where: { businessId: business.id },
      data: { active: true },
    });
  }

  return NextResponse.json(business);
}
