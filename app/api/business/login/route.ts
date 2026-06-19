import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const business = await prisma.business.findFirst({
    where: { ownerEmail: email.toLowerCase().trim() },
  });

  if (!business || !business.ownerPassword) {
    return NextResponse.json({ error: "No account found with that email" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, business.ownerPassword);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Create session token
  const session = await prisma.businessSession.create({
    data: { businessId: business.id },
  });

  const res = NextResponse.json({ ok: true, businessId: business.id });
  res.cookies.set("biz_session", session.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
  });
  return res;
}
