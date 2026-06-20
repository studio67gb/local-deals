import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register Your Business — Local Deals UK",
  description: "List your independent business on Local Deals UK. Free to join, reach local customers.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
