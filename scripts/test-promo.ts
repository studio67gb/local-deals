import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPromoFlow() {
  console.log('--- Testing Promo Flow ---');

  // 1. Create a test business
  const business = await prisma.business.create({
    data: {
      name: 'Promo Test Business',
      description: 'Testing the growth promo feature',
      category: 'RETAIL',
      address: '123 Test St',
      phone: '1234567890',
      slug: `promo-test-${Date.now()}`,
      area: 'Doncaster',
      ownerName: 'Promo Tester',
      ownerEmail: `test_promo_${Date.now()}@example.com`,
      ownerPassword: 'hashedpasswordhere', // Just a placeholder
      tier: 'free'
    }
  });

  console.log(`Created business ${business.id} with tier: ${business.tier}`);

  // 2. Submit promo
  const updatedBusiness = await prisma.business.update({
    where: { id: business.id },
    data: {
      promoStatus: 'pending',
      promoShareUrl: 'https://facebook.com/test-share-url'
    }
  });

  console.log(`Promo submitted. Status: ${updatedBusiness.promoStatus}, URL: ${updatedBusiness.promoShareUrl}`);

  // 3. Direct DB update simulating admin approval logic
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const approvedBusiness = await prisma.business.update({
    where: { id: business.id },
    data: {
      promoStatus: "approved",
      promoApprovedAt: new Date(),
      tier: "standard",
      tierExpiresAt: thirtyDaysFromNow,
    },
  });

  console.log('Direct DB Update Promo Approved:');
  console.log(`Final Tier: ${approvedBusiness.tier}`);
  console.log(`Final Promo Status: ${approvedBusiness.promoStatus}`);
  console.log(`Tier Expires At: ${approvedBusiness.tierExpiresAt}`);

  // Cleanup
  await prisma.business.delete({ where: { id: business.id } });
  console.log('Cleanup complete.');
}

testPromoFlow().catch(console.error).finally(() => prisma.$disconnect());
