import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Simple admin cookie check helper
export function isAdminAuthed(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "authenticated";
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Business session helpers
export async function getBusinessSession(req: NextRequest) {
  const token = req.cookies.get("biz_session")?.value;
  if (!token) return null;
  const session = await prisma.businessSession.findUnique({
    where: { id: token },
    include: {
      business: {
        include: {
          deals: {
            where: { active: true },
            orderBy: { featured: "desc" },
          },
        },
      },
    },
  });
  return session;
}
