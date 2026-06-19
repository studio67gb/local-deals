import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const businesses = await prisma.business.findMany({
    where: { active: true, status: "active" },
    select: {
      id: true, name: true, category: true, area: true,
      address: true, lat: true, lng: true,
      deals: {
        where: { active: true },
        select: { id: true, title: true, claimCount: true },
        take: 1,
        orderBy: { featured: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(businesses);
}
