import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
