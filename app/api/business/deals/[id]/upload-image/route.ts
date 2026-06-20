import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBusinessSession } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getBusinessSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const dealId = parseInt((await params).id, 10);
  if (isNaN(dealId)) return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });

  // Verify the deal belongs to this business
  const deal = await prisma.deal.findFirst({ where: { id: dealId, businessId: session.businessId } });
  if (!deal) return NextResponse.json({ error: "Deal not found or not owned by you" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF allowed" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });

  const { put } = await import("@vercel/blob");
  const blob = await put(`deals/deal-${dealId}-${Date.now()}.${file.type.split("/")[1]}`, file, {
    access: "public",
  });

  const imageUrl = blob.url;
  await prisma.deal.update({
    where: { id: dealId },
    data: { imageUrl: imageUrl },
  });

  return NextResponse.json({ imageUrl });
}
