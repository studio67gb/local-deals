"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Invalid Link</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>This password reset link is invalid or missing.</p>
        <Link href="/business/forgot-password" className="btn btn-primary">Request a new link</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const r = await fetch("/api/business/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (r.ok) {
      setSuccess(true);
    } else {
      const data = await r.json();
      setError(data.error || "Failed to reset password");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Password Reset Complete</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Your password has been successfully updated.</p>
        <button onClick={() => router.push("/business/login")} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Go to Login →
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>Reset Password</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
        Please enter your new password below.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>New Password</label>
          <input className="input" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Confirm New Password</label>
          <input className="input" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
        </div>

        {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "14px", marginTop: 8 }}>
          {loading ? "Saving..." : "Reset Password →"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div className="card" style={{ maxWidth: 400, width: "100%", padding: 32 }}>
        <Suspense fallback={<div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
