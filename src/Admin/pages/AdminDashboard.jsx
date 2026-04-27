import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../components/StatCard';
import api from '../../api/axios';

export default function AdminDashboard({ queries = [], queriesLoading = false }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const text = isDark ? '#F0F0F0' : '#111827';
  const secondary = isDark ? 'rgba(240,240,240,0.45)' : 'rgba(55,65,81,0.65)';
  const panelBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const border = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.8)';

  const [users, setUsers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/users/admin-all').then(r => r.data),
      api.get('/api/spaces').then(r => r.data),
    ])
      .then(([usersData, spacesData]) => {
        setUsers(usersData);
        setSpaces(spacesData);
      })
      .catch(err => console.error('Dashboard data fetch failed:', err))
      .finally(() => setDataLoading(false));
  }, []);

  const activeUsers = users.filter(u => u.is_active).length;
  const unread = queries.filter(q => q.status === 'unread').length;

  // Most recently joined users for the preview list
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentQueries = [...queries].slice(0, 3);

  const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669', '#DC2626'];
  const avatarColor = (id) => avatarColors[id.charCodeAt(0) % avatarColors.length];

  if (dataLoading || queriesLoading) {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: secondary, margin: '6px 0 0' }}>Loading...</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 10, background: isDark ? '#1A1A1A' : '#e5e7eb', opacity: 0.5 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: text, margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: secondary, margin: '6px 0 0' }}>Overview of SHNOOR Workspace</p>
      </div>

      {/* Stat cards — all real data */}
      <div style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Users" value={users.length} accentColor="#0D9488" />
        <StatCard label="Active Users" value={activeUsers} accentColor="#10B981" />
        <StatCard label="Total Spaces" value={spaces.length} accentColor="#3B82F6" />
        <StatCard label="Unread Queries" value={unread} accentColor="#F59E0B" />
      </div>

      {/* Recently joined users */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: text, marginBottom: 14, marginTop: 0 }}>
          Recently joined
        </h2>
        <div style={{ background: panelBg, border, borderRadius: 10, overflow: 'hidden' }}>
          {recentUsers.length === 0 && (
            <div style={{ padding: '20px 16px', color: secondary, fontSize: 13 }}>No users yet.</div>
          )}
          {recentUsers.map((u, idx) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12,
              borderBottom: idx < recentUsers.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(226,232,240,0.8)') : 'none',
            }}>
              {u.avatar_url ? (
                <img src={u.avatar_url} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: avatarColor(u.id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
                }}>
                  {initials(u.name)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: text, fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                <div style={{ color: secondary, fontSize: 12 }}>{u.email}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 500,
                background: u.role === 'admin' ? 'rgba(13,148,136,0.15)' : 'rgba(107,114,128,0.1)',
                color: u.role === 'admin' ? '#0D9488' : secondary,
              }}>
                {u.role}
              </span>
              {!u.is_active && (
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: '#EF4444', fontWeight: 500 }}>
                  Inactive
                </span>
              )}
              <div style={{ fontSize: 12, color: secondary, whiteSpace: 'nowrap' }}>
                {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent contact queries */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: text, marginBottom: 14, marginTop: 0 }}>
          Recent contact queries
        </h2>
        <div style={{ background: panelBg, border, borderRadius: 10, overflow: 'hidden' }}>
          {recentQueries.length === 0 && (
            <div style={{ padding: '20px 16px', color: secondary, fontSize: 13 }}>No queries yet.</div>
          )}
          {recentQueries.map((q, idx) => (
            <div key={q.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', gap: 12,
              borderBottom: idx < recentQueries.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(226,232,240,0.8)') : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: text, fontSize: 13, fontWeight: 500 }}>{q.name}</div>
                <div style={{ color: secondary, fontSize: 12 }}>{q.subject}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={q.status} />
                <span style={{ fontSize: 11, color: secondary, whiteSpace: 'nowrap' }}>
                  {new Date(q.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    unread: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    read: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
    resolved: { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  };
  const s = map[status] || map.read;
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: s.bg, color: s.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}