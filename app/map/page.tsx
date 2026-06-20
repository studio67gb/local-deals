import { Metadata } from "next";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "Local Deals Map — Find offers near you",
  description: "Interactive map showing independent businesses and their exclusive local deals.",
};

export default function MapPage() {
  return <MapClient />;
}
