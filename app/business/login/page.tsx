"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const r = await fetch("/api/business/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      router.push("/business/dashboard");
    } else {
      const d = await r.json();
      setError(d.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#0D9488,#F43F5E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>🏪</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Business Portal</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Log in to manage your listing & share your deal</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Email Address</label>
              <input
                className="input"
                type="email"
                required
                autoFocus
                placeholder="you@yourbusiness.co.uk"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Password</label>
              <input
                className="input"
                type="password"
                required
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            {error && (
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "14px", marginTop: 4 }}>
              {loading ? "Logging in..." : "Login to My Dashboard →"}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Not registered yet?{" "}
              <a href="/register" style={{ color: "#0D9488", fontWeight: 600 }}>List your business free →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
