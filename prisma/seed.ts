import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed businesses
  const b1 = await prisma.business.upsert({
    where: { slug: "cuts-and-co" },
    update: {},
    create: {
      name: "Cuts & Co Barbershop",
      slug: "cuts-and-co",
      category: "Beauty & Hair",
      area: "Doncaster",
      description: "Award-winning barbershop in the heart of Doncaster. Traditional cuts, hot towel shaves, and modern styles.",
      phone: "01302 000001",
      address: "12 High Street, Doncaster, DN1 1AA",
      instagram: "@cutsandco_donny",
      facebook: "cutsandcodonny",
      featured: true,
      deals: {
        create: {
          title: "20% Off Your First Visit",
          description: "New customers get 20% off any service on their first visit. Walk-ins welcome.",
          offerCode: "FIRST20",
          terms: "New customers only. Cannot be combined with other offers. Valid Mon-Fri.",
          featured: true,
        }
      }
    }
  });

  const b2 = await prisma.business.upsert({
    where: { slug: "the-pizza-pit" },
    update: {},
    create: {
      name: "The Pizza Pit",
      slug: "the-pizza-pit",
      category: "Restaurant & Food",
      area: "Doncaster",
      description: "Stone-baked pizzas made fresh every day. Family-run since 2008. Delivery and collection available.",
      phone: "01302 000002",
      address: "45 Market Place, Doncaster, DN1 1LN",
      instagram: "@thepizzapit",
      deals: {
        create: {
          title: "Buy One Get One Free on Tuesdays",
          description: "Every Tuesday — buy any large pizza and get a second of equal or lesser value absolutely free.",
          offerCode: "TUESDAYBOGO",
          terms: "Dine-in and collection only. Tuesdays only. Not valid on bank holidays.",
          featured: false,
        }
      }
    }
  });

  const b3 = await prisma.business.upsert({
    where: { slug: "goole-gym" },
    update: {},
    create: {
      name: "Goole Fitness Centre",
      slug: "goole-gym",
      category: "Health & Fitness",
      area: "Goole",
      description: "Full-equipped gym with free weights, cardio, classes, and personal training. No joining fee ever.",
      phone: "01405 000003",
      address: "88 Boothferry Road, Goole, DN14 6AE",
      facebook: "goolefitness",
      featured: true,
      deals: {
        create: {
          title: "First Month Half Price",
          description: "Join Goole Fitness Centre this month and pay just £15 for your first month's membership.",
          offerCode: "HALFPRICE",
          terms: "New members only. Direct debit required. Minimum 3-month membership.",
          featured: true,
        }
      }
    }
  });

  console.log("✅ Seeded 3 businesses with deals");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
