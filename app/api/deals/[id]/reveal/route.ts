import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id: parseInt(id) },
    select: { offerCode: true },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json({ offerCode: deal.offerCode });
}
