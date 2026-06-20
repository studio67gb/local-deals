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
