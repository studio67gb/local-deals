"use client";
import { useState } from "react";

const TIERS = [
  {
    key: "free",
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Get started with a basic listing",
    features: [
      "1 active deal listing",
      "Category badge",
      "Map pin placement",
      "Basic business profile",
    ],
    notIncluded: [
      "Claim analytics",
      "Featured placement",
      "Priority in search",
    ],
    cta: "Get Started Free",
    color: "#94a3b8",
    popular: false,
  },
  {
    key: "standard",
    name: "Standard",
    price: "£5",
    period: "/month",
    description: "Perfect for growing local businesses",
    features: [
      "Up to 3 active deals",
      "Category badge",
      "Map pin placement",
      "Claim analytics dashboard",
      "Social sharing tools",
    ],
    notIncluded: [
      "Featured placement",
      "Priority in search",
    ],
    cta: "Subscribe — £5/mo",
    color: "#0D9488",
    popular: true,
  },
  {
    key: "featured",
    name: "Featured",
    price: "£15",
    period: "/month",
    description: "Maximum visibility for your business",
    features: [
      "Unlimited active deals",
      "Category badge",
      "Map pin placement",
      "Claim analytics dashboard",
      "Social sharing tools",
      "⭐ Featured placement on homepage",
      "🔍 Priority in search results",
      "🏆 Featured badge on all deals",
    ],
    notIncluded: [],
    cta: "Go Featured — £15/mo",
    color: "#F43F5E",
    popular: false,
  },
];

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes! No contracts, no commitments. Cancel from your dashboard anytime and you'll keep your current plan until the end of the billing period." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards through Stripe, including Visa, Mastercard, and Amex." },
  { q: "What happens if I downgrade?", a: "Your extra deals will be kept but deactivated. You can reactivate them by upgrading again." },
  { q: "Is there a setup fee?", a: "No! The prices shown are all you pay. No hidden fees, no commission on your deals." },
  { q: "Can I upgrade or downgrade later?", a: "Absolutely. You can change your plan at any time from your business dashboard." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSelect = async (tier: string) => {
    if (tier === "free") {
      window.location.href = "/register";
      return;
    }
    // For paid tiers, redirect to register with tier param
    window.location.href = `/register?plan=${tier}`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 100px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.2)",
          borderRadius: 999, padding: "6px 16px", marginBottom: 20,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0D9488", textTransform: "uppercase", letterSpacing: "0.06em" }}>💰 Simple Pricing</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          Grow Your Business with<br /><span className="gradient-text">LocalDeals</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          From free listings to featured placement. Choose the plan that&apos;s right for your business.
        </p>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 80 }}>
        {TIERS.map(t => (
          <div key={t.key} className="card" style={{
            padding: 0,
            position: "relative",
            border: t.popular ? "2px solid rgba(13,148,136,0.5)" : undefined,
            transform: t.popular ? "scale(1.04)" : undefined,
          }}>
            {t.popular && (
              <div style={{
                position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                background: "#fef08a",
                color: "#854d0e",
                border: "1px solid #fde047",
                fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.06em", padding: "5px 18px", borderRadius: 999,
              }}>Best Value</div>
            )}

            <div style={{ padding: "36px 28px 28px" }}>
              {/* Tier name */}
              <div style={{ fontSize: 13, fontWeight: 800, color: t.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{t.name}</div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 900 }}>{t.price}</span>
                <span style={{ fontSize: 16, color: "var(--text-muted)" }}>{t.period}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.5 }}>{t.description}</p>

              {/* CTA */}
              <button
                onClick={() => handleSelect(t.key)}
                className={t.popular ? "btn btn-primary" : "btn btn-ghost"}
                style={{
                  width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15,
                  ...(t.key === "featured" ? {
                    background: "linear-gradient(135deg, #F43F5E, #7c3aed)",
                    color: "white", border: "none",
                    boxShadow: "0 4px 20px rgba(244,63,94,0.35)",
                  } : {}),
                }}
              >
                {t.cta}
              </button>
            </div>

            {/* Features */}
            <div style={{ padding: "20px 28px 28px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>What&apos;s included</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {t.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span> {f}
                  </li>
                ))}
                {t.notIncluded.map(f => (
                  <li key={f} style={{ fontSize: 13, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#475569", fontSize: 14 }}>✗</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 32 }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQ.map((f, i) => (
            <div key={i} className="card" style={{ cursor: "pointer", overflow: "hidden" }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{f.q}</span>
                <span style={{ color: "var(--text-dim)", fontSize: 18, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: "0 24px 18px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
