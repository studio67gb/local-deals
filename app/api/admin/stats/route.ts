import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [businesses, deals, claimsToday, pending] = await Promise.all([
    prisma.business.count({ where: { active: true, status: "active" } }),
    prisma.deal.count({ where: { active: true } }),
    prisma.claim.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.business.count({ where: { status: "pending" } }),
  ]);

  return NextResponse.json({ businesses, deals, claimsToday, pending });
}
