"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Deal {
  id: number;
  title: string;
  description: string;
  offerCode: string | null;
  terms: string | null;
  expiresAt: string | null;
  claimCount: number;
  active: boolean;
}
interface Business {
  id: number;
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
  status: string;
  tier: string;
  stripeCustomerId: string | null;
  promoShareUrl: string | null;
  promoStatus: string | null;
  deals: Deal[];
}

const TIER_LIMITS: Record<string, number> = { free: 1, standard: 3, featured: 999 };
const TIER_COLORS: Record<string, string> = { free: "#94a3b8", standard: "#0D9488", featured: "#F43F5E" };
const TIER_LABELS: Record<string, string> = { free: "Free", standard: "Standard", featured: "Featured" };

// ─── Social Share Panel ───────────────────────────────────────────────────────
function buildCaption(biz: Business, deal: Deal): string {
  return `🎁 Exclusive deal from ${biz.name}!\n\n${deal.title}\n\n${deal.description}\n\n${deal.offerCode ? `Use code: ${deal.offerCode}\n\n` : ""}📍 ${biz.area} | Claim free on Local Deals UK 👇\nhttps://local-deals.uk/deal/${deal.id}`;
}

function SharePanel({ business, deal }: { business: Business; deal: Deal }) {
  const [copied, setCopied] = useState<string | null>(null);
  const url = `https://local-deals.uk/deal/${deal.id}`;
  const caption = buildCaption(business, deal);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" readOnly value={url} style={{ fontSize: 12, flex: 1 }} />
        <button onClick={() => copy(url, "link")} className="btn btn-ghost" style={{ whiteSpace: "nowrap", fontSize: 12 }}>
          {copied === "link" ? "✅ Copied!" : "📋 Copy Link"}
        </button>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Ready-to-post caption</div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 14, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{caption}</div>
        <button onClick={() => copy(caption, "caption")} className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12 }}>
          {copied === "caption" ? "✅ Copied!" : "📋 Copy Caption"}
        </button>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Share directly</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "WhatsApp", emoji: "💬", color: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(caption)}` },
            { label: "Facebook", emoji: "📘", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
            { label: "Twitter / X", emoji: "🐦", color: "#000", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(deal.title + " — " + url)}` },
            { label: "TikTok", emoji: "🎵", color: "#ff0050", href: null, onClick: () => copy(caption, "tiktok") },
            { label: "Instagram", emoji: "📸", color: "#E1306C", href: null, onClick: () => copy(caption, "instagram") },
          ].map(s => s.href ? (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: `${s.color}18`, border: `1px solid ${s.color}40`, color: s.color, textDecoration: "none" }}>
              {s.emoji} {s.label}
            </a>
          ) : (
            <button key={s.label} onClick={s.onClick}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: `${s.color}18`, border: `1px solid ${s.color}40`, color: s.color, cursor: "pointer" }}>
              {s.emoji} {s.label} {(copied === "tiktok" && s.label === "TikTok") || (copied === "instagram" && s.label === "Instagram") ? "✅" : "(Copy)"}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>📸 TikTok & Instagram — paste the copied caption into your post or story</p>
      </div>

      <div style={{ background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)", borderRadius: 10, padding: 14 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          💡 <strong style={{ color: "var(--text)" }}>Print a QR code</strong> to put on your counter, windows or leaflets:{" "}
          <a href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" style={{ color: "#0D9488" }}>Generate QR Code →</a>
        </p>
      </div>
    </div>
  );
}

