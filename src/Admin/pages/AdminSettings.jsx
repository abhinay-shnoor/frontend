import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const text = isDark ? '#F0F0F0' : '#111827';
  const secondary = isDark ? 'rgba(240,240,240,0.55)' : 'rgba(75,85,99,0.85)';
  const panelBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(226,232,240,0.85)';
  const sectionBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.85)';
  const [orgName, setOrgName] = useState('SHNOOR International LLC');
  const [domain, setDomain]   = useState('shnoor.com');
  const [saved, setSaved]     = useState(false);

  const [prefs, setPrefs] = useState({
    profiles: true,
    online:   true,
    dms:      true,
  });

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset ALL spaces? This will permanently delete all spaces and their messages.')) {
      alert('Spaces have been reset. (Mock action — no data was changed.)');
    }
  };

  const handleExport = () => {
    alert('Export started. You will receive a download link shortly. (Mock action)');
  };

  const btnGhostStyle = {
    background: 'transparent',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15,23,42,0.15)',
    color: isDark ? 'rgba(240,240,240,0.65)' : '#475569',
    padding: '9px 18px',
    borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  };
  const btnDangerGhostStyle = {
    ...btnGhostStyle,
    border: isDark ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(248,113,113,0.6)',
    color: '#EF4444',
  };

  return (
    <div style={{ maxWidth: 640 }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 14, color: secondary, margin: '6px 0 0' }}>
          Workspace configuration and preferences
        </p>
      </div>

      <Section title="Organisation Info">
        <FieldInput
          label="Organisation Name"
          value={orgName}
          onChange={setOrgName}
        />
        <FieldInput
          label="Domain"
          value={domain}
          onChange={setDomain}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <button onClick={handleSave} style={btnPrimary}>
            Save Changes
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>
              ✓ Settings saved
            </span>
          )}
        </div>
      </Section>

      <Section title="Workspace Preferences">
        <Toggle
          label="Allow members to view other members' profiles"
          checked={prefs.profiles}
          onChange={() => toggle('profiles')}
        />
        <Toggle
          label="Show online status to all members"
          checked={prefs.online}
          onChange={() => toggle('online')}
        />
        <Toggle
          label="Allow DMs between all members"
          checked={prefs.dms}
          onChange={() => toggle('dms')}
        />
      </Section>

      <div style={{
        border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(248,113,113,0.3)',
        borderRadius: 10,
        padding: '20px 22px',
        marginBottom: 30,
        background: panelBg,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#EF4444', margin: '0 0 6px' }}>
          Danger Zone
        </h2>
        <p style={{ fontSize: 13, color: isDark ? 'rgba(240,240,240,0.4)' : 'rgba(75,85,99,0.75)', margin: '0 0 18px' }}>
          These actions are irreversible. Please proceed with caution.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={handleReset} style={btnDangerGhostStyle}>
            Reset all spaces
          </button>
          <button onClick={handleExport} style={btnGhostStyle}>
            Export user data
          </button>
        </div>
      </div>

    </div>
  );
}

function Section({ title, children }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{
      marginBottom: 32,
      paddingBottom: 28,
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.85)',
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#F0F0F0' : '#111827', margin: '0 0 18px' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const panelBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(226,232,240,0.9)';
  const text = isDark ? '#F0F0F0' : '#111827';
  const labelColor = isDark ? 'rgba(240,240,240,0.55)' : 'rgba(75,85,99,0.85)';

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11,
        color: labelColor,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: 6,
        fontWeight: 500,
      }}>
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          background: panelBg,
          border: border,
          padding: '9px 12px',
          borderRadius: 7,
          color: text,
          fontSize: 13,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const labelColor = isDark ? '#F0F0F0' : '#111827';
  const switchBg = checked ? '#0D9488' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2px 0',
    }}>
      <span style={{ fontSize: 13, color: labelColor, lineHeight: 1.4 }}>{label}</span>

      <div
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: switchBg,
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
          marginLeft: 16,
          transition: 'background 0.2s',
          border: isDark ? 'none' : '1px solid rgba(15,23,42,0.15)',
        }}
      >
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
    </div>
  );
}

const btnPrimary = {
  background: '#0D9488', color: '#fff',
  border: 'none', padding: '10px 22px',
  borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const btnGhost = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(240,240,240,0.65)',
  padding: '9px 18px',
  borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const btnDangerGhost = {
  ...btnGhost,
  border: '1px solid rgba(239,68,68,0.5)',
  color: '#EF4444',
};
