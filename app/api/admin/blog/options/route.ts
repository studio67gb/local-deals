import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const businesses = await prisma.business.findMany({
      where: { active: true },
      select: { id: true, name: true, deals: { select: { id: true, title: true, active: true } } },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 });
  }
}
