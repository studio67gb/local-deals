import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const dealId = parseInt(id);

  try {
    await prisma.deal.delete({ where: { id: dealId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Deal not found or already deleted" }, { status: 404 });
  }
}
