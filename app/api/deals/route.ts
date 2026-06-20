import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const area = searchParams.get("area") || "";
  const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;

  const deals = await prisma.deal.findMany({
    where: {
      active: true,
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { business: { name: { contains: search } } },
        ]
      } : {}),
      ...(category ? { business: { category } } : {}),
      ...(area ? { business: { area } } : {}),
    },
    include: { business: { select: { name: true, category: true, area: true, slug: true, lat: true, lng: true, logo: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  // Calculate distance if coordinates provided
  let results = deals.map(deal => {
    let distanceMiles = null;
    if (userLat !== null && userLng !== null && deal.business.lat !== null && deal.business.lng !== null) {
      const R = 3958.8; // Radius of Earth in miles
      const dLat = (deal.business.lat - userLat) * (Math.PI / 180);
      const dLon = (deal.business.lng - userLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * (Math.PI / 180)) * Math.cos(deal.business.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceMiles = R * c;
    }
    return { ...deal, distanceMiles };
  });

  // If sorting by distance, reorder
  if (userLat !== null && userLng !== null) {
    results.sort((a, b) => {
      // Put deals with no location at the bottom
      if (a.distanceMiles === null && b.distanceMiles === null) return 0;
      if (a.distanceMiles === null) return 1;
      if (b.distanceMiles === null) return -1;
      return a.distanceMiles - b.distanceMiles;
    });
  }

  return NextResponse.json(results);
}

