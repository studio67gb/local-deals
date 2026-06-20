export default function B2BFAQ() {
  const faqs = [
    {
      question: "How much does it cost to list a deal on Local Deals UK?",
      answer: "Listing your independent business and your first active deal is completely free with zero upfront costs and no commissions. For businesses wanting higher visibility, we offer highly competitive premium subscription pricing."
    },
    {
      question: "How do local customers find my shop or restaurant?",
      answer: "Our platform uses geographic targeting to show your deals to local customers actively searching the Local Deals UK map and directory. A prominent listing acts as a 24/7 lead engine to drive foot traffic directly to your door."
    },
    {
      question: "Is there a contract or commitment required?",
      answer: "No. There are no lock-in contracts or long-term commitments. You have complete control and can pause, edit, or remove your promotional deals at any time from your advertiser dashboard."
    },
    {
      question: "How does Local Deals UK help with quiet weekdays?",
      answer: "You can specify exactly when your deals are valid. Many of our independent merchants create time-sensitive or weekday-only promotions to specifically drive foot traffic during their quietest trading hours."
    }
  ];

  return (
    <div style={{ marginTop: 48, marginBottom: 48 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Frequently Asked Questions</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Everything you need to know about advertising with us.</p>
      </div>
      
      {/* Schema.org FAQPage JSON-LD injected alongside the visual component */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {faqs.map((faq, i) => (
          <details 
            key={i} 
            style={{ 
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid var(--border)", 
              borderRadius: 12, 
              padding: "16px 20px" 
            }}
          >
            <summary style={{ fontSize: 15, fontWeight: 700, cursor: "pointer", color: "var(--text)", outline: "none" }}>
              {faq.question}
            </summary>
            <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
