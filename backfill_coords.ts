import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "./lib/geocode";

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      address: { not: null },
      lat: null,
      lng: null,
    },
  });

  console.log(`Found ${businesses.length} businesses to geocode.`);

  for (const b of businesses) {
    if (!b.address) continue;
    console.log(`Geocoding ${b.name}: ${b.address}...`);
    const coords = await geocodeAddress(b.address);
    if (coords) {
      await prisma.business.update({
        where: { id: b.id },
        data: { lat: coords.lat, lng: coords.lng },
      });
      console.log(`✅ Success: ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`❌ Failed to geocode.`);
    }
    // Sleep to avoid rate limits
    await new Promise((r) => setTimeout(r, 200));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
