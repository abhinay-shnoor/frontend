import { useTheme } from "../context/ThemeContext";

export default function CookiePolicyPage({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sections = [
    {
      title: "1. What Are Cookies?",
      content: `Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site.\n\nCookies are widely used to make websites work more efficiently and to provide useful information to website owners.`
    },
    {
      title: "2. How We Use Cookies",
      content: `Shnoor International uses cookies to:\n• Keep you signed in to your workspace session\n• Remember your theme preference (light or dark mode)\n• Understand how you navigate and use our platform\n• Improve performance and load times\n• Provide security features that protect your account\n• Analyze aggregated usage data to improve our services`
    },
    {
      title: "3. Types of Cookies We Use",
      content: `Essential Cookies: These are necessary for the platform to function. They enable core features like authentication, security, and session management. Without these, the service cannot be provided.\n\nPreference Cookies: These remember your settings and preferences (such as dark mode) so you don't have to re-enter them every visit.\n\nAnalytics Cookies: These help us understand how users interact with our platform, which pages are most visited, and where we can improve the experience. Data is collected in an anonymized and aggregated form.\n\nSecurity Cookies: These help detect fraudulent activity and protect your account from unauthorized access.`
    },
    {
      title: "4. Third-Party Cookies",
      content: `We may use third-party services such as analytics providers that set their own cookies. These third parties have their own privacy policies and we do not control how they use cookies. We ensure any third parties we work with comply with applicable data protection laws.`
    },
    {
      title: "5. Managing Cookies",
      content: `You can control and manage cookies in several ways:\n• Browser Settings: Most browsers allow you to view, manage, block, or delete cookies through their settings menu.\n• Opt-Out Tools: Some analytics providers offer opt-out tools.\n\nPlease note that disabling certain cookies may affect the functionality of the Shnoor Workspace platform — for example, you may not be able to stay logged in.`
    },
    {
      title: "6. Cookie Retention",
      content: `Session cookies expire when you close your browser. Persistent cookies remain on your device for a set period — typically 30 days for authentication, and up to 1 year for preference cookies. You can delete cookies at any time via your browser settings.`
    },
    {
      title: "7. Updates to This Policy",
      content: `We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. We will notify you of significant changes by posting a notice on the platform or via email. Continued use of the platform after changes constitutes acceptance of the updated policy.`
    },
    {
      title: "8. Contact Us",
      content: `If you have any questions about our use of cookies, please contact us:\n\nEmail: privacy@shnoor.com\nShnoor International LLC\nHyderabad, Telangana, India`
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "#FEF3C7", color: "#D4952D" }}>
            Legal
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Cookie Policy</h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className={`mt-4 text-base leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            This Cookie Policy explains how Shnoor International LLC ("Shnoor", "we", "us") uses cookies and similar technologies when you use the Shnoor Workspace platform. By using our platform, you consent to the use of cookies as described in this policy.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <div key={index} className={`pb-10 border-b last:border-0 ${isDark ? "border-white/10" : "border-gray-100"}`}>
              <h2 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{section.title}</h2>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-gray-400" : "text-gray-600"}`}>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}