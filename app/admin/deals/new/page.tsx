'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type Business = { id: number; name: string; area: string };

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#f97316', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function NewDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('businessId') ?? '';

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState({
    businessId: preselected, title: '', description: '',
    offerCode: '', terms: '', expiresAt: '', featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/businesses').then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : [];
      setBusinesses(list);
      if (!preselected && list.length > 0) {
        setForm((f) => ({ ...f, businessId: String(list[0].id) }));
      }
    });
  }, [preselected]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const r = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, businessId: parseInt(form.businessId) }),
    });
    if (r.ok) {
      router.push('/admin');
    } else {
      setError('Failed to save. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
      <a href="/admin" className="btn btn-ghost" style={{ marginBottom: 28, display: 'inline-flex' }}>← Back to Admin</a>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Add New Deal</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Create an exclusive offer for a registered business.</p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Business selector */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Select Business</h2>
          <div>
            <Label required>Business</Label>
            <select id="deal-business" className="input" required value={form.businessId} onChange={(e) => set('businessId', e.target.value)}>
              <option value="">Select a business…</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.area}</option>
              ))}
            </select>
            {businesses.length === 0 && (
              <p style={{ fontSize: 12, color: '#fb923c', marginTop: 8 }}>
                No businesses found.{' '}
                <a href="/admin/businesses/new" style={{ color: '#f97316', fontWeight: 700 }}>Add one first →</a>
              </p>
            )}
          </div>
        </div>

        {/* Deal details */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Deal Details</h2>
          <div>
            <Label required>Deal Title</Label>
            <input id="deal-title" className="input" required placeholder="e.g. 20% Off Your First Visit" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <Label required>Description</Label>
            <textarea id="deal-description" className="input" required rows={4} placeholder="Full details of the offer…" value={form.description} onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Code & terms */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Offer Code & Terms</h2>
          <div>
            <Label>Offer Code</Label>
            <input id="deal-offer-code" className="input" placeholder="e.g. FIRST20 (leave blank if not applicable)" value={form.offerCode} onChange={(e) => set('offerCode', e.target.value)} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />
          </div>
          <div>
            <Label>Terms & Conditions</Label>
            <textarea id="deal-terms" className="input" rows={2} placeholder="New customers only. Cannot be combined with other offers." value={form.terms} onChange={(e) => set('terms', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Options */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Options</h2>
          <div>
            <Label>Expiry Date</Label>
            <input id="deal-expires" className="input" type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
          </div>

          {/* Featured toggle */}
          <label id="deal-featured-label" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: 44, height: 24, flexShrink: 0 }}>
              <input
                id="deal-featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 999,
                background: form.featured ? 'linear-gradient(135deg, #f97316, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s',
              }} />
              <span style={{
                position: 'absolute', top: 3, left: form.featured ? 23 : 3, width: 18, height: 18,
                borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>⭐ Featured Deal</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Appears at top of feed with a gradient banner</div>
            </div>
          </label>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/admin" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</a>
          <button id="deal-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '16px 24px', fontSize: 15 }}>
            {loading ? 'Saving…' : '✓ Publish Deal →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewDealPage() {
  return (
    <Suspense>
      <NewDealForm />
    </Suspense>
  );
}
