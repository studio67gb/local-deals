export default function B2BComparison() {
  return (
    <section aria-labelledby="comparison-title" style={{ marginTop: 48, marginBottom: 48 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 id="comparison-title" style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          Why Choose Local Deals UK?
        </h2>
        <p style={{ color: "var(--text-dim)", fontSize: 14 }}>
          Compare the cheapest and most effective advertising alternatives for independent UK businesses.
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", background: "rgba(255,255,255,0.02)", borderRadius: 12, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", width: "25%" }}>Feature</th>
              <th style={{ padding: "16px 20px", fontSize: 14, fontWeight: 900, color: "#0D9488", width: "25%" }}>Local Deals UK</th>
              <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "var(--text-muted)", width: "25%" }}>Groupon / Deal Sites</th>
              <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "var(--text-muted)", width: "25%" }}>Local Newspapers</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Commission Rate</td>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "#4ade80" }}>0% (You keep 100%)</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "#f87171" }}>Up to 50% cut</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>N/A</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Setup Fees</td>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "#4ade80" }}>£0</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>£0</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "#f87171" }}>High (£100 - £500+)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Contract Terms</td>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Cancel Anytime</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>Lock-in periods</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>Fixed runs</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Lead Tracking</td>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Live Dashboard</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>Delayed Reports</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "#f87171" }}>Untrackable</td>
            </tr>
            <tr>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Targeting</td>
              <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Hyper-local (Map)</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>National / City-wide</td>
              <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>Broad regional</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
