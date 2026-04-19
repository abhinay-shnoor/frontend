import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { submitContactQuery } from '../api/contact';


function Navbar({ onNavigate, scrollToContact }) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    // If scrollToContact prop is set (coming from workspace help link), scroll to contact section
    if (scrollToContact) {
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollToContact]);

  const navLinks = ['Home', 'Features', 'About', 'Contact'];
  const scrollTo = (id) => { setMenuOpen(false); document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' }); };

  const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
  const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? isDark ? 'bg-gray-900/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5'
        : isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
            <img src="/shnoor-logo.png" alt="Shnoor International" className="h-9 w-9 object-contain rounded-lg" />
            <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Shnoor <span style={{ color: '#D4952D' }}>International</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button key={link} onClick={() => scrollTo(link)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>{link}</button>
            ))}
          </div>

          {/* Right: theme toggle + single Get Started button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #0D9488, #0b8279)' }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className={`md:hidden p-2 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`} onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className={`md:hidden pb-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="pt-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <button key={link} onClick={() => scrollTo(link)} className={`px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}>{link}</button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 pt-3">
              <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
              <button onClick={() => { setMenuOpen(false); onNavigate('login'); }}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg"
                style={{ background: '#0D9488' }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Hero({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="home" className={`min-h-screen flex items-center pt-16 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "#E0F2F1", color: "#0D9488" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Now available for teams
          </div>

          <h1 className={`text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Your team,{" "}
            <span style={{ color: "#D4952D" }}>connected</span>{" "}
            in one place.
          </h1>

          <p className={`text-lg lg:text-xl leading-relaxed mb-10 max-w-xl ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Shnoor Workspace brings messaging, channels, and collaboration together —
            so your team can move faster and stay aligned.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="group flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0D9488, #0b8279)' }}
            >
              Get started free
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <div
            className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-dashed"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}
          >
            {[
              { value: "10K+", label: "Active users" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "256-bit", label: "Encryption" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold" style={{ color: "#D4952D" }}>{stat.value}</div>
                <div className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const features = [
    {
      title: "Real-time Messaging",
      desc: "Instant messages across channels, spaces, and direct chats — with zero lag and full message history.",
      color: "#0D9488",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: "Team Spaces",
      desc: "Organize conversations by project or department. Invite members, set roles, keep everyone in the loop.",
      color: "#D4952D",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "File Sharing",
      desc: "Drag and drop files directly into any conversation. Preview, download, and share with your whole team.",
      color: "#1B3A4B",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      ),
    },
    {
      title: "Smart Mentions",
      desc: "Never miss a message meant for you. @mentions with intelligent notifications, digests, and inbox.",
      color: "#0D9488",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      title: "Enterprise Security",
      desc: "End-to-end encryption, SSO, granular permissions, and audit logs built for enterprise compliance.",
      color: "#D4952D",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Analytics & Insights",
      desc: "Track engagement, activity trends, and team collaboration patterns.",
      color: "#1B3A4B",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className={`py-24 ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "#E0F2F1", color: "#0D9488" }}
          >
            Everything you need
          </div>
          <h2 className={`text-4xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Built for how teams actually work
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Every feature is designed to reduce friction and keep your team focused on what matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group p-6 rounded-2xl transition-all duration-300 border hover:shadow-lg hover:-translate-y-0.5 ${isDark
                  ? "bg-gray-900 border-white/10 hover:border-white/20"
                  : "bg-white border-gray-100 hover:border-gray-200"
                }`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: f.color + "15", color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className={`font-semibold text-base mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="about" className={`py-24 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "#FEF3C7", color: "#D4952D" }}
            >
              About Shnoor International
            </div>
            <h2 className={`text-4xl font-bold tracking-tight mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
              A platform built on trust and excellence
            </h2>
            <p className={`text-base leading-relaxed mb-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Shnoor International LLC is dedicated to empowering businesses with cutting-edge communication tools.
              We believe that great collaboration is the foundation of every successful organization.
            </p>
            <p className={`text-base leading-relaxed mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Our workspace platform combines simplicity with power — giving your team everything they need
              to communicate, coordinate, and achieve together.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: null, label: "Privacy First" },
                { icon: null, label: "Built for Speed" },
              ].map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
                >
              
                  <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl opacity-10"
              style={{ background: "linear-gradient(135deg, #0D9488, #1B3A4B)" }}
            />
            <div className={`relative rounded-3xl p-8 border ${isDark ? "bg-gray-800 border-white/10" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-4 mb-8">
                <img src="/shnoor-logo.png" alt="Shnoor" className="h-14 w-14 object-contain rounded-2xl shadow-lg" />
                <div>
                  <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Shnoor International</div>
                  <div className="text-sm" style={{ color: "#D4952D" }}>LLC.</div>
                </div>
              </div>
              <blockquote className={`text-base italic leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                "We build tools that bring people closer — because the best work happens when teams are truly connected."
              </blockquote>
              <div className={`mt-6 pt-6 border-t text-sm ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <span className="font-medium" style={{ color: "#0D9488" }}>— Shnoor International Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${isDark
      ? "bg-gray-800 border-white/10 text-white placeholder-gray-500"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
    }`;

  const handleChange = (key) => (e) => {
    setFormState(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitContactQuery(formState);
      setStatus("success");
      setFormState({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact submit error:", err);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className={`py-24 ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "#E0F2F1", color: "#0D9488" }}
          >
            Get in touch
          </div>
          <h2 className={`text-4xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            We'd love to hear from you
          </h2>
          <p className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Have questions about Shnoor Workspace? Our team is here to help.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className={`rounded-2xl p-8 border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100 shadow-sm"}`}>

            {status === "success" ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#E0F2F1" }}
                >
                  <svg className="w-8 h-8" style={{ color: "#0D9488" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Message sent!</h3>
                <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  We've received your message and will get back to you shortly.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm font-medium"
                  style={{ color: "#0D9488" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={handleChange("name")}
                      placeholder="John Doe"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      placeholder="john@company.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formState.subject}
                    onChange={handleChange("subject")}
                    placeholder="How can we help?"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Message
                  </label>
                  <textarea
                    value={formState.message}
                    onChange={handleChange("message")}
                    placeholder="Tell us more about your inquiry..."
                    rows={4}
                    required
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm font-medium" style={{ color: "#EF4444" }}>
                    Failed to send message. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #0D9488, #0b8279)",
                    opacity: status === "loading" ? 0.75 : 1,
                  }}
                >
                  {status === "loading" && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              { label: "Email", value: "hello@shnoor.com" },
              { label: "Location", value: "UAE & Worldwide" },
            ].map(item => (
              <div
                key={item.label}
                className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                  }`}
              >
                
                <div>
                  <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{item.label}</div>
                  <div className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const LEGAL_LINKS = [
  { label: "Privacy Policy", page: "privacy" },
  { label: "Terms & Conditions", page: "terms" },
  { label: "Cookie Policy", page: "cookie" },
  { label: "Security", page: "security" },
];

function Footer({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const legalLinks = [
    { label: "Privacy Policy", page: "privacy" },
    { label: "Terms & Conditions", page: "terms" },
    { label: "Cookie Policy", page: "cookie" },
    { label: "Security", page: "security" },
  ];

  return (
    <footer className={`pt-16 pb-8 border-t ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/shnoor-logo.png" alt="Shnoor" className="h-9 w-9 object-contain rounded-lg" />
              <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                Shnoor <span style={{ color: "#D4952D" }}>International</span>
              </span>
            </div>
            <p className={`text-sm leading-relaxed max-w-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Empowering teams worldwide with seamless communication and collaboration tools built for the modern workplace.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" aria-label="Twitter"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Company</h4>
            <ul className="space-y-2.5">
              {["About Us", "Careers", "Blog", "Press"].map(item => (
                <li key={item}>
                  <a href="#" className={`text-sm transition-colors hover:underline ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map(item => (
                <li key={item.label}>
                  <button
                    onClick={() => onNavigate(item.page)}
                    className={`text-sm transition-colors hover:underline text-left ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${isDark ? "border-white/10" : "border-gray-100"}`}>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            © {new Date().getFullYear()} Shnoor International LLC. All rights reserved.
          </p>
          <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
export default function LandingPage({ onNavigate, scrollToContact }) {
  return (
    <div>
      <Navbar onNavigate={onNavigate} scrollToContact={scrollToContact} />
      <main>
        <Hero onNavigate={onNavigate} />
        <Features />
        <About />
        <Contact />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}