import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const { id: rawId } = await params;
  const businessId = parseInt(rawId);

  const formData = await req.formData();
  const file = formData.get("logo") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF allowed" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `biz-${businessId}.${ext}`;
  const filepath = path.join(process.cwd(), "public", "uploads", "logos", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const logoUrl = `/uploads/logos/${filename}`;
  await prisma.business.update({
    where: { id: businessId },
    data: { logo: logoUrl },
  });

  return NextResponse.json({ logo: logoUrl });
}
