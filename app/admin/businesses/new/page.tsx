'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Restaurant & Food', 'Beauty & Hair', 'Health & Fitness',
  'Retail & Shopping', 'Trades & Services', 'Entertainment', 'Automotive', 'Other',
];

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#0D9488', marginLeft: 3 }}>*</span>}
    </label>
  );
}

export default function NewBusinessPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', category: 'Restaurant & Food', area: 'Doncaster',
    description: '', phone: '', email: '', website: '', address: '', instagram: '', facebook: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const slug = toSlug(form.name);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const r = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Add New Business</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Fill in the business details. You can add deals separately after.</p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Core info */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Business Info</h2>

          <div>
            <Label required>Business Name</Label>
            <input id="biz-name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Bella's Kitchen" />
            {slug && (
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                URL slug: <span style={{ color: '#fb923c', fontFamily: 'monospace' }}>{slug}</span>
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label required>Category</Label>
              <select id="biz-category" className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label required>Town / City</Label>
              <input id="biz-area" className="input" required value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Manchester" />
            </div>
          </div>

          <div>
            <Label required>Description</Label>
            <textarea id="biz-description" className="input" required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical' }} placeholder="A brief description of the business…" />
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Contact Details</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Phone</Label>
              <input id="biz-phone" className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+44 7700 000000" />
            </div>
            <div>
              <Label>Email</Label>
              <input id="biz-email" className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="hello@business.com" />
            </div>
          </div>

          <div>
            <Label>Website URL</Label>
            <input id="biz-website" className="input" type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://yourbusiness.com" />
          </div>

          <div>
            <Label>Address</Label>
            <input id="biz-address" className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 High Street, Doncaster, DN1 1AA" />
          </div>
        </div>

        {/* Social */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Social Media</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Instagram</Label>
              <input id="biz-instagram" className="input" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourbusiness" />
            </div>
            <div>
              <Label>Facebook</Label>
              <input id="biz-facebook" className="input" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} placeholder="facebook.com/yourbusiness" />
            </div>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/admin" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</a>
          <button id="biz-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '16px 24px', fontSize: 15 }}>
            {loading ? 'Saving…' : '✓ Save Business'}
          </button>
        </div>
      </form>
    </div>
  );
}
