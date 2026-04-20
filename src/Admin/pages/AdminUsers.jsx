import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getAllUsersAdmin, updateUserRole, updateUserStatus } from '../../api/users';

const avatarColors = ['#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669', '#DC2626'];
const avatarColor  = (id) => avatarColors[id.charCodeAt(0) % avatarColors.length];
const initials     = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function AdminUsers() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const panelBg   = isDark ? '#1A1A1A' : '#FFFFFF';
  const text       = isDark ? '#F0F0F0' : '#111827';
  const secondary  = isDark ? 'rgba(240,240,240,0.6)' : 'rgba(107,114,128,0.85)';
  const border     = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.85)';

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    // getAllUsersAdmin returns all users including inactive, so the Inactive tab works
    getAllUsersAdmin()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = ['All', 'Admins', 'Members', 'Inactive'];

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab === 'All'      ? true :
      activeTab === 'Admins'   ? u.role === 'admin' :
      activeTab === 'Members'  ? u.role === 'member' && u.is_active :
      activeTab === 'Inactive' ? !u.is_active : true;
    return matchSearch && matchTab;
  });

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    try {
      const updated = await updateUserRole(user.id, newRole);
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const updated = await updateUserStatus(user.id, !user.is_active);
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (loading) {
    return <p style={{ color: text, fontSize: 13 }}>Loading users...</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: text, margin: 0 }}>Users</h1>
          <p style={{ fontSize: 14, color: secondary, margin: '6px 0 0' }}>
            Manage workspace members and their roles
          </p>
        </div>
        <input
          placeholder="Search users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: panelBg, border, padding: '8px 14px', borderRadius: 8, color: text, fontSize: 13, outline: 'none', width: 220 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            fontSize: 13, padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: activeTab === tab ? 'rgba(13,148,136,0.15)' : 'transparent',
            color: activeTab === tab ? '#0D9488' : secondary,
            fontWeight: activeTab === tab ? 600 : 400,
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ background: panelBg, border, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 2fr 100px 110px 110px 200px',
          padding: '11px 16px',
          fontSize: 11, color: secondary,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.85)',
          fontWeight: 500,
        }}>
          <div>Name</div><div>Email</div><div>Role</div>
          <div>Status</div><div>Joined</div><div>Actions</div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '20px 16px', color: secondary, fontSize: 13 }}>
            No users match your search.
          </div>
        )}

        {filtered.map((user, idx) => (
          <div key={user.id} style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 2fr 100px 110px 110px 200px',
            padding: '13px 16px', alignItems: 'center',
            borderBottom: idx < filtered.length - 1
              ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(226,232,240,0.8)')
              : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: avatarColor(user.id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {initials(user.name)}
                </div>
              )}
              <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{user.name}</span>
            </div>

            <div style={{ fontSize: 13, color: secondary }}>{user.email}</div>

            <div>
              <span style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 500,
                background: user.role === 'admin' ? 'rgba(13,148,136,0.15)' : 'rgba(107,114,128,0.1)',
                color: user.role === 'admin' ? '#0D9488' : secondary,
              }}>
                {user.role}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0, background: user.is_active ? '#10B981' : '#6B7280' }} />
              <span style={{ fontSize: 12, color: user.is_active ? '#10B981' : secondary }}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ fontSize: 12, color: secondary }}>
              {new Date(user.created_at).toLocaleDateString()}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleRoleToggle(user)} style={btnPrimary}>
                {user.role === 'admin' ? 'Make Member' : 'Make Admin'}
              </button>
              <button
                onClick={() => handleStatusToggle(user)}
                style={user.is_active ? btnDanger : btnSuccess}
              >
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const base = { border: 'none', padding: '6px 11px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnPrimary = { ...base, background: '#0D9488', color: '#fff' };
const btnDanger  = { ...base, background: '#EF4444', color: '#fff' };
const btnSuccess = { ...base, background: '#10B981', color: '#fff' };