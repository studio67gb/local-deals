export default function TermsPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Terms of Use</h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 40 }}>Last updated: 19 June 2026</p>

      {[
        {
          title: "1. Acceptance of Terms",
          body: `By accessing and using local-deals.uk, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.`,
        },
        {
          title: "2. About the Service",
          body: `Local Deals UK is a platform that connects consumers with exclusive offers from local independent businesses. We act as a directory service and are not party to any transaction between consumers and businesses listed on our platform.`,
        },
        {
          title: "3. Business Listings",
          body: `Businesses that register on Local Deals UK agree that:\n• All information provided is accurate and truthful\n• They have the right to offer the advertised deal\n• Offers will be honoured to consumers who present them\n• They will notify us if an offer expires or changes\n\nLocal Deals UK reserves the right to remove any listing that contains inaccurate information or violates these terms.`,
        },
        {
          title: "4. Consumer Use",
          body: `When claiming a deal through our platform, consumers understand that:\n• Deals are subject to the terms set by individual businesses\n• Local Deals UK is not responsible for the quality of products or services\n• Disputes regarding offers should be resolved directly with the business\n• Deals may expire or change at any time`,
        },
        {
          title: "5. Accuracy of Information",
          body: `While we strive to ensure all listings are accurate, Local Deals UK does not guarantee the accuracy, completeness, or timeliness of any information on this website. Business details including phone numbers, addresses, and offers may change without notice.`,
        },
        {
          title: "6. Advertising",
          body: `Our website displays advertisements served by Google AdSense. These ads are clearly separated from our editorial content. Local Deals UK is not responsible for the content of third-party advertisements.`,
        },
        {
          title: "7. Intellectual Property",
          body: `The Local Deals UK name, logo, and website design are our intellectual property. Business owners retain ownership of their own content (descriptions, offers) but grant us a licence to display it on our platform.`,
        },
        {
          title: "8. Limitation of Liability",
          body: `To the fullest extent permitted by law, Local Deals UK shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or reliance on any information provided herein.`,
        },
        {
          title: "9. Changes to Terms",
          body: `We reserve the right to modify these terms at any time. Continued use of the website after changes are posted constitutes your acceptance of the new terms.`,
        },
        {
          title: "10. Governing Law",
          body: `These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
        },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{section.title}</h2>
          <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{section.body}</div>
        </div>
      ))}
    </div>
  );
}
