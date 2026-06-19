export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 40 }}>Last updated: 19 June 2026</p>

      {[
        {
          title: "1. Who We Are",
          body: `Local Deals UK ("we", "us", "our") operates the website local-deals.uk. We connect local consumers with exclusive offers from independent businesses across the United Kingdom. Our registered contact is available at the address provided on our Contact page.`,
        },
        {
          title: "2. Information We Collect",
          body: `We collect information you provide directly to us, such as when a business registers on our platform. This may include: business name, owner name, email address, phone number, business address, and website URL.\n\nWe also collect information automatically when you visit our site, including IP address, browser type, pages visited, and time spent on pages. This is standard web analytics data.`,
        },
        {
          title: "3. How We Use Your Information",
          body: `We use the information we collect to:\n• Operate and improve the Local Deals UK platform\n• Display your business listing and deals to consumers\n• Contact you regarding your listing\n• Comply with legal obligations\n\nWe do not sell your personal data to third parties.`,
        },
        {
          title: "4. Google AdSense & Advertising",
          body: `We use Google AdSense to display advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.\n\nYou may opt out of personalised advertising by visiting Google's Ads Settings at https://www.google.com/settings/ads. Alternatively, you can opt out of a third-party vendor's use of cookies by visiting the Network Advertising Initiative opt-out page at http://www.networkadvertising.org/managing/opt_out.asp.`,
        },
        {
          title: "5. Cookies",
          body: `We use cookies to:\n• Keep you logged in to your admin session\n• Enable Google AdSense advertising\n• Analyse site traffic via anonymised analytics\n\nBy using our site, you consent to our use of cookies in accordance with this policy. You can control cookies through your browser settings.`,
        },
        {
          title: "6. Google Maps",
          body: `Our site uses the Google Maps API to display business locations. Google's Privacy Policy governs the use of information collected by Google Maps. You can review Google's Privacy Policy at https://policies.google.com/privacy.`,
        },
        {
          title: "7. Data Retention",
          body: `We retain business listing information for as long as your listing is active on our platform. If you request removal of your listing, we will delete your personal data within 30 days, except where we are required to retain it for legal reasons.`,
        },
        {
          title: "8. Your Rights (UK GDPR)",
          body: `Under UK data protection law, you have rights including:\n• The right to access your personal data\n• The right to correct inaccurate data\n• The right to erasure ("right to be forgotten")\n• The right to restrict processing\n• The right to data portability\n\nTo exercise any of these rights, please contact us via our Contact page.`,
        },
        {
          title: "9. Third-Party Links",
          body: `Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to read the privacy policy of any site you visit.`,
        },
        {
          title: "10. Changes to This Policy",
          body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Your continued use of our site after changes are posted constitutes your acceptance of the updated policy.`,
        },
        {
          title: "11. Contact Us",
          body: `If you have any questions about this Privacy Policy or how we handle your personal data, please contact us through our Contact page at local-deals.uk/contact.`,
        },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{section.title}</h2>
          <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{section.body}</div>
        </div>
      ))}

      <div style={{ marginTop: 48, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
          This website uses Google AdSense. Google AdSense uses cookies to serve ads based on your visit to this and other websites.
          You may opt out of personalised advertising at <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" style={{ color: "#f97316" }}>Google Ads Settings</a>.
        </p>
      </div>
    </div>
  );
}
