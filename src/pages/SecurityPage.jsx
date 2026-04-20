import { useTheme } from "../context/ThemeContext";

export default function SecurityPage({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sections = [
    {
      title: "1. Encryption",
      content: `All data transmitted between your device and the Shnoor Workspace servers is encrypted using TLS 1.3, the industry's latest standard for transport security. Data stored on our servers is encrypted at rest using AES-256 encryption.\n\nThis means your messages, files, and account information are protected whether they are being sent over the network or stored in our databases.`
    },
    {
      title: "2. Authentication & Access Control",
      content: `Shnoor uses secure password hashing (bcrypt) — we never store your password in plain text. Session tokens are cryptographically signed and expire automatically after periods of inactivity.\n\nAccess to your workspace is controlled through role-based permissions, ensuring members can only access spaces and conversations they are authorized to view.`
    },
    {
      title: "3. Account Security",
      content: `We recommend all users:\n• Use a strong, unique password (at least 12 characters, mixing letters, numbers, and symbols)\n• Never share your login credentials with others\n• Log out from shared or public devices after use\n• Keep your registered email address up to date\n\nIf you suspect unauthorized access to your account, contact support immediately at security@shnoor.com.`
    },
    {
      title: "4. Infrastructure Security",
      content: `Our infrastructure is hosted on enterprise-grade cloud providers with SOC 2 Type II certification. We implement:\n• Network firewalls and intrusion detection systems\n• Regular automated vulnerability scanning\n• Strict server access controls with least-privilege principles\n• Separate environments for development, staging, and production\n• Automated backups with point-in-time recovery`
    },
    {
      title: "5. Security Audits & Monitoring",
      content: `We conduct regular internal and third-party security audits of our platform and infrastructure. Our security team monitors systems 24/7 for anomalous activity, unauthorized access attempts, and potential data breaches.\n\nAll security events are logged and retained for audit purposes in compliance with applicable regulations.`
    },
    {
      title: "6. Data Breach Response",
      content: `In the unlikely event of a data breach, Shnoor International will:\n• Contain and investigate the incident immediately\n• Notify affected users within 72 hours where legally required\n• Provide clear information about what data was affected and what steps you should take\n• Cooperate fully with regulatory authorities as required\n\nWe take every potential security incident seriously and maintain an incident response plan that is tested regularly.`
    },
    {
      title: "7. Employee Access",
      content: `Access to customer data by Shnoor employees is strictly limited to those with a legitimate need (e.g., providing customer support). All employee access is logged, audited, and governed by a strict internal security policy. Employees undergo security training and background checks.`
    },
    {
      title: "8. Responsible Disclosure",
      content: `We believe in working with the security community to keep our platform safe. If you discover a security vulnerability, please report it responsibly:\n\nEmail: security@shnoor.com\n\nPlease include a description of the vulnerability, steps to reproduce it, and potential impact. We will acknowledge your report within 48 hours and work to resolve valid issues promptly. We do not pursue legal action against researchers who follow responsible disclosure guidelines.`
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "#E0F2F1", color: "#0D9488" }}>
            Legal
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Security</h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className={`mt-4 text-base leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            At Shnoor International, the security of your data is our highest priority. This page describes the security measures and practices we have in place to protect your information and maintain the integrity of the Shnoor Workspace platform.
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