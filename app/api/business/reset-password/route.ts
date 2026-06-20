import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);

    if (payload.purpose !== "password_reset" || !payload.businessId) {
      throw new Error("Invalid token purpose");
    }

    const businessId = payload.businessId as number;

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.business.update({
      where: { id: businessId },
      data: { ownerPassword: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired reset token. Please request a new link." }, { status: 400 });
  }
}
