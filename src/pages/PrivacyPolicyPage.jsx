import { useTheme } from "../context/ThemeContext";

export default function PrivacyPolicyPage({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, send messages, or contact support. This includes your name, email address, password (hashed), profile information, and any content you create within the platform.

We also automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, operating system, referring URLs, device identifiers, and cookie data.`
    },
    {
      title: "2. How We Use Your Information",
      content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Send technical notices, updates, and security alerts
• Respond to your comments and questions
• Monitor and analyze usage patterns to improve user experience
• Detect and prevent fraudulent activity and abuse`
    },
    {
      title: "3. Data Sharing and Disclosure",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
• With your consent or at your direction
• With service providers who assist in our operations, under strict confidentiality obligations
• To comply with legal obligations or valid legal process
• To protect the rights, property, or safety of Shnoor International, our users, or the public`
    },
    {
      title: "4. Data Security",
      content: `We implement industry-standard security measures to protect your data, including 256-bit AES encryption for data at rest, TLS 1.3 for data in transit, and regular security audits. While we strive to protect your information, no security system is impenetrable, and we cannot guarantee absolute security.`
    },
    {
      title: "5. Data Retention",
      content: `We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time. Some information may be retained as required by applicable law or for legitimate business purposes.`
    },
    {
      title: "6. Your Rights",
      content: `Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your data; the right to data portability; the right to object to or restrict processing; and the right to withdraw consent at any time. Contact us at privacy@shnoor.com to exercise these rights.`
    },
    {
      title: "7. Cookies",
      content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.`
    },
    {
      title: "8. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.`
    },
    {
      title: "9. Contact Us",
      content: `If you have any questions about this Privacy Policy, please contact us at:
Shnoor International LLC
Email: privacy@shnoor.com
Website: www.shnoor.com`
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-md ${isDark ? "bg-gray-900/95 border-white/10" : "bg-white/95 border-gray-100 shadow-sm"}`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/shnoor-logo.png" alt="Shnoor" className="h-8 w-8 object-contain rounded-lg" />
            <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Shnoor International</span>
          </div>
          <button
            onClick={() => onNavigate("landing")}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "#E0F2F1", color: "#0D9488" }}>
            Legal
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Privacy Policy</h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Last updated: January 1, 2025 · Effective: January 1, 2025
          </p>
          <p className={`mt-4 text-base leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            At Shnoor International LLC, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share information when you use our Shnoor Workspace platform and related services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((s, i) => (
            <div key={i} className={`pb-10 border-b last:border-0 ${isDark ? "border-white/10" : "border-gray-100"}`}>
              <h2 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{s.title}</h2>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {s.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
