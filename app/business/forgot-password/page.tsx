"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const r = await fetch("/api/business/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (r.ok) {
      setDone(true);
    } else {
      const data = await r.json();
      setError(data.error || "Failed to request password reset");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Check your email</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
            If an account exists for <strong style={{ color: "var(--text)" }}>{email}</strong>, we have sent a password reset link.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 32 }}>
            (Note: since this is a demo environment, check your server console for the reset link!)
          </p>
          <Link href="/business/login" className="btn btn-ghost" style={{ justifyContent: "center", width: "100%" }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div className="card" style={{ maxWidth: 400, width: "100%", padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>Forgot Password</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
          Enter the email address associated with your business account to receive a reset link.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Email Address</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
          </div>

          {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "14px", marginTop: 8 }}>
            {loading ? "Sending..." : "Send Reset Link →"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13 }}>
          <Link href="/business/login" style={{ color: "#0D9488", textDecoration: "none", fontWeight: 700 }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
