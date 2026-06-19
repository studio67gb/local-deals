export default function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#f97316,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>🎁</div>
        <h1 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          About <span style={{ background: "linear-gradient(135deg,#f97316,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Local Deals UK</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
          We connect people with exclusive offers from independent businesses in their local area — across the whole of the UK.
        </p>
      </div>

      {/* Mission */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Our Mission</h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8 }}>
          Local Deals UK was built to help independent businesses compete. Big chains have massive marketing budgets — local shops, restaurants, tradespeople and services often don't. We level the playing field by giving every local business a free platform to showcase their exclusive offers to customers actively looking for deals nearby.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>How It Works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: "🏪", title: "Businesses Register Free", desc: "Local businesses sign up and list their exclusive offer. No cost, no commission, no contracts. We review every listing before it goes live." },
            { icon: "🗺️", title: "Customers Find Deals", desc: "Shoppers browse deals by category, search by town, or explore our interactive map to find offers from businesses near them anywhere in the UK." },
            { icon: "🎁", title: "Claim the Offer", desc: "Customers reveal the offer code or quote 'Local Deals' in store. It's that simple — no apps to download, no accounts to create." },
            { icon: "📊", title: "Track Performance", desc: "Businesses can see how many people have claimed their deal through our dashboard, helping them understand the impact of their listing." },
          ].map(s => (
            <div key={s.title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="card" style={{ padding: 32 }} id="contact">
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Contact Us</h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
          Have a question about listing your business, or want to report an issue with a deal? We&apos;re here to help.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🌐</span>
            <span>Website: <a href="https://local-deals.uk" style={{ color: "#f97316" }}>local-deals.uk</a></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <span>Based in Doncaster, South Yorkshire, UK</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🏪</span>
            <span>To list your business: <a href="/register" style={{ color: "#f97316" }}>local-deals.uk/register</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}
