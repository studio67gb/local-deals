"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
}

interface BizOption {
  id: number;
  name: string;
  deals: { id: number; title: string; active: boolean }[];
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [businesses, setBusinesses] = useState<BizOption[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    author: "Local Deals UK",
    businessIds: [] as string[],
    dealIds: [] as string[]
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => {
      if (r.ok) { setAuthed(true); loadPosts(); loadOptions(); }
      else router.push("/admin");
    }).catch(() => router.push("/admin"));
  }, [router]);

  const loadOptions = async () => {
    const r = await fetch("/api/admin/blog/options");
    if (r.ok) {
      const data = await r.json();
      setBusinesses(data.businesses || []);
    }
  };

  const loadPosts = async () => {
    // We can just fetch the public blog API, but since we are admin, we'll fetch everything
    const r = await fetch("/api/blog");
    if (r.ok) {
      const data = await r.json();
      setPosts(data.posts || []);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/blog/upload-image", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, imageUrl: data.url }));
      }
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // We will use the secure publish endpoint, but since we are in the browser, 
    // we need an admin-specific publish endpoint, OR we just use a server action.
    // To keep it simple, we will call an admin-specific API here.
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        setShowForm(false);
        setForm({ title: "", slug: "", content: "", excerpt: "", imageUrl: "", author: "Local Deals UK", businessIds: [], dealIds: [] });
        loadPosts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save post");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    loadPosts();
  };

  if (authed === null) return <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <a href="/admin" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: 24 }}>←</a>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Blog Manager</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginLeft: "auto" }}>
            + Write Post
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>New Blog Post</h2>
          <form onSubmit={submitPost} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>Title *</label>
              <input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} placeholder="e.g. 5 Best Cafes in Yorkshire" />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>URL Slug *</label>
              <input className="input" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. 5-best-cafes" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>Cover Image</label>
              {form.imageUrl ? (
                <div style={{ position: "relative", width: 200, height: 120, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => setForm({...form, imageUrl: ""})} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer" }}>×</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label className="btn btn-ghost" style={{ cursor: "pointer" }}>
                    {uploading ? "Uploading..." : "📁 Upload Image"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>Short Excerpt</label>
              <textarea className="input" rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="A short 1-2 sentence summary for the blog grid." />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>Content (Markdown or Text) *</label>
              <textarea className="input" required rows={12} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your full blog post here. You can use Markdown formatting..." style={{ fontFamily: "monospace" }} />
              
              {/* Shortcode Helper */}
              {(form.businessIds.length > 0 || form.dealIds.length > 0) && (
                <div style={{ marginTop: 12, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13, border: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>💡 Inline Shortcodes</div>
                  <p style={{ color: "var(--text-dim)", marginBottom: 12 }}>You can embed the businesses and deals you tagged directly *inside* your blog text! Just copy and paste these shortcodes exactly where you want the card to appear:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {form.businessIds.map(id => {
                      const b = businesses.find(bz => bz.id.toString() === id);
                      return b ? <code key={`b-${id}`} style={{ background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: 4, userSelect: "all" }}>[BUSINESS:{id}] - {b.name}</code> : null;
                    })}
                    {form.dealIds.map(id => {
                      let dTitle = id;
                      for (const bz of businesses) {
                        const dl = bz.deals.find(d => d.id.toString() === id);
                        if (dl) { dTitle = dl.title; break; }
                      }
                      return <code key={`d-${id}`} style={{ background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: 4, userSelect: "all" }}>[DEAL:{id}] - {dTitle}</code>;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>Tag Local Businesses</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {form.businessIds.map(id => {
                  const b = businesses.find(bz => bz.id.toString() === id);
                  return b ? (
                    <div key={id} style={{ padding: "4px 12px", background: "rgba(13,148,136,0.15)", border: "1px solid rgba(13,148,136,0.3)", borderRadius: 99, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      {b.name}
                      <button type="button" onClick={() => setForm({...form, businessIds: form.businessIds.filter(i => i !== id)})} style={{ background: "none", border: "none", color: "#0D9488", cursor: "pointer", padding: 0 }}>✕</button>
                    </div>
                  ) : null;
                })}
              </div>
              <select className="input" value="" onChange={e => {
                if (e.target.value && !form.businessIds.includes(e.target.value)) {
                  setForm({ ...form, businessIds: [...form.businessIds, e.target.value] });
                }
              }}>
                <option value="">+ Add Business Tag...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {form.businessIds.length > 0 && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>Tag Specific Deals</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {form.dealIds.map(id => {
                    // Find deal across all businesses
                    let dTitle = id;
                    for (const bz of businesses) {
                      const dl = bz.deals.find(d => d.id.toString() === id);
                      if (dl) { dTitle = dl.title; break; }
                    }
                    return (
                      <div key={id} style={{ padding: "4px 12px", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 99, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        {dTitle}
                        <button type="button" onClick={() => setForm({...form, dealIds: form.dealIds.filter(i => i !== id)})} style={{ background: "none", border: "none", color: "#F43F5E", cursor: "pointer", padding: 0 }}>✕</button>
                      </div>
                    );
                  })}
                </div>
                <select className="input" value="" onChange={e => {
                  if (e.target.value && !form.dealIds.includes(e.target.value)) {
                    setForm({ ...form, dealIds: [...form.dealIds, e.target.value] });
                  }
                }}>
                  <option value="">+ Add Deal Tag...</option>
                  {businesses.filter(b => form.businessIds.includes(b.id.toString())).map(b => (
                    <optgroup key={b.id} label={b.name}>
                      {b.deals.map(d => (
                        <option key={d.id} value={d.id}>{d.title} {d.active ? "" : "(Inactive)"}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Publishing..." : "Publish Post"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>No blog posts yet.</td></tr>
              ) : posts.map(p => (
                <tr key={p.id}>
                  <td>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "var(--text)", textDecoration: "none" }}>
                      {p.title} ↗
                    </a>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: p.published ? "rgba(74,222,128,0.15)" : "rgba(148,163,184,0.15)", color: p.published ? "#4ade80" : "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td><span style={{ color: "var(--text-dim)", fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
