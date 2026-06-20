import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

// Simple admin cookie check helper
export async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "fallback_secret_do_not_use_in_prod");
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  if (!(await isAdminAuthed(req))) {
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
  if (!session) return null;
  // Expire after 7 days
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - new Date(session.createdAt).getTime() > MAX_AGE) {
    await prisma.businessSession.delete({ where: { id: token } }).catch(() => {});
    return null;
  }
  return session;
}
