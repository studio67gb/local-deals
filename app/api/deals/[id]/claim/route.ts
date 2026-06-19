import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dealId = parseInt(id);
  await prisma.claim.create({ data: { dealId } });
  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: { claimCount: { increment: 1 } },
  });
  return NextResponse.json({ claimCount: deal.claimCount });
}
