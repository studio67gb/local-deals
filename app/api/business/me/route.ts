import { NextRequest, NextResponse } from "next/server";
import { getBusinessSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getBusinessSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { business } = session;
  // Never return the hashed password
  const { ownerPassword: _, ...safe } = business as typeof business & { ownerPassword?: string };
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  // Logout
  const res = NextResponse.json({ ok: true });
  res.cookies.set("biz_session", "", { maxAge: 0, path: "/" });
  return res;
}
