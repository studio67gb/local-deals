import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD || "Doncaster2026!";
  if (password !== correct) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  
  const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "fallback_secret_do_not_use_in_prod");
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/", sameSite: "lax",
  });
  return res;
}
