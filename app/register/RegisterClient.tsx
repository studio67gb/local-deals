"use client";
import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import B2BFAQ from "@/components/B2BFAQ";
import B2BComparison from "@/components/B2BComparison";

const CATEGORIES = ["Restaurant & Food","Beauty & Hair","Health & Fitness","Retail & Shopping","Trades & Services","Entertainment","Automotive","Other"];
const PLAN_LABELS: Record<string, string> = { standard: "Standard — £5/mo", featured: "Featured — £15/mo" };
const PLAN_COLORS: Record<string, string> = { standard: "#0D9488", featured: "#F43F5E" };

function RegisterForm() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [dealImageFile, setDealImageFile] = useState<File | null>(null);
  
  // Search state
  const [searchResults, setSearchResults] = useState<{name:string, companyNumber:string, addressSnippet:string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState({
    ownerName: "", ownerEmail: "", ownerPassword: "", ownerPasswordConfirm: "",
    name: "", category: "Restaurant & Food",
    area: "Doncaster", description: "", phone: "", website: "", address: "",
    instagram: "", facebook: "",
    offerTitle: "", offerDescription: "", offerCode: "", offerTerms: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search effect
  useEffect(() => {
    if (!form.name || form.name.length < 3 || !showDropdown) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/companies-house/search?q=${encodeURIComponent(form.name)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.name, showDropdown]);

  const selectCompany = async (companyNumber: string, companyName: string) => {
    setShowDropdown(false);
    set("name", companyName);
    
    try {
      const res = await fetch(`/api/companies-house/profile?companyNumber=${encodeURIComponent(companyNumber)}`);
      if (res.ok) {
        const profile = await res.json();
        setForm(f => ({
          ...f,
          address: profile.address || f.address,
          area: profile.locality || f.area,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.ownerPassword !== form.ownerPasswordConfirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    if (form.ownerPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    try {
      // Create business as pending
      const bizRes = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, category: form.category, area: form.area,
          description: form.description, phone: form.phone, email: form.ownerEmail,
          website: form.website, address: form.address,
          instagram: form.instagram, facebook: form.facebook,
          ownerName: form.ownerName, ownerEmail: form.ownerEmail,
          ownerPassword: form.ownerPassword,
          offerTitle: form.offerTitle, offerDescription: form.offerDescription,
          offerCode: form.offerCode, offerTerms: form.offerTerms,
        }),
      });
      if (!bizRes.ok) throw new Error("Failed to register business");
      const biz = await bizRes.json();

      // Upload logo if selected
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await fetch("/api/business/upload-logo", { method: "POST", body: fd });
      }

      // Upload deal image if selected
      if (dealImageFile && biz.deals && biz.deals.length > 0) {
        const dealId = biz.deals[0].id;
        const fd = new FormData();
        fd.append("image", dealImageFile);
        await fetch(`/api/business/deals/${dealId}/upload-image`, { method: "POST", body: fd });
      }

      // If paid plan selected, redirect to Stripe Checkout
      if (selectedPlan === "standard" || selectedPlan === "featured") {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: biz.id, tier: selectedPlan }),
        });
        if (checkoutRes.ok) {
          const { url } = await checkoutRes.json();
          window.location.href = url;
          return;
        }
      }
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (step === "done") return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>You&apos;re on the list!</h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          We&apos;ve received your registration for <strong style={{ color: "var(--text)" }}>{form.name}</strong>.
          Our team will review your listing and get it live within 24 hours.
        </p>
        <div style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>We&apos;ll email you at <strong style={{ color: "#0D9488" }}>{form.ownerEmail}</strong> once your listing is approved.</p>
        </div>
        <a href="/" className="btn btn-primary">Browse Local Deals →</a>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* SEO-Optimized B2B Hero */}
      <header style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `rgba(${selectedPlan === "featured" ? "244,63,94" : "13,148,136"},0.1)`, border: `1px solid rgba(${selectedPlan === "featured" ? "244,63,94" : "13,148,136"},0.2)`, borderRadius: 999, padding: "6px 16px", marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: PLAN_COLORS[selectedPlan] || "#0D9488", textTransform: "uppercase", letterSpacing: "0.06em" }}>🏪 {PLAN_LABELS[selectedPlan] || "B2B Advertising Platform"}</span>
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
          Advertise Your Independent UK Business on <span className="gradient-text">LocalDeals</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 600, margin: "0 auto", marginBottom: 32 }}>
          The premier platform for independent UK businesses to list local promotions, drive foot traffic on quiet weekdays, and connect with high-intent nearby customers.
        </p>
      </header>

      {/* Semantic B2B Benefits */}
      <section aria-labelledby="b2b-benefits" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 48 }}>
        {/* FIX: Removed display: "none". Uses standard layout-safe inline visual hiding for AI bots */}
        <h2 id="b2b-benefits" style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
          Advertising Benefits for Independent UK Businesses
        </h2>
        
        <article style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💷</div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Zero Upfront Costs</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>Start for free or upgrade to our highly competitive subscription pricing. No hidden fees or commissions on your deals.</p>
        </article>

        <article style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚶</div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Drive Foot Traffic</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>Turn quiet weekdays into busy trading days. Target locals precisely when your shop or restaurant needs them most.</p>
        </article>

        <article style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Lead Generation</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>A prominent listing acts as a 24/7 lead engine. Track clicks, deal claims, and engagement straight from your dashboard.</p>
        </article>
      </section>

      <B2BComparison />
      <B2BFAQ />

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Your Details */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>Your Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your Name *</label>
              <input className="input" required value={form.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your Email *</label>
              <input className="input" required type="email" value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)} placeholder="john@yourbusiness.com" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Create Password *</label>
              <input className="input" required type="password" minLength={8} autoComplete="new-password" value={form.ownerPassword} onChange={e => set("ownerPassword", e.target.value)} placeholder="Min. 8 characters" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Confirm Password *</label>
              <input className="input" required type="password" autoComplete="new-password" value={form.ownerPasswordConfirm} onChange={e => set("ownerPasswordConfirm", e.target.value)} placeholder="Repeat password" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-dim)" }}>You'll use these to log in and manage your deal at <strong>local-deals.uk/business/login</strong></p>
        </div>

        {/* Business Info */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Business Info</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ position: "relative" }} ref={dropdownRef}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Business Name *</label>
            <input 
              className="input" 
              required 
              value={form.name} 
              onChange={e => {
                set("name", e.target.value);
                setShowDropdown(true);
              }} 
              onFocus={() => setShowDropdown(true)}
              placeholder="e.g. Smith&apos;s Plumbing Services" 
            />
            {showDropdown && (form.name.length >= 3) && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, marginTop: 4, zIndex: 50, overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}>
                {isSearching ? (
                  <div style={{ padding: 12, fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>Searching Companies House...</div>
                ) : searchResults.length > 0 ? (
                  <div style={{ maxHeight: 250, overflowY: "auto" }}>
                    {searchResults.map(res => (
                      <div 
                        key={res.companyNumber} 
                        onClick={() => selectCompany(res.companyNumber, res.name)}
                        style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{res.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{res.addressSnippet}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 12, fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>No exact match. You can still use this name!</div>
                )}
              </div>
            )}
          </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Business Logo (Optional)</label>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setLogoFile(e.target.files?.[0] || null)} style={{ fontSize: 12, color: "var(--text-dim)", width: "100%" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Category *</label>
              <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Area (Town/City) *</label>
              <input className="input" required value={form.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Doncaster" />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>About Your Business *</label>
            <textarea className="input" required rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tell customers what you do and why you&apos;re great..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Phone Number</label>
              <input className="input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01302 000000" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Website</label>
              <input className="input" type="url" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://yourbusiness.co.uk" />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Full Address (for map pin) *</label>
            <input className="input" required value={form.address} onChange={e => set("address", e.target.value)} placeholder="12 High Street, Doncaster, DN1 1AA" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Instagram Handle</label>
              <input className="input" value={form.instagram} onChange={e => set("instagram", e.target.value)} placeholder="@yourbusiness" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Facebook Page</label>
              <input className="input" value={form.facebook} onChange={e => set("facebook", e.target.value)} placeholder="yourbusiness" />
            </div>
          </div>
        </div>

        {/* Their Offer */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Exclusive Offer</h2>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>What deal will you offer LocalDeals customers?</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Offer Headline *</label>
              <input className="input" required value={form.offerTitle} onChange={e => set("offerTitle", e.target.value)} placeholder="e.g. 20% Off Your First Visit" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Deal Image (Optional)</label>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setDealImageFile(e.target.files?.[0] || null)} style={{ fontSize: 12, color: "var(--text-dim)", width: "100%" }} />
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Full Offer Details *</label>
            <textarea className="input" required rows={2} value={form.offerDescription} onChange={e => set("offerDescription", e.target.value)} placeholder="Describe the full details of your offer..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Offer Code (optional)</label>
              <input className="input" value={form.offerCode} onChange={e => set("offerCode", e.target.value)} placeholder="e.g. LOCALDEALS20" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Terms (optional)</label>
              <input className="input" value={form.offerTerms} onChange={e => set("offerTerms", e.target.value)} placeholder="New customers only..." />
            </div>
          </div>
        </div>

        {error && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "18px 24px", fontSize: 16, ...(selectedPlan === "featured" ? { background: "linear-gradient(135deg, #F43F5E, #7c3aed)" } : {}) }}>
          {loading ? "Submitting..." : selectedPlan !== "free" ? `Register & Subscribe — ${PLAN_LABELS[selectedPlan]}` : "Submit My Listing — It's Free"}
        </button>
        <p style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
          Your listing will be reviewed and live within 24 hours. No payment required.
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
