"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(17, 24, 39, 0.92)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 24px", height: "60px",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #0284C7, #16A34A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "white"
        }}>L</div>
        <span style={{ fontWeight: 800, fontSize: 17, color: "#F9FAFB", fontFamily: "'Montserrat', sans-serif" }}>Local<span style={{ color: "#16A34A" }}>Deals</span></span>
      </Link>
      
      {/* Desktop Menu */}
      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link href="/map" style={{ color: "#cbd5e1", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>🗺️ Map</Link>
        <Link href="/blog" style={{ color: "#cbd5e1", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>📰 Blog</Link>
        <Link href="/pricing" style={{ color: "#cbd5e1", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>💰 Pricing</Link>
        <Link href="/about" style={{ color: "#cbd5e1", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>About</Link>
        <Link href="/business/login" style={{ color: "#cbd5e1", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>Business Login</Link>
        <Link href="/admin" style={{ color: "#cbd5e1", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>Admin Login</Link>
        <Link href="/register" className="btn btn-orange" style={{ padding: "8px 18px", fontSize: 13 }}>List Your Business</Link>
      </div>

      {/* Mobile Hamburger */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ display: "none", background: "none", border: "none", color: "var(--text)", fontSize: 24, cursor: "pointer" }}
        className="show-mobile"
        aria-label="Toggle Navigation"
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{
          position: "absolute", top: 60, left: 0, right: 0,
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
          padding: 20, display: "flex", flexDirection: "column", gap: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          <Link href="/map" onClick={() => setIsOpen(false)} style={{ color: "#cbd5e1", fontSize: 16, textDecoration: "none", fontWeight: 500 }}>🗺️ Map</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} style={{ color: "#cbd5e1", fontSize: 16, textDecoration: "none", fontWeight: 500 }}>📰 Blog</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} style={{ color: "#cbd5e1", fontSize: 16, textDecoration: "none", fontWeight: 500 }}>💰 Pricing</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} style={{ color: "#cbd5e1", fontSize: 16, textDecoration: "none", fontWeight: 500 }}>About</Link>
          <Link href="/business/login" onClick={() => setIsOpen(false)} style={{ color: "#cbd5e1", fontSize: 16, textDecoration: "none", fontWeight: 500 }}>Business Login</Link>
          <Link href="/admin" onClick={() => setIsOpen(false)} style={{ color: "#cbd5e1", fontSize: 16, textDecoration: "none", fontWeight: 500 }}>Admin Login</Link>
          <Link href="/register" onClick={() => setIsOpen(false)} className="btn btn-orange" style={{ padding: "12px", justifyContent: "center" }}>List Your Business</Link>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .show-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
