'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const CATEGORIES = [
  'Restaurant & Food', 'Beauty & Hair', 'Health & Fitness',
  'Retail & Shopping', 'Trades & Services', 'Entertainment', 'Automotive', 'Other',
];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#0D9488', marginLeft: 3 }}>*</span>}
    </label>
  );
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [form, setForm] = useState({
    name: '', category: 'Restaurant & Food', area: '',
    description: '', phone: '', email: '', website: '', address: '', instagram: '', facebook: '',
    logo: '', status: '', active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/businesses/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setForm({
            name: d.name || '', category: d.category || 'Restaurant & Food', area: d.area || '',
            description: d.description || '', phone: d.phone || '', email: d.email || '', website: d.website || '',
            address: d.address || '', instagram: d.instagram || '', facebook: d.facebook || '',
            logo: d.logo || '', status: d.status || '', active: d.active
          });
          setDeals(d.deals || []);
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // 1. Upload logo if selected
    if (logoFile) {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("logo", logoFile);
      const logoRes = await fetch(`/api/admin/businesses/${id}/upload-logo`, {
        method: "POST",
        body: fd
      });
      setUploadingLogo(false);
      if (!logoRes.ok) {
        setError("Failed to upload logo. Business details were not saved.");
        setSaving(false);
        return;
      }
    }

    // 2. Save details
    const r = await fetch(`/api/admin/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    if (r.ok) {
      router.push('/admin');
    } else {
      setError('Failed to save details. Try again.');
      setSaving(false);
    }
  };

  const deleteDeal = async (dealId: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    const r = await fetch(`/api/admin/deals/${dealId}`, { method: 'DELETE' });
    if (r.ok) setDeals(deals.filter(d => d.id !== dealId));
    else alert("Failed to delete deal");
  };

  const deleteBusiness = async () => {
    if (!confirm("CRITICAL WARNING: Are you sure you want to completely delete this business and all of its deals? This cannot be undone.")) return;
    const r = await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' });
    if (r.ok) {
      router.push('/admin');
    } else {
      alert("Failed to delete business");
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
      <a href="/admin" className="btn btn-ghost" style={{ marginBottom: 28, display: 'inline-flex' }}>← Back to Admin</a>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Edit Business</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Update details and upload a logo for {form.name || "this business"}.</p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Logo Section */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Business Logo</h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {logoFile ? (
                <img src={URL.createObjectURL(logoFile)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : form.logo ? (
                <img src={form.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 24 }}>🏪</span>
              )}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <Label>Upload New Logo</Label>
                <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setLogoFile(e.target.files[0]);
                    setLogoError("");
                  }
                }} style={{ display: "block", fontSize: 13, color: "var(--text-muted)" }} />
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>JPG, PNG, WebP or GIF. Max 5MB.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div>
                <Label>Paste Image URL</Label>
                <input className="input" placeholder="https://example.com/logo.jpg" value={form.logo} onChange={(e) => { set('logo', e.target.value); setLogoFile(null); }} />
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>Paste a link to an existing image on the web.</p>
              </div>
              {logoError && <p style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{logoError}</p>}
            </div>
          </div>
        </div>

        {/* Core info */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Business Info</h2>

          <div>
            <Label required>Business Name</Label>
            <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label required>Category</Label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label required>Town / City</Label>
              <input className="input" required value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Manchester" />
            </div>
          </div>

          <div>
            <Label required>Description</Label>
            <textarea className="input" required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Contact Details</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Phone</Label>
              <input className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Website URL</Label>
            <input className="input" type="url" value={form.website} onChange={(e) => set('website', e.target.value)} />
          </div>

          <div>
            <Label>Address</Label>
            <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Full street address..." />
            <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>Changing this will automatically re-pin them on the map.</p>
          </div>
        </div>

        {/* Social */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Social Media</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Instagram</Label>
              <input className="input" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
            </div>
            <div>
              <Label>Facebook</Label>
              <input className="input" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
            </div>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={deleteBusiness} style={{ padding: '16px 24px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, color: '#f87171', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            Delete Business
          </button>
          <a href="/admin" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</a>
          <button className="btn btn-primary" type="submit" disabled={saving || uploadingLogo} style={{ flex: 2, justifyContent: 'center', padding: '16px 24px', fontSize: 15 }}>
            {uploadingLogo ? 'Uploading Logo…' : saving ? 'Saving…' : '✓ Save Changes'}
          </button>
        </div>
      </form>

      {/* Deals Management */}
      <div className="card" style={{ padding: 28, marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18, borderColor: "rgba(13,148,136,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Manage Deals</h2>
          <a href={`/admin/deals/new?businessId=${id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>+ Add Deal</a>
        </div>
        
        {deals.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No deals added yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {deals.map(deal => (
              <div key={deal.id} style={{ padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{deal.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>{deal.description}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
                    <span style={{ color: deal.active ? "#4ade80" : "#fbbf24" }}>{deal.active ? "● Live" : "● Pending"}</span>
                    <span>🔥 {deal.claimCount} claims</span>
                    {deal.offerCode && <span>🎟️ {deal.offerCode}</span>}
                  </div>
                </div>
                <button onClick={() => deleteDeal(deal.id)} style={{ padding: "6px 12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
