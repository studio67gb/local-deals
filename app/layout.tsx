import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

/* Critical dark-theme CSS injected as raw string so it survives hydration */
const CRITICAL_CSS = `
html, body {
  background: #0B0F19 !important;
  color: #F9FAFB !important;
  color-scheme: dark !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Google AdSense verification — must be in <head> for crawler */}
        {ADSENSE_CLIENT && ADSENSE_CLIENT !== "ca-pub-PENDING" && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://local-deals.uk/#website",
                  "url": "https://local-deals.uk",
                  "name": "Local Deals UK",
                  "description": "The premier B2B advertising and marketing platform for independent UK businesses to list local promotions, drive foot traffic, and connect with high-intent nearby customers.",
                  "publisher": { "@id": "https://local-deals.uk/#organization" }
                },
                {
                  "@type": "Organization",
                  "@id": "https://local-deals.uk/#organization",
                  "name": "Local Deals UK",
                  "url": "https://local-deals.uk",
                  "logo": "https://local-deals.uk/icon.png",
                  "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "support@local-deals.uk" }
                },
                {
                  "@type": "Service",
                  "@id": "https://local-deals.uk/#service",
                  "name": "Local Business Advertising & Lead Generation",
                  "provider": { "@id": "https://local-deals.uk/#organization" },
                  "audience": { "@type": "Audience", "audienceType": "Independent UK Businesses" },
                  "serviceType": "B2B Marketing & Local Directory Listing",
                  "description": "A dynamic directory allowing independent merchants, trades, and retailers to advertise promotions and drive weekday foot traffic with zero upfront costs."
                }
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <div style={{ paddingTop: 60, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
