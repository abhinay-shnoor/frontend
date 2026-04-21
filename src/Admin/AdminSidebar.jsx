import { useTheme } from '../context/ThemeContext';

export default function AdminSidebar({ activePage, onNavigate, onBack, queries }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sidebarBg = isDark ? '#0A0A0A' : '#F8FAFC';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const textPrimary = isDark ? '#F8FAFC' : '#111827';
  const textSecondary = isDark ? 'rgba(240,240,240,0.65)' : 'rgba(107,114,128,0.8)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)';
  const activeBg = isDark ? 'rgba(13,148,136,0.12)' : 'rgba(13,148,136,0.14)';
  const activeColor = isDark ? '#F0F0F0' : '#065F46';
  const unreadCount = queries.filter(q => q.status === 'unread').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',       icon: <HouseIcon /> },
    { id: 'users',     label: 'Users',            icon: <PeopleIcon /> },
    { id: 'spaces',    label: 'Spaces',           icon: <SpacesIcon /> },
    { id: 'contact',   label: 'Contact Queries',  icon: <MailIcon />, badge: unreadCount },
    { id: 'settings',  label: 'Settings',         icon: <GearIcon /> },
  ];

  return (
    <div style={{
      width: 220,
      minWidth: 220,
      background: sidebarBg,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: `1px solid ${sidebarBorder}`,
      height: '100vh',
    }}>

      <div>

        {/* Logo */}
        <div style={{ padding: '22px 18px 16px' }}>
          <img
            src="/shnoor-logo.png"
            alt="SHNOOR"
            style={{ width: 110, display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <p style={{
            fontSize: 10,
            color: '#0D9488',
            marginTop: 6,
            letterSpacing: '0.12em',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            Admin Panel
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 8px' }} />

        {/* Nav items */}
        <nav style={{ padding: '4px 8px' }}>
          {navItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  marginBottom: 2,
                  color: isActive ? activeColor : textSecondary,
                  borderLeft: isActive ? '2px solid #0D9488' : '2px solid transparent',
                  background: isActive ? activeBg : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                  userSelect: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                <span style={{ fontSize: 13, flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{
                    background: '#0D9488',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: 999,
                    lineHeight: 1.4,
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div
          onClick={onBack}
          style={{
            fontSize: 12,
            color: textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = isDark ? 'rgba(240,240,240,0.75)' : '#111827'}
          onMouseLeave={e => e.currentTarget.style.color = textSecondary}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Workspace
        </div>
      </div>
    </div>
  );
}


function HouseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  );
}

function SpacesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
