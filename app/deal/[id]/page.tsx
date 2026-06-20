import type { Metadata } from "next";
import DealClient from "./DealClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // In a real app, we'd fetch the deal title here.
  // For now, we return a generic but SEO-friendly title that uses the deal ID.
  return {
    title: `Local Deal | Local Deals UK`,
    description: "Exclusive local offer. Claim your discount now on Local Deals UK.",
  };
}

export default function DealPage() {
  return <DealClient />;
}
