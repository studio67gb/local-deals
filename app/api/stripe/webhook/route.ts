import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const businessId = parseInt(session.metadata?.businessId || "0");
        const tier = session.metadata?.tier || "standard";
        const subscriptionId = session.subscription as string;

        if (businessId && subscriptionId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              tier,
              stripeSubId: subscriptionId,
              featured: tier === "featured",
            },
          });
          // If featured tier, mark all their deals as featured
          if (tier === "featured") {
            await prisma.deal.updateMany({
              where: { businessId },
              data: { featured: true },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const businessId = parseInt(subscription.metadata?.businessId || "0");
        const status = subscription.status;

        if (businessId) {
          if (status === "active") {
            // Subscription is active — could be an upgrade/downgrade
            const priceId = subscription.items.data[0]?.price.id;
            let tier = "free";
            if (priceId === process.env.STRIPE_PRICE_STANDARD) tier = "standard";
            if (priceId === process.env.STRIPE_PRICE_FEATURED) tier = "featured";

            await prisma.business.update({
              where: { id: businessId },
              data: {
                tier,
                featured: tier === "featured",
              },
            });
            if (tier === "featured") {
              await prisma.deal.updateMany({
                where: { businessId },
                data: { featured: true },
              });
            } else {
              await prisma.deal.updateMany({
                where: { businessId },
                data: { featured: false },
              });
            }
          } else if (status === "past_due" || status === "unpaid") {
            // Payment failed — downgrade to free
            await prisma.business.update({
              where: { id: businessId },
              data: { tier: "free", featured: false },
            });
            await prisma.deal.updateMany({
              where: { businessId },
              data: { featured: false },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const businessId = parseInt(subscription.metadata?.businessId || "0");

        if (businessId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              tier: "free",
              stripeSubId: null,
              featured: false,
            },
          });
          await prisma.deal.updateMany({
            where: { businessId },
            data: { featured: false },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const business = await prisma.business.findUnique({
            where: { stripeSubId: subscriptionId },
          });
          if (business) {
            console.warn(`Payment failed for business ${business.id} (${business.name})`);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
