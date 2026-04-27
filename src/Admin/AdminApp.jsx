import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSpaces from './pages/AdminSpaces';
import AdminContactQueries from './pages/AdminContactQueries';
import AdminSettings from './pages/AdminSettings';
import api from '../api/axios';

export default function AdminApp({ onBack }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activePage, setActivePage] = useState('dashboard');
  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(true);

  /* ── Responsive: track mobile breakpoint ── */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  /* On mobile the sidebar starts closed; on desktop it's always visible */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    api.get('/api/contact')
      .then(res => setQueries(res.data))
      .catch(err => console.error('Failed to load contact queries:', err))
      .finally(() => setQueriesLoading(false));
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
    /* Auto-close sidebar on mobile after navigation */
    if (isMobile) setSidebarOpen(false);
  };

  const renderPage = () => {
    if (activePage === 'dashboard') return <AdminDashboard queries={queries} queriesLoading={queriesLoading} />;
    if (activePage === 'users') return <AdminUsers />;
    if (activePage === 'spaces') return <AdminSpaces />;
    if (activePage === 'contact') return <AdminContactQueries queries={queries} setQueries={setQueries} />;
    if (activePage === 'settings') return <AdminSettings />;
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: isDark ? '#111111' : '#F3F4F6',
      color: isDark ? '#F8FAFC' : '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* ── Mobile backdrop overlay ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 55,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* ── Sidebar: fixed drawer on mobile, static on desktop ── */}
      <div style={{
        /* On mobile: fixed full-height drawer that slides in/out */
        position: isMobile ? 'fixed' : 'relative',
        left: 0, top: 0, bottom: 0,
        zIndex: isMobile ? 60 : 'auto',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform 0.25s ease',
        flexShrink: 0,
      }}>
        <AdminSidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onBack={onBack}
          queries={queries}
        />
      </div>

      {/* ── Main content area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        /* Responsive padding: tighter on mobile */
        padding: isMobile ? '20px 16px' : '32px 36px',
        minWidth: 0, /* Allow flex child to shrink below content size */
      }}>
        {/* ── Mobile top bar with hamburger ── */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {/* Hamburger icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#F0F0F0' : '#111827'} strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <img src="/shnoor-logo.png" alt="SHNOOR" style={{ width: 28, height: 28, borderRadius: 7 }} onError={e => { e.target.style.display = 'none'; }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#F0F0F0' : '#111827' }}>Admin Panel</span>
          </div>
        )}

        {renderPage()}
      </div>
    </div>
  );
}
