import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing Plans — Local Deals UK",
  description: "Free, Standard and Featured plans for local businesses. Choose the plan that's right for your business.",
};

export default function PricingPage() {
  return <PricingClient />;
}
