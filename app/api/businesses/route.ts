import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import bcrypt from "bcryptjs";

export async function GET() {
  const businesses = await prisma.business.findMany({
    where: { active: true, status: "active" },
    include: { _count: { select: { deals: true } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Geocode the address for map pins
  const coords = body.address ? await geocodeAddress(body.address) : null;

  // Hash password if provided
  const ownerPassword = body.ownerPassword
    ? await bcrypt.hash(body.ownerPassword, 12)
    : null;

  const business = await prisma.business.create({
    data: {
      name: body.name,
      slug,
      category: body.category,
      area: body.area,
      description: body.description,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      address: body.address || null,
      instagram: body.instagram || null,
      facebook: body.facebook || null,
      featured: false,
      status: "pending",
      ownerName: body.ownerName || null,
      ownerEmail: body.ownerEmail ? body.ownerEmail.toLowerCase().trim() : null,
      ownerPassword,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      deals: body.offerTitle ? {
        create: {
          title: body.offerTitle,
          description: body.offerDescription,
          offerCode: body.offerCode || null,
          terms: body.offerTerms || null,
          active: false,
        }
      } : undefined,
    },
  });
  // Don't return the hashed password
  const { ownerPassword: _, ...safe } = business as typeof business & { ownerPassword?: string };
  return NextResponse.json(safe);
}
