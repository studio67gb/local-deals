"use client";
import { useState, useEffect } from "react";
import AdUnit from "@/components/AdUnit";
import MapBackground from "@/components/MapBackground";

interface Deal {
  id: number;
  title: string;
  description: string;
  featured: boolean;
  claimCount: number;
  distanceMiles?: number;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  business: {
    name: string;
    category: string;
    area: string;
    slug: string;
    logo: string | null;
  };
}

const CATEGORIES = ["All", "Restaurant & Food", "Beauty & Hair", "Health & Fitness", "Retail & Shopping", "Trades & Services", "Entertainment", "Automotive", "Other"];

const PILL_MAP: Record<string, string> = {
  "Restaurant & Food": "pill-food",
  "Beauty & Hair": "pill-beauty",
  "Health & Fitness": "pill-fitness",
  "Retail & Shopping": "pill-retail",
  "Trades & Services": "pill-trades",
  "Automotive": "pill-auto",
  "Entertainment": "pill-entert",
  "Other": "pill-other",
};

function DealCard({ deal }: { deal: Deal }) {
  const imgUrl = deal.imageUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop";
  const rating = deal.rating || 4.1;
  const reviews = deal.reviewCount || 1259;

  return (
    <a href={`/deal/${deal.id}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        {/* Image & Overlays */}
        <div style={{ position: "relative", width: "100%", height: 220 }}>
          <img src={imgUrl} alt={deal.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          
          {/* Popular Gift / Featured Badge */}
          {deal.featured && (
            <div style={{ position: "absolute", top: 12, left: 12, background: "white", padding: "4px 10px", borderRadius: 4, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 13 }}>🎁</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Popular Gift</span>
            </div>
          )}

          {/* Heart Icon Overlay */}
          <div style={{ position: "absolute", top: 12, right: 12, background: "white", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>

          {/* Carousel dots */}
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, background: "rgba(0,0,0,0.4)", padding: "5px 10px", borderRadius: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
          </div>
        </div>

        {/* Card Content */}
        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{deal.business.name}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>{deal.title}</div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <div style={{ display: "flex", color: "#fbbf24", fontSize: 15 }}>
              ★★★★<span style={{ color: "var(--border)" }}>★</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginLeft: 4 }}>{rating.toFixed(1)}</span>
            <span style={{ fontSize: 14, color: "var(--text-dim)" }}>({reviews.toLocaleString()})</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16 }}>
             <span style={{ fontSize: 12, color: "var(--text-dim)" }}>🔥 {deal.claimCount} claimed</span>
             {deal.distanceMiles !== undefined && deal.distanceMiles !== null && (
                <span style={{ fontSize: 12, color: "#0D9488", fontWeight: 700 }}>📍 {deal.distanceMiles.toFixed(1)} miles away</span>
             )}
          </div>
        </div>

      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ height: 380, padding: 0, overflow: "hidden" }}>
      <div style={{ height: 220, width: "100%", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease infinite" }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {[100, 220, 140, 80].map((w, i) => (
          <div key={i} style={{ height: 14, width: w, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease infinite" }} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  const handleNearMe = () => {
    setLocError("");
    setLocLoading(true);
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocLoading(false);
      },
      (err) => {
        setLocError("Please allow location access to find deals near you");
        setLocLoading(false);
      }
    );
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    if (lat !== null && lng !== null) {
      params.set("lat", lat.toString());
      params.set("lng", lng.toString());
    }
    setLoading(true);
    fetch(`/api/deals?${params}`)
      .then(r => r.json())
      .then(d => { setDeals(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, category, lat, lng]);

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Hero */}
      <section style={{ position: "relative", padding: "80px 24px 60px", textAlign: "center", overflow: "hidden" }}>
        <MapBackground />
        
        <div style={{ position: "absolute", top: -100, left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,0.15),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: "15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(244,63,94,0.12),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 999, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F43F5E", textTransform: "uppercase", letterSpacing: "0.06em" }}>🎉 Exclusive Local Offers</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            The Best Deals from<br />
            <span className="gradient-text">Independent Businesses</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 40px" }}>
            Exclusive offers from independent local businesses — only available here.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: 18 }}>🔍</span>
            <input
              className="search-bar"
              placeholder="Search deals, businesses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "0 24px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <button 
            onClick={handleNearMe}
            disabled={locLoading}
            style={{ 
              background: lat ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)",
              border: lat ? "1px solid rgba(244,63,94,0.4)" : "1px solid var(--border)",
              color: lat ? "#F43F5E" : "var(--text)",
              padding: "10px 20px", borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 
            }}
          >
            {locLoading ? "⏳ Locating..." : lat ? "📍 Nearest to You" : "📍 Find Deals Near Me"}
          </button>
          {lat && (
            <button onClick={() => { setLat(null); setLng(null); }} style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Clear location
            </button>
          )}
          {locError && <span style={{ color: "#ef4444", fontSize: 13 }}>{locError}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
          {CATEGORIES.map(c => (
            <button key={c} className={`filter-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </section>

      {/* Deals grid */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : deals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No deals found</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Try a different search or category</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text-dim)" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""} available</div>
            {/* Render deals in chunks of 6 with an ad between each chunk */}
            {Array.from({ length: Math.ceil(deals.length / 6) }, (_, chunk) => (
              <div key={chunk}>
                {chunk > 0 && (
                  <AdUnit
                    slot={process.env.NEXT_PUBLIC_AD_SLOT_LEADERBOARD || "2345678901"}
                    format="horizontal"
                    style={{ minHeight: 90, width: "100%", marginBottom: 20 }}
                  />

                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20, marginBottom: 20 }}>
                  {deals.slice(chunk * 6, chunk * 6 + 6).map(d => <DealCard key={d.id} deal={d} />)}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {[
            { href: "/about", label: "About Us" },
            { href: "/about#contact", label: "Contact" },
            { href: "/register", label: "List Your Business" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Use" },
            { href: "/admin", label: "Business Login" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>{l.label}</a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-dim)" }}>© 2026 Local Deals UK · Connecting people with independent businesses across the UK</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
          This site uses Google AdSense. <a href="/privacy" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>Privacy Policy</a>
        </p>
      </footer>
    </>
  );
}
