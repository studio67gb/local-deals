"use client";
import { useState, useEffect, useCallback } from "react";

interface Business {
  id: number;
  name: string;
  category: string;
  area: string;
  active: boolean;
  status: string;
  promoStatus: string | null;
  promoShareUrl: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  address: string | null;
  tier: string;
  _count: { deals: number };
}
interface Stats { businesses: number; deals: number; claimsToday: number; pending: number; }

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) { onLogin(); }
    else { setError("Wrong password"); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#0D9488,#F43F5E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin Login</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>LocalDeals Dashboard</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input className="input" type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
          {error && <p style={{ fontSize: 12, color: "#f87171", textAlign: "center" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [approving, setApproving] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [s, b] = await Promise.all([
      fetch("/api/admin/stats").then(r => r.json()),
      fetch("/api/admin/all-businesses").then(r => r.json()),
    ]);
    setStats(s);
    setBusinesses(b);
  }, []);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => {
      if (r.ok) { setAuthed(true); load(); }
      else setAuthed(false);
    }).catch(() => setAuthed(false));
  }, [load]);

  const handleApprove = async (id: number, action: "approve" | "reject") => {
    setApproving(id);
    await fetch(`/api/admin/businesses/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
    setApproving(null);
  };

  const handlePromo = async (id: number, action: "approve" | "reject") => {
    setApproving(id);
    await fetch(`/api/admin/promo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: id, action }),
    });
    await load();
    setApproving(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`CRITICAL WARNING: Are you sure you want to completely delete "${name}" and all of its deals? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' });
    if (r.ok) {
      await load();
    } else {
      alert("Failed to delete business");
    }
  };

  if (authed === null) return <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Loading...</div>;
  if (!authed) return <LoginForm onLogin={() => { setAuthed(true); load(); }} />;

  const pending = businesses.filter(b => b.status === "pending");
  const pendingPromos = businesses.filter(b => b.promoStatus === "pending");
  const active = businesses.filter(b => b.status === "active");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Manage businesses and deals</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/admin/blog" className="btn btn-ghost" style={{ background: "rgba(255,255,255,0.05)" }}>📝 Manage Blog</a>
          <a href="/admin/businesses/new" className="btn btn-ghost">+ Add Business</a>
          <a href="/admin/deals/new" className="btn btn-primary">+ Add Deal</a>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Active Businesses", value: stats.businesses, icon: "🏪", color: "#0D9488" },
            { label: "Active Deals", value: stats.deals, icon: "🎁", color: "#F43F5E" },
            { label: "Claims Today", value: stats.claimsToday, icon: "🔥", color: "#4ade80" },
            { label: "Awaiting Approval", value: stats.pending, icon: "⏳", color: stats.pending > 0 ? "#fbbf24" : "#64748b" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderColor: s.value > 0 && s.label === "Awaiting Approval" ? "rgba(251,191,36,0.3)" : undefined }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pending approval queue */}
      {pending.length > 0 && (
        <div className="card" style={{ overflow: "hidden", marginBottom: 24, borderColor: "rgba(251,191,36,0.3)" }}>
          <div style={{ padding: "16px 24px", background: "rgba(251,191,36,0.06)", borderBottom: "1px solid rgba(251,191,36,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⏳</span>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24" }}>Pending Approval ({pending.length})</h2>
            <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto" }}>Review self-registered businesses</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Area</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontWeight: 700, color: "var(--text)" }}>{b.name}</span></td>
                    <td>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.ownerName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{b.ownerEmail}</div>
                    </td>
                    <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{b.category}</span></td>
                    <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{b.area}</span></td>
                    <td><span style={{ color: "var(--text-dim)", fontSize: 11 }}>{b.address || "—"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleApprove(b.id, "approve")}
                          disabled={approving === b.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          {approving === b.id ? "..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleApprove(b.id, "reject")}
                          disabled={approving === b.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Promo Queue */}
      {pendingPromos.length > 0 && (
        <div className="card" style={{ overflow: "hidden", marginBottom: 24, borderColor: "rgba(244,63,94,0.3)" }}>
          <div style={{ padding: "16px 24px", background: "rgba(244,63,94,0.06)", borderBottom: "1px solid rgba(244,63,94,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#a78bfa" }}>Pending Growth Promos ({pendingPromos.length})</h2>
            <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto" }}>Review social share links for 1 free month</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Share Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPromos.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontWeight: 700, color: "var(--text)" }}>{b.name}</span></td>
                    <td>
                      <a href={b.promoShareUrl!} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontSize: 12, fontWeight: 500 }}>
                        {b.promoShareUrl} ↗
                      </a>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handlePromo(b.id, "approve")}
                          disabled={approving === b.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          {approving === b.id ? "..." : "✓ Approve (1 Mo. Standard)"}
                        </button>
                        <button
                          onClick={() => handlePromo(b.id, "reject")}
                          disabled={approving === b.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active businesses table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Active Businesses</h2>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{active.length} live</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Plan</th>
                <th>Category</th>
                <th>Area</th>
                <th>Deals</th>
                <th>Map Pin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>No businesses yet. <a href="/admin/businesses/new" style={{ color: "#0D9488" }}>Add your first →</a></td></tr>
              ) : active.map(b => (
                <tr key={b.id} style={b.tier && b.tier !== 'free' ? { background: "rgba(13,148,136,0.03)" } : {}}>
                  <td><span style={{ fontWeight: 700, color: "var(--text)" }}>{b.name}</span></td>
                  <td>
                    {b.tier && b.tier !== 'free' ? (
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "3px 8px", borderRadius: 6, background: "rgba(13,148,136,0.15)", color: "#0D9488", border: "1px solid rgba(13,148,136,0.3)" }}>
                        {b.tier}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Free</span>
                    )}
                  </td>
                  <td><span style={{ color: "var(--text-muted)", fontSize: 13 }}>{b.category}</span></td>
                  <td><span style={{ color: "var(--text-muted)", fontSize: 13 }}>{b.area}</span></td>
                  <td><span style={{ fontWeight: 700, color: "#0D9488" }}>{b._count.deals}</span></td>
                  <td>
                    <span style={{ fontSize: 12, color: b.address ? "#4ade80" : "#f87171" }}>
                      {b.address ? "✓ Pinned" : "No address"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <a href={`/admin/businesses/${b.id}`} style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Edit</a>
                      <a href={`/admin/deals/new?businessId=${b.id}`} style={{ color: "#0D9488", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>+ Deal</a>
                      <button onClick={() => handleDelete(b.id, b.name)} style={{ background: "none", border: "none", padding: 0, color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
