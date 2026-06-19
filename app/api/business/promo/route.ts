import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBusinessSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getBusinessSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { promoShareUrl } = await req.json();

    if (!promoShareUrl) {
      return NextResponse.json({ error: "Missing promoShareUrl" }, { status: 400 });
    }

    await prisma.business.update({
      where: { id: session.business.id },
      data: {
        promoShareUrl,
        promoStatus: "pending",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Promo submission error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
