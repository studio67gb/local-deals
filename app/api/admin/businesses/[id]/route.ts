import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  const business = await prisma.business.findUnique({ 
    where: { id },
    include: { deals: { orderBy: { createdAt: 'desc' }, include: { blogPosts: { select: { id: true, title: true, slug: true } } } } }
  });
  
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(business);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  const body = await req.json();

  const current = await prisma.business.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let lat = current.lat;
  let lng = current.lng;

  // Re-geocode if address changed
  if (body.address !== undefined && body.address !== current.address) {
    if (body.address) {
      const coords = await geocodeAddress(body.address);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    } else {
      lat = null;
      lng = null;
    }
  }

  const updated = await prisma.business.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      category: body.category !== undefined ? body.category : undefined,
      area: body.area !== undefined ? body.area : undefined,
      description: body.description !== undefined ? body.description : undefined,
      phone: body.phone !== undefined ? body.phone || null : undefined,
      email: body.email !== undefined ? body.email || null : undefined,
      website: body.website !== undefined ? body.website || null : undefined,
      address: body.address !== undefined ? body.address || null : undefined,
      instagram: body.instagram !== undefined ? body.instagram || null : undefined,
      facebook: body.facebook !== undefined ? body.facebook || null : undefined,
      tiktok: body.tiktok !== undefined ? body.tiktok || null : undefined,
      lat,
      lng,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  const { id: rawId } = await params;
  const id = parseInt(rawId);

  await prisma.business.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