// ─── Edit Deal Form ───────────────────────────────────────────────────────────
function EditDealForm({ deal, onSaved, onDeleted }: { deal: Deal; onSaved: (d: Deal) => void; onDeleted: (id: number) => void }) {
  const [form, setForm] = useState({
    title: deal.title, description: deal.description,
    offerCode: deal.offerCode || "", terms: deal.terms || "",
    expiresAt: deal.expiresAt ? new Date(deal.expiresAt).toISOString().split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await fetch(`/api/business/deals/${deal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { onSaved(await r.json()); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setLoading(false);
  };

  const deleteDeal = async () => {
    if (!confirm("Are you sure you want to delete this deal? This cannot be undone.")) return;
    setLoading(true);
    const r = await fetch(`/api/business/deals/${deal.id}`, { method: "DELETE" });
    if (r.ok) onDeleted(deal.id);
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[
        { label: "Offer Headline", key: "title", type: "text", required: true },
      ].map(f => (
        <div key={f.key}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{f.label}</label>
          <input className="input" required={f.required} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
        </div>
      ))}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Full Details</label>
        <textarea className="input" required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Offer Code</label>
          <input className="input" placeholder="e.g. SAVE20" value={form.offerCode} onChange={e => setForm(p => ({ ...p, offerCode: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Expiry Date</label>
          <input className="input" type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Terms & Conditions</label>
        <input className="input" placeholder="e.g. New customers only" value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-ghost" type="button" onClick={deleteDeal} disabled={loading} style={{ flex: 1, justifyContent: "center", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.05)" }}>
          Delete Deal
        </button>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 2, justifyContent: "center" }}>
          {saved ? "✅ Saved!" : loading ? "Saving..." : "Save Changes →"}
        </button>
      </div>
    </form>
  );
}

function CreateDealForm({ onSaved }: { onSaved: (d: Deal) => void }) {
  const [form, setForm] = useState({
    title: "", description: "",
    offerCode: "", terms: "",
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const r = await fetch("/api/business/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { onSaved(await r.json()); }
    else { const d = await r.json(); setError(d.error || "Failed to create deal"); }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <div style={{ color: "#f87171", fontSize: 13, background: "rgba(248,113,113,0.1)", padding: 12, borderRadius: 8 }}>{error}</div>}
      {[
        { label: "Offer Headline", key: "title", type: "text", required: true },
      ].map(f => (
        <div key={f.key}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{f.label}</label>
          <input className="input" required={f.required} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
        </div>
      ))}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Full Details</label>
        <textarea className="input" required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Offer Code</label>
          <input className="input" placeholder="e.g. SAVE20" value={form.offerCode} onChange={e => setForm(p => ({ ...p, offerCode: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Expiry Date</label>
          <input className="input" type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Terms & Conditions</label>
        <input className="input" placeholder="e.g. New customers only" value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "14px 24px" }}>
        {loading ? "Creating..." : "Create Deal →"}
      </button>
    </form>
  );
}

// ─── Profile / Logo / Socials ─────────────────────────────────────────────────
function ProfileTab({ business, onUpdated }: { business: Business; onUpdated: (b: Partial<Business>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logo);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    phone: business.phone || "", website: business.website || "",
    address: business.address || "", instagram: business.instagram || "",
    facebook: business.facebook || "", tiktok: business.tiktok || "",
    logo: business.logo || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview
    setLogoPreview(URL.createObjectURL(file));
    // Upload
    setUploading(true);
    const fd = new FormData();
    fd.append("logo", file);
    const r = await fetch("/api/business/upload-logo", { method: "POST", body: fd });
    if (r.ok) {
      const { logo } = await r.json();
      onUpdated({ logo });
    }
    setUploading(false);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/business/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { onUpdated(form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Logo uploader */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Business Logo</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Preview circle */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
              background: logoPreview ? "none" : "linear-gradient(135deg,#0D9488,#F43F5E)",
              border: "3px dashed rgba(13,148,136,0.4)",
              cursor: "pointer", position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 0.2s",
            }}
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" fill style={{ objectFit: "cover" }} sizes="80px" unoptimized />
            ) : (
              <span style={{ fontSize: 28 }}>🏪</span>
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn btn-ghost"
                style={{ fontSize: 13, marginBottom: 6 }}
                disabled={uploading}
              >
                {uploading ? "⏳ Uploading..." : logoPreview ? "🔄 Change Logo" : "📷 Upload Logo"}
              </button>
              <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>JPG, PNG or WebP · max 5MB<br />Square image works best (e.g. 400×400px)</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handleLogoChange} />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Paste Image URL</label>
              <input className="input" placeholder="https://example.com/logo.jpg" value={form.logo} onChange={(e) => { 
                setForm(p => ({ ...p, logo: e.target.value })); 
                setLogoPreview(e.target.value); 
              }} />
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>Paste a link to an existing image. Remember to click "Save Profile" below!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social links */}
      <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Contact & Social Links</div>

        {[
          { key: "phone", label: "Phone Number", placeholder: "07700 000000", emoji: "📞" },
          { key: "website", label: "Website URL", placeholder: "https://yourbusiness.com", emoji: "🌐" },
          { key: "address", label: "Business Address", placeholder: "12 High Street, Doncaster, DN1 1AA", emoji: "📍" },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{f.emoji} {f.label}</label>
            <input className="input" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}

        <div style={{ paddingTop: 4, borderTop: "1px solid var(--border)", marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>Social Media</div>
          {[
            { key: "tiktok", label: "TikTok Shop / Profile", placeholder: "https://www.tiktok.com/@yourbusiness", emoji: "🎵", color: "#ff0050" },
            { key: "instagram", label: "Instagram", placeholder: "@yourbusiness or full URL", emoji: "📸", color: "#E1306C" },
            { key: "facebook", label: "Facebook Page", placeholder: "https://facebook.com/yourbusiness", emoji: "📘", color: "#1877F2" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 5, color: f.color }}>
                {f.emoji} {f.label}
              </label>
              <input className="input" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ borderColor: form[f.key as keyof typeof form] ? `${f.color}40` : undefined }} />
            </div>
          ))}
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving} style={{ justifyContent: "center" }}>
          {saved ? "✅ Profile Saved!" : saving ? "Saving..." : "Save Profile →"}
        </button>
      </form>
    </div>
  );
}

// ─── Growth Hack Promo ────────────────────────────────────────────────────────
function GrowthPromo({ business, onUpdated }: { business: Business; onUpdated: (updates: Partial<Business>) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (business.tier !== "free" && business.promoStatus !== "pending") return null; // Only for free users, unless pending

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/business/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoShareUrl: url }),
    });
    if (r.ok) {
      onUpdated({ promoShareUrl: url, promoStatus: "pending" });
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: 28, background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(244,63,94,0.1))", border: "1px solid rgba(13,148,136,0.3)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ fontSize: 32 }}>🚀</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: "#0D9488" }}>Get 1 Month of Standard Plan for FREE</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
            Share your LocalDeals listing on your Facebook or Instagram page! Paste the link to your post below, and we'll upgrade you to the Standard plan (£5/mo value) free for 30 days!
          </p>

          {business.promoStatus === "pending" ? (
            <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, fontSize: 13, color: "#fbbf24", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
              ⏳ Your post is being reviewed! Check back soon.
            </div>
          ) : business.promoStatus === "approved" ? (
            <div style={{ padding: "10px 14px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: "#4ade80", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
              ✅ Approved! Enjoy your free month.
            </div>
          ) : business.promoStatus === "rejected" ? (
             <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
              ❌ We couldn't verify your post. Try again?
            </div>
          ) : null}

          {(!business.promoStatus || business.promoStatus === "rejected") && (
            <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
              <input 
                required 
                type="url" 
                placeholder="https://facebook.com/your-post" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                className="input" 
                style={{ flex: 1 }} 
              />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "0 16px" }}>
                {loading ? "Submitting..." : "Submit Proof →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function BusinessDashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"share" | "edit" | "create" | "profile" | "stats">("share");
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetch("/api/business/me")
      .then(r => { if (!r.ok) { router.push("/business/login"); return null; } return r.json(); })
      .then(d => { if (d) { setBusiness(d); setActiveDeal(d.deals?.[0] || null); setLoading(false); } });
  }, [router]);

  const logout = async () => { await fetch("/api/business/me", { method: "POST" }); router.push("/business/login"); };

  if (loading) return <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading your dashboard...</div>;
  if (!business) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo */}
          <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "linear-gradient(135deg,#0D9488,#F43F5E)", flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {business.logo
              ? <Image src={business.logo} alt={business.name} fill style={{ objectFit: "cover" }} sizes="56px" unoptimized />
              : <span style={{ fontSize: 24 }}>🏪</span>}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: "#0D9488", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Business Dashboard</span>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 999, background: `${TIER_COLORS[business.tier || "free"]}20`, color: TIER_COLORS[business.tier || "free"], border: `1px solid ${TIER_COLORS[business.tier || "free"]}40` }}>{TIER_LABELS[business.tier || "free"]} Plan</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 2 }}>{business.name}</h1>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{business.category} · {business.area}</div>
            {business.status === "pending" && (
              <div style={{ marginTop: 6, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#fbbf24", display: "inline-block" }}>⏳ Pending approval</div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(business.tier === "free" || business.tier === "standard" || !business.tier) && (
            <a href="/pricing" className="btn btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>⬆️ Upgrade</a>
          )}
          {business.stripeCustomerId && (
            <button onClick={async () => { const r = await fetch("/api/stripe/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: business.id }) }); if (r.ok) { const { url } = await r.json(); window.location.href = url; } }} className="btn btn-ghost" style={{ fontSize: 12, padding: "8px 16px" }}>💳 Billing</button>
          )}
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 13 }}>Log Out</button>
        </div>
      </div>

      <GrowthPromo business={business} onUpdated={(updates) => setBusiness({ ...business, ...updates })} />

      {/* Deal Limit Bar */}
      {(() => {
        const tier = business.tier || "free";
        const limit = TIER_LIMITS[tier] || 1;
        const used = business.deals.filter(d => d.active).length;
        const pct = Math.min((used / limit) * 100, 100);
        return (
          <div style={{ marginBottom: 28, padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>Active Deals: {used}/{limit === 999 ? "∞" : limit}</span>
              {tier !== "featured" && <a href="/pricing" style={{ fontSize: 11, color: "#0D9488", textDecoration: "none", fontWeight: 700 }}>Need more? Upgrade →</a>}
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#f87171" : TIER_COLORS[tier], borderRadius: 99, transition: "width 0.3s" }} />
            </div>
          </div>
        );
      })()}

      {/* Stats strip */}
      {activeDeal && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Claims", value: activeDeal.claimCount, icon: "🔥" },
            { label: "Status", value: activeDeal.active ? "Live" : "Pending", icon: "✅" },
            { label: "Expires", value: activeDeal.expiresAt ? new Date(activeDeal.expiresAt).toLocaleDateString("en-GB") : "Never", icon: "📅" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
          {([
            { key: "share", label: "📣 Share" },
            { key: "edit", label: "✏️ Manage Deals" },
            { key: "create", label: "➕ Create Deal" },
            { key: "profile", label: "🏪 Profile & Socials" },
            { key: "stats", label: "📊 My Listing" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "13px 8px", background: "none", border: "none", minWidth: 90,
              borderBottom: tab === t.key ? "2px solid #0D9488" : "2px solid transparent",
              color: tab === t.key ? "#0D9488" : "var(--text-muted)",
              fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: 28 }}>
          {tab === "share" && activeDeal && <SharePanel business={business} deal={activeDeal} />}
          {tab === "share" && !activeDeal && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>No active deal yet — pending admin approval.</div>}
          
          {tab === "edit" && activeDeal && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {business.deals.map(d => (
                <div key={d.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 20, borderRadius: 12 }}>
                  <EditDealForm deal={d} onSaved={updated => {
                    setBusiness(b => b ? { ...b, deals: b.deals.map(x => x.id === d.id ? updated : x) } : b);
                    if (activeDeal.id === d.id) setActiveDeal(updated);
                  }} onDeleted={() => {
                    const newDeals = business.deals.filter(x => x.id !== d.id);
                    setBusiness(b => b ? { ...b, deals: newDeals } : b);
                    if (activeDeal.id === d.id) setActiveDeal(newDeals[0] || null);
                  }} />
                </div>
              ))}
            </div>
          )}
          {tab === "edit" && !activeDeal && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>No active deal to edit yet.</div>}
          
          {tab === "create" && (
            <CreateDealForm onSaved={newDeal => {
              setBusiness(b => b ? { ...b, deals: [...b.deals, newDeal] } : b);
              if (!activeDeal) setActiveDeal(newDeal);
              setTab("edit");
            }} />
          )}
          {tab === "profile" && (
            <ProfileTab
              business={business}
              onUpdated={updates => setBusiness(b => b ? { ...b, ...updates } : b)}
            />
          )}
          {tab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Your Current Deal</h2>
              {activeDeal ? (
                <>
                  <div style={{ background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{activeDeal.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{activeDeal.description}</div>
                    {activeDeal.offerCode && <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "#0D9488" }}>{activeDeal.offerCode}</div>}
                  </div>
                  <a href={`/deal/${activeDeal.id}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>View Public Listing →</a>
                </>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your listing is pending admin approval.</p>
              )}
              <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 10, fontSize: 13, color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>Business details:</strong>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {business.phone && <span>📞 {business.phone}</span>}
                  {business.address && <span>📍 {business.address}</span>}
                  {business.website && <span>🌐 <a href={business.website} style={{ color: "#0D9488" }}>{business.website}</a></span>}
                  {business.tiktok && <span>🎵 <a href={business.tiktok} target="_blank" rel="noreferrer" style={{ color: "#ff0050" }}>TikTok</a></span>}
                  {business.instagram && <span>📸 {business.instagram}</span>}
                  {business.facebook && <span>📘 {business.facebook}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
