import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBusinessSession } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";

export async function PATCH(req: NextRequest) {
  const session = await getBusinessSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const current = await prisma.business.findUnique({ where: { id: session.businessId } });

  let lat = current?.lat;
  let lng = current?.lng;

  // If address is being updated and has changed, re-geocode it
  if (body.address !== undefined && body.address !== current?.address) {
    if (body.address) {
      const coords = await geocodeAddress(body.address);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    } else {
      // Address cleared
      lat = null;
      lng = null;
    }
  }

  const updated = await prisma.business.update({
    where: { id: session.businessId },
    data: {
      phone: body.phone !== undefined ? body.phone || null : undefined,
      website: body.website !== undefined ? body.website || null : undefined,
      instagram: body.instagram !== undefined ? body.instagram || null : undefined,
      facebook: body.facebook !== undefined ? body.facebook || null : undefined,
      tiktok: body.tiktok !== undefined ? body.tiktok || null : undefined,
      address: body.address !== undefined ? body.address || null : undefined,
      logo: body.logo !== undefined ? body.logo || null : undefined,
      lat,
      lng,
    },
  });

  const { ownerPassword: _, ...safe } = updated as typeof updated & { ownerPassword?: string };
  return NextResponse.json(safe);
}
