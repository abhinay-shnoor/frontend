import { useTheme } from "../context/ThemeContext";

export default function TermsPage({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using Shnoor Workspace, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services. These terms apply to all users, including visitors, registered users, and premium subscribers.`
    },
    {
      title: "2. Description of Service",
      content: `Shnoor International LLC provides a team communication and collaboration platform ("Shnoor Workspace") that includes messaging, file sharing, team spaces, and related productivity features. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time with reasonable notice.`
    },
    {
      title: "3. Account Registration",
      content: `To access certain features, you must register for an account. You agree to:
• Provide accurate, current, and complete information
• Maintain the security of your account credentials
• Accept responsibility for all activities that occur under your account
• Notify us immediately of any unauthorized use of your account
• Not share your account with others or create multiple accounts for the same individual`
    },
    {
      title: "4. Acceptable Use Policy",
      content: `You agree not to use Shnoor Workspace to:
• Violate any applicable laws or regulations
• Transmit spam, chain letters, or unsolicited messages
• Upload or transmit malicious code or viruses
• Infringe on intellectual property rights
• Harass, threaten, or intimidate other users
• Collect user data without authorization
• Impersonate any person or entity
• Engage in any activity that disrupts or interferes with the service`
    },
    {
      title: "5. Intellectual Property",
      content: `All content, features, and functionality of Shnoor Workspace — including software, text, displays, images, and design — are owned by Shnoor International LLC and are protected by applicable intellectual property laws. You retain ownership of content you create, but grant us a license to use, host, and display such content to provide the services.`
    },
    {
      title: "6. Subscription and Payments",
      content: `Certain features of Shnoor Workspace are available on a subscription basis. By subscribing, you agree to pay the fees indicated for your chosen plan. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are provided at our discretion and in accordance with applicable consumer protection laws.`
    },
    {
      title: "7. Limitation of Liability",
      content: `To the maximum extent permitted by law, Shnoor International LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service. Our total liability for any claim shall not exceed the amount you paid us in the twelve months preceding the claim.`
    },
    {
      title: "8. Disclaimer of Warranties",
      content: `Shnoor Workspace is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure. You use the service at your own risk.`
    },
    {
      title: "9. Termination",
      content: `We may terminate or suspend your account at any time, with or without cause, with or without notice, including for violation of these Terms. Upon termination, your right to use the service ceases immediately. Provisions that by their nature should survive termination shall survive.`
    },
    {
      title: "10. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in the UAE.`
    },
    {
      title: "11. Changes to Terms",
      content: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of these Terms and, where appropriate, notifying you by email. Your continued use of the service after such changes constitutes your acceptance of the new Terms.`
    },
    {
      title: "12. Contact Information",
      content: `For questions about these Terms, contact us at:
Shnoor International LLC
Email: legal@shnoor.com
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
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "#FEF3C7", color: "#D4952D" }}>
            Legal
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Terms & Conditions</h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Last updated: January 1, 2025 · Effective: January 1, 2025
          </p>
          <p className={`mt-4 text-base leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Please read these Terms and Conditions carefully before using Shnoor Workspace. These terms govern your access to and use of our platform and services.
          </p>
        </div>

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
