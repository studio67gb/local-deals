import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Local Deals UK | Exclusive Offers from Independent Businesses",
  description: "Find the best deals from independent local businesses in your area. Free local offers, restaurant deals, and service discounts.",
};

export default function HomePage() {
  return <HomeClient />;
}
