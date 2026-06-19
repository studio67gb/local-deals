const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const KEY = "AIzaSyDxsQfax5PKmQa9Hrdxl-5hiFTlUnipNXk";

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ", UK")}&key=${KEY}&region=gb`;
  const r = await fetch(url);
  const d = await r.json();
  if (d.status === "OK" && d.results?.[0]) {
    return d.results[0].geometry.location;
  }
  return null;
}

async function main() {
  const businesses = await prisma.business.findMany({ where: { lat: null } });
  for (const b of businesses) {
    if (!b.address) continue;
    const coords = await geocode(b.address);
    if (coords) {
      await prisma.business.update({ where: { id: b.id }, data: { lat: coords.lat, lng: coords.lng } });
      console.log(`✅ ${b.name}: ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`❌ ${b.name}: failed`);
    }
  }
}

main().finally(() => prisma.$disconnect());
