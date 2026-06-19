import { NextRequest, NextResponse } from "next/server";
import { getBusinessSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Update a deal — only if it belongs to the logged-in business
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getBusinessSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const dealId = parseInt(id);

  // Verify the deal belongs to this business
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.businessId !== session.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: {
      title: body.title ?? deal.title,
      description: body.description ?? deal.description,
      offerCode: body.offerCode !== undefined ? body.offerCode || null : deal.offerCode,
      terms: body.terms !== undefined ? body.terms || null : deal.terms,
      expiresAt: body.expiresAt !== undefined
        ? (body.expiresAt ? new Date(body.expiresAt) : null)
        : deal.expiresAt,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getBusinessSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const dealId = parseInt(id);

  // Verify the deal belongs to this business
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.businessId !== session.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.deal.delete({ where: { id: dealId } });
  return NextResponse.json({ success: true });
}
