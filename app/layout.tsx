import type { Metadata } from "next";
import "./globals.css";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

export const metadata: Metadata = {
  title: "Local Deals UK — Exclusive Offers from Independent Businesses",
  description: "Find exclusive deals and discounts from the best local independent businesses across the UK. Doncaster, Goole, Sheffield and beyond.",
  metadataBase: new URL("https://local-deals.uk"),
  openGraph: {
    title: "Local Deals UK — Exclusive Local Offers",
    description: "Exclusive deals from independent local businesses near you.",
    url: "https://local-deals.uk",
    siteName: "Local Deals UK",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense verification — must be in <head> for crawler */}
        {ADSENSE_CLIENT && ADSENSE_CLIENT !== "ca-pub-PENDING" && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(15,15,19,0.85)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 24px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #f97316, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "white"
            }}>L</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#f1f5f9" }}>Local<span style={{ color: "#f97316" }}>Deals</span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="/map" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>🗺️ Map</a>
            <a href="/about" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>About</a>
            <a href="/register" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>List Your Business</a>
            <a href="/business/login" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>Business Login</a>
            <a href="/admin" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>Admin</a>
          </div>
        </nav>
        <div style={{ paddingTop: 60 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
