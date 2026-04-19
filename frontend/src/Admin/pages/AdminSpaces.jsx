import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getSpaces, createSpace, deleteSpaceAPI, getSpaceMembers, removeSpaceMember, addSpaceMember } from '../../api/spaces';
import { useToast } from '../../context/ToastContext';

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function AdminSpaces() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === 'dark';
  const panelBg   = isDark ? '#1A1A1A' : '#FFFFFF';
  const text      = isDark ? '#F0F0F0' : '#111827';
  const secondary = isDark ? 'rgba(240,240,240,0.65)' : 'rgba(75,85,99,0.85)';
  const border    = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.85)';
  const rowBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(226,232,240,0.85)';
  const inputBg   = isDark ? '#111827' : '#F9FAFB';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(226,232,240,0.85)';

  const [spaces, setSpaces]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [name, setName]             = useState('');
  const [desc, setDesc]             = useState('');
  const [creating, setCreating]     = useState(false);

  // Members modal state
  const [membersModal, setMembersModal]     = useState(null);
  const [members, setMembers]               = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Add member input
  const [addEmail, setAddEmail]   = useState('');
  const [adding, setAdding]       = useState(false);

  useEffect(() => {
    getSpaces()
      .then(data => setSpaces(data.map(s => ({
        id: s.id, name: s.name, description: s.description || '',
        member_count: s.member_count,
        created_by: s.created_by_name || 'Admin',
        created_at: new Date(s.created_at).toLocaleDateString(),
      }))))
      .catch(() => showToast('Failed to load spaces', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateSpace = async () => {
    if (!name.trim()) return showToast('Space name is required', 'error');
    setCreating(true);
    try {
      const created = await createSpace(name.trim(), desc.trim());
      setSpaces(prev => [{
        id: created.id, name: created.name, description: created.description || '',
        member_count: 1, created_by: 'You',
        created_at: new Date(created.created_at).toLocaleDateString(),
      }, ...prev]);
      setShowModal(false);
      setName(''); setDesc('');
      showToast(`Space #${created.name} created`, 'success');
    } catch (err) {
      showToast(err.response?.status === 409 ? 'Space name already exists' : 'Failed to create space', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSpace = async (id, spaceName) => {
    if (!window.confirm(`Delete "#${spaceName}"? All messages will be permanently removed.`)) return;
    try {
      await deleteSpaceAPI(id);
      setSpaces(prev => prev.filter(s => s.id !== id));
      showToast(`Space #${spaceName} deleted`, 'success');
    } catch {
      showToast('Failed to delete space', 'error');
    }
  };

  const openMembersModal = async (spaceId, spaceName) => {
    setMembersModal({ spaceId, spaceName });
    setAddEmail('');
    setMembersLoading(true);
    try {
      const data = await getSpaceMembers(spaceId);
      setMembers(data);
    } catch {
      showToast('Failed to load members', 'error');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!addEmail.trim()) return showToast('Enter an email address', 'error');
    if (!addEmail.includes('@shnoor.com')) return showToast('Must be a @shnoor.com email', 'error');
    setAdding(true);
    try {
      const result = await addSpaceMember(membersModal.spaceId, addEmail.trim().toLowerCase());
      // Re-fetch members to get full user object
      const data = await getSpaceMembers(membersModal.spaceId);
      setMembers(data);
      setSpaces(prev => prev.map(s =>
        s.id === membersModal.spaceId ? { ...s, member_count: data.length } : s
      ));
      setAddEmail('');
      showToast(`${result.user?.name || addEmail} added to #${membersModal.spaceName}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message;
      showToast(msg || 'Failed to add member. Check the email is registered.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this space?`)) return;
    try {
      await removeSpaceMember(membersModal.spaceId, userId);
      setMembers(prev => prev.filter(m => m.id !== userId));
      setSpaces(prev => prev.map(s =>
        s.id === membersModal.spaceId ? { ...s, member_count: s.member_count - 1 } : s
      ));
      showToast(`${userName} removed`, 'success');
    } catch {
      showToast('Failed to remove member', 'error');
    }
  };

  if (loading) return <p style={{ color: text, fontSize: 13 }}>Loading spaces...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: text, margin: 0 }}>Spaces</h1>
          <p style={{ fontSize: 14, color: secondary, margin: '6px 0 0' }}>
            Create and manage workspace channels
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#0D9488', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          Create Space
        </button>
      </div>

      <div style={{ background: panelBg, border, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 2fr 1fr 2fr', padding: '12px 16px', fontSize: 11, color: secondary, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: rowBorder, fontWeight: 500 }}>
          <div>Space</div><div>Description</div><div>Members</div>
          <div>Created By</div><div>Created</div><div>Actions</div>
        </div>

        {spaces.length === 0 && (
          <div style={{ padding: '20px 16px', color: secondary, fontSize: 13 }}>
            No spaces yet. Create one above.
          </div>
        )}

        {spaces.map(space => (
          <div key={space.id} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 2fr 1fr 2fr', padding: '14px 16px', alignItems: 'center', borderBottom: rowBorder }}>
            <div style={{ color: '#0D9488', fontSize: 13, fontWeight: 500 }}>#{space.name}</div>
            <div style={{ fontSize: 13, color: secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {space.description || '—'}
            </div>
            <div>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(13,148,136,0.15)', color: '#0D9488', fontWeight: 600 }}>
                {space.member_count}
              </span>
            </div>
            <div style={{ fontSize: 13, color: text }}>{space.created_by}</div>
            <div style={{ fontSize: 12, color: secondary }}>{space.created_at}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => openMembersModal(space.id, space.name)}
                style={{ background: 'transparent', border: inputBorder, color: isDark ? '#aaa' : '#475569', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
              >
                Members
              </button>
              <button
                onClick={() => handleDeleteSpace(space.id, space.name)}
                style={{ background: '#EF4444', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Space Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: panelBg, padding: 28, borderRadius: 12, width: 420, border }}>
            <h3 style={{ color: text, margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Create a new space</h3>
            <input
              placeholder="Space name (e.g. engineering)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateSpace()}
              style={{ width: '100%', marginBottom: 10, padding: '9px 12px', borderRadius: 7, border: inputBorder, background: inputBg, color: text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Description (optional)"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              style={{ width: '100%', marginBottom: 18, padding: '9px 12px', borderRadius: 7, border: inputBorder, background: inputBg, color: text, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => { setShowModal(false); setName(''); setDesc(''); }}
                style={{ background: 'transparent', border: inputBorder, color: secondary, padding: '8px 16px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpace}
                disabled={creating}
                style={{ background: '#0D9488', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontWeight: 500, opacity: creating ? 0.7 : 1 }}
              >
                {creating ? 'Creating...' : 'Create Space'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal — with Add Member input at the top */}
      {membersModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: panelBg, borderRadius: 12, width: 460, border, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: rowBorder }}>
              <h3 style={{ color: text, margin: 0, fontSize: 15, fontWeight: 600 }}>
                #{membersModal.spaceName} — Members ({members.length})
              </h3>
              <button onClick={() => setMembersModal(null)} style={{ background: 'none', border: 'none', color: secondary, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            {/* Add member input */}
            <div style={{ padding: '14px 20px', borderBottom: rowBorder, background: isDark ? '#111' : '#f8fafc' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: secondary, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
                Add member
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                  placeholder="name@shnoor.com"
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 7,
                    border: inputBorder, background: inputBg,
                    color: text, fontSize: 13, outline: 'none',
                  }}
                />
                <button
                  onClick={handleAddMember}
                  disabled={adding}
                  style={{
                    background: '#0D9488', color: '#fff', border: 'none',
                    padding: '8px 16px', borderRadius: 7, fontSize: 13,
                    cursor: adding ? 'not-allowed' : 'pointer',
                    fontWeight: 500, opacity: adding ? 0.7 : 1, whiteSpace: 'nowrap',
                  }}
                >
                  {adding ? 'Adding...' : '+ Add'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: secondary, margin: '6px 0 0' }}>
                Person must have logged in with their @shnoor.com account at least once.
              </p>
            </div>

            {/* Members list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {membersLoading ? (
                <p style={{ padding: '20px', color: secondary, fontSize: 13, textAlign: 'center' }}>Loading...</p>
              ) : members.length === 0 ? (
                <p style={{ padding: '20px', color: secondary, fontSize: 13, textAlign: 'center' }}>No members yet. Add someone above.</p>
              ) : members.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: rowBorder }}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {initials(member.name)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: text }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: secondary }}>{member.email}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, marginRight: 6, background: member.role === 'admin' ? 'rgba(13,148,136,0.15)' : 'rgba(107,114,128,0.1)', color: member.role === 'admin' ? '#0D9488' : secondary }}>
                    {member.role}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    style={{ background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}