import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
        {[
          { href: "/about", label: "About Us" },
          { href: "/about#contact", label: "Contact" },
          { href: "/register", label: "List Your Business" },
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Use" },
          { href: "/business/login", label: "Business Login" },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>{l.label}</Link>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
        © 2026 External Impression Ltd (Company No. 16748423) trading as Local Deals · ICO Registration: ZC071025 · Connecting people with independent businesses across the UK
      </p>
      <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
        This site uses Google AdSense. <Link href="/privacy" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>Privacy Policy</Link>
      </p>
    </footer>
  );
}
