"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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

  return (
    <Link href={`/deal/${deal.id}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        {/* Image & Overlays */}
        <div style={{ position: "relative", width: "100%", height: 220 }}>
          <img src={imgUrl} alt={deal.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          
          {/* Popular Gift / Featured Badge */}
          {deal.featured && (
            <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(17, 24, 39, 0.95)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
              <span style={{ fontSize: 13 }}>🎁</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Popular Gift</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{deal.business.name}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.4, fontFamily: "'Montserrat', sans-serif" }}>{deal.title}</div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            {deal.rating ? (
              <>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>⭐ {deal.rating.toFixed(1)}</span>
                <span style={{ fontSize: 14, color: "var(--text-dim)" }}>({deal.reviewCount?.toLocaleString()})</span>
              </>
            ) : (
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "var(--text-muted)" }}>New</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16 }}>
             <span style={{ fontSize: 12, color: "var(--text-dim)" }}>🔥 {deal.claimCount} claimed</span>
             {deal.distanceMiles !== undefined && deal.distanceMiles !== null && (
                <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 700 }}>📍 {deal.distanceMiles.toFixed(1)} miles away</span>
             )}
          </div>
        </div>

      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ height: 380, padding: 0, overflow: "hidden" }}>
      <div style={{ height: 220, width: "100%", background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease infinite" }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {[100, 220, 140, 80].map((w, i) => (
          <div key={i} style={{ height: 14, width: w, borderRadius: 6, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease infinite" }} />
        ))}
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

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
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setVisibleCount(12);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setVisibleCount(12);
  }, [category, lat, lng]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category !== "All") params.set("category", category);
    if (lat !== null && lng !== null) {
      params.set("lat", lat.toString());
      params.set("lng", lng.toString());
    }
    setLoading(true);
    setError("");
    fetch(`/api/deals?${params}`)
      .then(async r => {
        if (!r.ok) throw new Error("Failed to fetch deals");
        return r.json();
      })
      .then(d => { setDeals(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [debouncedSearch, category, lat, lng]);

  const visibleDeals = deals.slice(0, visibleCount);
  const hasMore = visibleCount < deals.length;

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Hero */}
      <section style={{ position: "relative", padding: "80px 24px 60px", textAlign: "center", overflow: "hidden" }}>
        <MapBackground />
        
        <div style={{ position: "absolute", top: -100, left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(2,132,199,0.15),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: "15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(22,163,74,0.12),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 999, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🎉 Exclusive Local Offers</span>
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
              background: lat ? "rgba(2,132,199,0.15)" : "rgba(255,255,255,0.04)",
              border: lat ? "1px solid rgba(2,132,199,0.4)" : "1px solid var(--border)",
              color: lat ? "var(--teal)" : "var(--text)",
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
        {error ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Failed to load deals</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{error}</div>
            <button onClick={() => window.location.reload()} className="btn btn-ghost" style={{ marginTop: 16 }}>Try Again</button>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%, 280px),1fr))", gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : deals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px dashed var(--border)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No deals found</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>We couldn't find any deals matching your search.</div>
            <Link href="/register" className="btn btn-orange">List a Business Here</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text-dim)" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""} available</div>
            {/* Render deals in chunks of 6 with an ad between each chunk */}
            {Array.from({ length: Math.ceil(visibleDeals.length / 6) }, (_, chunk) => (
              <div key={chunk}>
                {chunk > 0 && (
                  <AdUnit
                    slot={process.env.NEXT_PUBLIC_AD_SLOT_LEADERBOARD || "2345678901"}
                    format="horizontal"
                    style={{ minHeight: 90, width: "100%", marginBottom: 20 }}
                  />

                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%, 280px),1fr))", gap: 20, marginBottom: 20 }}>
                  {visibleDeals.slice(chunk * 6, chunk * 6 + 6).map(d => <DealCard key={d.id} deal={d} />)}
                </div>
              </div>
            ))}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <button className="btn btn-ghost" onClick={() => setVisibleCount(v => v + 12)}>Load More Deals</button>
              </div>
            )}
          </>
        )}
      </section>

    </>
  );
}
