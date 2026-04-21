import { useTheme } from '../../context/ThemeContext';

export default function StatCard({ label, value, accentColor = '#0D9488' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const panelBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const border = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.8)';
  const labelColor = isDark ? 'rgba(240,240,240,0.35)' : 'rgba(55,65,81,0.65)';
  const textColor = isDark ? '#F0F0F0' : '#111827';

  return (
    <div style={{
      background: panelBg,
      border: border,
      borderRadius: 10,
      padding: '20px 22px',
      borderBottom: `3px solid ${accentColor}`,
    }}>
      <p style={{
        fontSize: 11,
        color: labelColor,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 10px',
        fontWeight: 500,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 32,
        fontWeight: 500,
        color: textColor,
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  );
}
