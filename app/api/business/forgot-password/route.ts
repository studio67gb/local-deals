import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerEmail: email.toLowerCase().trim() },
  });

  if (business) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const token = await new SignJWT({ businessId: business.id, purpose: "password_reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret);

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/business/reset-password?token=${token}`;
    
    // In a real app, send an email here.
    // For now, we log it to the console so the user can test the flow.
    console.log("=========================================");
    console.log(`PASSWORD RESET LINK FOR ${email}:`);
    console.log(resetLink);
    console.log("=========================================");
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true });
}
