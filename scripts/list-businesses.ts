import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Businesses ---");
  const businesses = await prisma.business.findMany({
    include: { deals: true }
  });
  for (const b of businesses) {
    console.log(`- [${b.id}] Name: ${b.name}, Slug: ${b.slug}, Tier: ${b.tier}, Status: ${b.status}, PromoStatus: ${b.promoStatus}`);
    for (const d of b.deals) {
      console.log(`   * Deal: ${d.title} (Code: ${d.offerCode})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
