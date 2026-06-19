"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import AdUnit from "@/components/AdUnit";

interface DealDetail {
  id: number;
  title: string;
  description: string;
  offerCode: string | null;
  terms: string | null;
  expiresAt: string | null;
  claimCount: number;
  featured: boolean;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  business: {
    name: string;
    category: string;
    area: string;
    description: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    logo: string | null;
  };
}

const PILL_MAP: Record<string, string> = {
  "Restaurant & Food": "pill-food",
  "Beauty & Hair": "pill-beauty",
  "Health & Fitness": "pill-fitness",
  "Retail & Shopping": "pill-retail",
  "Trades & Services": "pill-trades",
  "Automotive": "pill-auto",
  "Entertainment": "pill-entert",
};

const AD_SECONDS = 8; // countdown duration

// ─── Ad Gate Modal ───────────────────────────────────────────────────────────
function AdGateModal({ onComplete }: { onComplete: () => void }) {
  const [seconds, setSeconds] = useState(AD_SECONDS);
  const [unlocked, setUnlocked] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setUnlocked(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  // Circumference of the SVG circle countdown
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = ((AD_SECONDS - seconds) / AD_SECONDS) * circumference;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{
          background: "var(--surface)", borderRadius: 20,
          border: "1px solid var(--border)",
          width: "100%", maxWidth: 380,
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          animation: "slideUp 0.25s ease",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(244,63,94,0.15))",
            borderBottom: "1px solid var(--border)",
            padding: "18px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>🎁 Almost there!</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {unlocked ? "Your discount is ready!" : `Watch for ${seconds}s to unlock your deal`}
              </div>
            </div>
            {/* SVG countdown ring */}
            {!unlocked && (
              <svg width={52} height={52} style={{ flexShrink: 0 }}>
                <circle cx={26} cy={26} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
                <circle
                  cx={26} cy={26} r={radius}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth={4}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  transform="rotate(-90 26 26)"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
                <text x={26} y={31} textAnchor="middle" fill="white" fontSize={14} fontWeight={800}>{seconds}</text>
              </svg>
            )}
          </div>

          {/* Ad area */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", fontWeight: 600, marginBottom: 8 }}>
              Advertisement — supports free local deals
            </div>
            <AdUnit
              slot={process.env.NEXT_PUBLIC_AD_SLOT_RECTANGLE || "3456789012"}
              format="rectangle"
              style={{ minHeight: 250, borderRadius: 12, width: "100%" }}
            />
          </div>

          {/* Unlock button */}
          <div style={{ padding: 20 }}>
            {unlocked ? (
              <button
                className="btn btn-reveal"
                onClick={onComplete}
                style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "16px", animation: "pulse 0.6s ease" }}
              >
                🎉 Get My Discount Now →
              </button>
            ) : (
              <div style={{
                textAlign: "center", padding: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13, color: "var(--text-dim)",
              }}>
                🔒 Unlocks in <strong style={{ color: "var(--text)" }}>{seconds} second{seconds !== 1 ? "s" : ""}</strong>...
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }
      `}</style>
    </>
  );
}

// ─── Main Deal Page ───────────────────────────────────────────────────────────
export default function DealPage() {
  const { id } = useParams();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdGate, setShowAdGate] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [claimCount, setClaimCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then(r => r.json())
      .then(d => { setDeal(d); setClaimCount(d.claimCount); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleRevealClick = () => {
    // Open the ad gate modal
    setShowAdGate(true);
  };

  const handleAdComplete = async () => {
    setShowAdGate(false);
    setRevealed(true);
    // Register claim
    const r = await fetch(`/api/deals/${id}/claim`, { method: "POST" });
    const data = await r.json();
    setClaimCount(data.claimCount);
  };

  const copyCode = () => {
    if (deal?.offerCode) {
      navigator.clipboard.writeText(deal.offerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading deal...</div>
    </div>
  );

  if (!deal) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Deal not found</div>
      <a href="/" className="btn btn-ghost">← Back to deals</a>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Ad gate modal */}
      {showAdGate && <AdGateModal onComplete={handleAdComplete} />}

      <a href="/" className="btn btn-ghost" style={{ marginBottom: 32, display: "inline-flex" }}>← All Deals</a>

      {/* Business header */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          {/* Logo */}
          <div style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", background: "linear-gradient(135deg,#0D9488,#F43F5E)", flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {deal.business.logo
              ? <img src={deal.business.logo} alt={deal.business.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 26 }}>🏪</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span className={`pill ${PILL_MAP[deal.business.category] || "pill-other"}`}>{deal.business.category}</span>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>{deal.business.area}</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>{deal.business.name}</h2>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>{deal.business.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
          {deal.business.phone && <span style={{ color: "var(--text-muted)" }}>📞 {deal.business.phone}</span>}
          {deal.business.address && <span style={{ color: "var(--text-muted)" }}>📍 {deal.business.address}</span>}
          {deal.business.website && <a href={deal.business.website} target="_blank" rel="noreferrer" style={{ color: "#0D9488" }}>🌐 Website</a>}
          {deal.business.tiktok && <a href={deal.business.tiktok} target="_blank" rel="noreferrer" style={{ color: "#ff0050", fontWeight: 700 }}>🎵 TikTok Shop</a>}
          {deal.business.instagram && <span style={{ color: "#E1306C" }}>📸 {deal.business.instagram}</span>}
          {deal.business.facebook && <a href={deal.business.facebook} target="_blank" rel="noreferrer" style={{ color: "#1877F2" }}>📘 Facebook</a>}
        </div>
      </div>

      {/* Deal card */}
      <div className="card" style={{ padding: 28, overflow: "hidden" }}>
        {deal.imageUrl && (
          <div style={{ margin: "-28px -28px 24px -28px", height: 260, position: "relative" }}>
            <img src={deal.imageUrl} alt={deal.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {deal.featured && (
          <div style={{ background: "linear-gradient(135deg,#0D9488,#F43F5E)", padding: "6px 16px", margin: deal.imageUrl ? "0 -28px 24px" : "-28px -28px 24px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.08em" }}>⭐ Featured Deal</span>
          </div>
        )}

        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, color: "var(--text)" }}>{deal.title}</h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>{deal.description}</p>

        {deal.expiresAt && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 16px", marginBottom: 24, fontSize: 13, color: "#f87171" }}>
            ⏰ Offer expires: {new Date(deal.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        )}

        {/* Reveal / Ad gate / Revealed */}
        {!revealed ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <button className="btn btn-reveal" onClick={handleRevealClick} style={{ width: "100%", justifyContent: "center" }}>
              🎁 Reveal Your Exclusive Offer
            </button>
            <div style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ opacity: 0.5 }}>📺</span> Watch a short ad to unlock your discount
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.4s ease" }}>
            {deal.offerCode ? (
              <>
                <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Show this code in store or quote when booking:</div>
                <div className="offer-code">{deal.offerCode}</div>
                <button onClick={copyCode} className="btn btn-ghost" style={{ alignSelf: "center" }}>
                  {copied ? "✅ Copied!" : "📋 Copy Code"}
                </button>
              </>
            ) : (
              <div style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>Quote &quot;LocalDeals&quot; when you visit or call to claim your offer:</div>
                {deal.business.phone && <div style={{ fontSize: 22, fontWeight: 800, color: "#0D9488" }}>{deal.business.phone}</div>}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 12, color: "var(--text-dim)", textAlign: "center" }}>🔥 {claimCount} people have claimed this deal</div>

        {deal.terms && (
          <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 8, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Terms & Conditions</div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>{deal.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
}
