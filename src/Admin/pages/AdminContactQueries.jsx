import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getContactQueries, updateQueryStatus } from '../../api/contact';

export default function AdminContactQueries({ queries, setQueries }) {
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const text      = isDark ? '#F0F0F0' : '#111827';
  const secondary = isDark ? 'rgba(240,240,240,0.45)' : 'rgba(75,85,99,0.8)';
  const cardBg    = isDark ? '#181818' : '#F8FAFC';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.85)';

  const [localQueries, setLocalQueries] = useState(queries || []);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => {
    getContactQueries()
      .then(data => {
        setLocalQueries(data);
        if (setQueries) setQueries(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    unread:   localQueries.filter(q => q.status === 'unread').length,
    read:     localQueries.filter(q => q.status === 'read').length,
    resolved: localQueries.filter(q => q.status === 'resolved').length,
  };

  const displayed = localQueries.filter(q => filter === 'all' ? true : q.status === filter);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateQueryStatus(id, status);
      const update = (prev) => prev.map(q => q.id === updated.id ? { ...q, status: updated.status } : q);
      setLocalQueries(update);
      if (setQueries) setQueries(update);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleCardClick = (q) => {
    if (q.status === 'unread') handleStatusChange(q.id, 'read');
  };

  const tabs = ['all', 'unread', 'read', 'resolved'];

  if (loading) {
    return <p style={{ color: text, fontSize: 13 }}>Loading queries...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: text, margin: 0 }}>Contact Queries</h1>
        <p style={{ fontSize: 14, color: secondary, margin: '6px 0 12px' }}>
          Messages submitted through the landing page contact form
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill label="Unread"   value={counts.unread}   color="#F59E0B" />
          <Pill label="Read"     value={counts.read}     color={secondary} />
          <Pill label="Resolved" value={counts.resolved} color="#10B981" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.85)' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} style={{
            fontSize: 13, padding: '8px 14px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: filter === tab ? text : secondary,
            fontWeight: filter === tab ? 600 : 400,
            borderBottom: filter === tab ? '2px solid #0D9488' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayed.length === 0 && (
          <div style={{ background: cardBg, border: cardBorder, borderRadius: 10, padding: '24px 20px', color: secondary, fontSize: 13, textAlign: 'center' }}>
            No {filter !== 'all' ? filter : ''} queries.
          </div>
        )}

        {displayed.map(q => (
          <div
            key={q.id}
            onClick={() => handleCardClick(q)}
            style={{
              background: cardBg, border: cardBorder, borderRadius: 10, padding: '18px 20px',
              cursor: q.status === 'unread' ? 'pointer' : 'default',
              borderLeft: q.status === 'unread' ? '3px solid #F59E0B' : cardBorder,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <span style={{ color: text, fontSize: 14, fontWeight: 600 }}>{q.name}</span>
                <span style={{ color: secondary, fontSize: 12, marginLeft: 8 }}>{q.email}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <StatusBadge status={q.status} />
                <span style={{ fontSize: 11, color: 'rgba(240,240,240,0.35)' }}>
                  {new Date(q.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 500, color: text, marginBottom: 8 }}>{q.subject}</div>
            <div style={{ fontSize: 13, color: secondary, lineHeight: 1.6, marginBottom: 14 }}>{q.message}</div>

            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
              {q.status === 'unread' && (
                <button onClick={() => handleStatusChange(q.id, 'read')} style={btnPrimary}>
                  Mark as Read
                </button>
              )}
              {q.status !== 'resolved' && (
                <button onClick={() => handleStatusChange(q.id, 'resolved')} style={btnGhost(isDark)}>
                  Mark as Resolved
                </button>
              )}
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', fontSize: 12, color }}>
      <span style={{ fontWeight: 700 }}>{value}</span>
      <span style={{ opacity: 0.8 }}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    unread:   { bg: 'rgba(245,158,11,0.18)',  color: '#F59E0B' },
    read:     { bg: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,240,0.55)' },
    resolved: { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  };
  const s = map[status] || map.read;
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: s.bg, color: s.color, fontWeight: 600 }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const btnPrimary = { background: '#0D9488', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const btnGhost = (isDark) => ({
  background: 'transparent',
  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.15)',
  color: isDark ? 'rgba(240,240,240,0.65)' : '#374151',
  padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
});