export default function LoginPage({ onNavigate }) {
  const handleLogin = () => {
    // Use the Vercel env var so this works in production
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      {/* Logo + brand */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: "#fff",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            padding: 10,
          }}
        >
          <img
            src="/shnoor-logo.png"
            alt="SHNOOR"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#F5F5F5",
            margin: "0 0 8px",
            letterSpacing: "-0.3px",
          }}
        >
          SHNOOR Workspace
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            margin: 0,
            letterSpacing: "0.1px",
          }}
        >
          Internal communications platform
        </p>
      </div>

      {/* Sign in card */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "28px 28px 24px",
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 20px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Sign in with your SHNOOR Google account to continue
        </p>

        {/* Google sign in button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: "#fff",
            color: "#1f1f1f",
            border: "none",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            transition: "opacity 0.15s",
            letterSpacing: "0.1px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path
              d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
              fill="#FFC107"
            />
            <path
              d="M6.3 14.7l6.6 4.8C14.7 16 19.1 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.7 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              fill="#FF3D00"
            />
            <path
              d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
              fill="#4CAF50"
            />
            <path
              d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 37.4 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"
              fill="#1976D2"
            />
          </svg>
          Continue with Google
        </button>

        {/* Domain notice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            justifyContent: "center",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Restricted to @shnoor.com accounts only
          </span>
        </div>
      </div>

      {/* Back to landing */}
      <button
        onClick={() => onNavigate("landing")}
        style={{
          marginTop: 28,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.22)",
          fontSize: 13,
          cursor: "pointer",
          letterSpacing: "0.1px",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.22)")
        }
      >
        ← Back to home
      </button>
    </div>
  );
}