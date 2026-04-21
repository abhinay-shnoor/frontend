import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { updatePreferences } from '../../api/users.js';

export default function ChatSettingsModal({ onClose, currentUser }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const modalRef = useRef(null);

  const prefs = currentUser?.preferences || {};
  const [dmNotifs,     setDmNotifs]     = useState(prefs.dm_notifications     !== false);
  const [spaceNotifs,  setSpaceNotifs]  = useState(prefs.space_notifications   !== false);
  const [mentionOnly,  setMentionOnly]  = useState(prefs.mention_only          === true);
  const [soundEnabled, setSoundEnabled] = useState(prefs.notification_sounds   !== false);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    const onKey     = (e) => { if (e.key === 'Escape') onClose(); };
    const onOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOutside); };
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        dm_notifications:   dmNotifs,
        space_notifications: spaceNotifs,
        mention_only:        mentionOnly,
        notification_sounds: soundEnabled,
      });
    } catch {}
    setSaving(false);
    onClose();
  };

  const overlay = { position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' };
  const card    = { background: 'var(--ws-bg)', borderRadius: 14, width: 500, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', border: '0.5px solid var(--ws-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' };
  const header  = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '0.5px solid var(--ws-border)' };
  const section = { padding: '16px 20px 4px' };
  const label   = { fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' };
  const divider = { height: '0.5px', background: 'var(--ws-border)', margin: '6px 0 0' };

  return (
    <div style={overlay}>
      <div ref={modalRef} style={card}>
        <div style={header}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ws-text)', margin: 0 }}>Chat Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 18 }}>✕</button>
        </div>

        {/* Appearance */}
        <div style={section}>
          <p style={label}>Appearance</p>
          <ToggleRow
            label="Dark mode"
            description={`Currently ${isDark ? 'dark' : 'light'}. Toggle applies to all screens.`}
            checked={isDark}
            onChange={toggleTheme}
          />
        </div>
        <div style={divider} />

        {/* Notifications */}
        <div style={section}>
          <p style={label}>Notifications</p>
          <ToggleRow label="DM notifications"     description="Desktop alert for new direct messages"          checked={dmNotifs}     onChange={setDmNotifs} />
          <ToggleRow label="Space notifications"   description="Desktop alert for new messages in spaces"       checked={spaceNotifs}  onChange={setSpaceNotifs} />
          <ToggleRow label="Mentions only in spaces" description="Only notify when someone @mentions you"       checked={mentionOnly}  onChange={setMentionOnly} />
          <ToggleRow label="Notification sounds"   description="Play a sound when a notification arrives"      checked={soundEnabled} onChange={setSoundEnabled} />
        </div>
        <div style={divider} />

        {/* About */}
        <div style={section}>
          <p style={label}>About</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 8 }}>
            <InfoRow label="Version"   value="1.0.0" />
            <InfoRow label="Workspace" value="SHNOOR International" />
            <InfoRow label="Support"   value={<a href="mailto:support@shnoor.com" style={{ color: '#0D9488', textDecoration: 'none', fontSize: 13 }}>support@shnoor.com</a>} />
          </div>
        </div>

        {/* Save */}
        <div style={{ padding: '12px 20px 16px', borderTop: '0.5px solid var(--ws-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', fontSize: 13, color: 'var(--ws-text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 7 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, color: '#fff', background: '#0D9488', border: 'none', borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>{label}</p>
        {description && <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)} style={{
        position: 'relative', width: 38, height: 20, borderRadius: 10, border: 'none',
        cursor: 'pointer', background: checked ? '#0D9488' : 'var(--ws-border)', transition: 'background 0.2s', flexShrink: 0, padding: 0,
      }}>
        <span style={{ position: 'absolute', top: 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: checked ? 21 : 3, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>{label}</span>
      {typeof value === 'string' ? <span style={{ fontSize: 13, color: 'var(--ws-text)' }}>{value}</span> : value}
    </div>
  );
}