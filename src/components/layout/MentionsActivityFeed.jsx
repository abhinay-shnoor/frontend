import Avatar from '../ui/Avatar.jsx';

export default function MentionsActivityFeed({ mentions, onSelectMention, onClose }) {
  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0, background: 'var(--ws-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a73e8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-3.92 7.94"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ws-text)', margin: 0 }}>Mentions Activity</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 18 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scrollbar">
        {!mentions?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ws-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-3.92 7.94"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ws-text)', margin: '0 0 8px' }}>No mentions yet</h3>
            <p style={{ fontSize: 14, color: 'var(--ws-text-muted)', margin: 0, maxWidth: 300 }}>When someone @mentions you in a space or DM, it will show up here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 24px' }}>
             <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Recent interactions</p>
             {mentions.map((msg, i) => (
                <button key={i}
                  onClick={() => onSelectMention(msg)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px',
                    background: 'var(--ws-bg)', border: '1px solid var(--ws-border)', borderRadius: 12,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#1a73e8';
                    e.currentTarget.style.background = 'rgba(26,115,232,0.02)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--ws-border)';
                    e.currentTarget.style.background = 'var(--ws-bg)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                  }}
                >
                  <Avatar initials={initials(msg.senderName)} color="#0D9488" size={42} avatarUrl={msg.avatar_url} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ws-text)' }}>{msg.senderName}</span>
                      <span style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ws-text)', margin: '0 0 10px', lineHeight: 1.5 }}>{msg.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ws-text-muted)', background: 'var(--ws-surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                        {msg.sourceType === 'space' ? `#${msg.source}` : 'Direct Message'}
                      </span>
                      <span style={{ fontSize: 11, color: '#1a73e8', fontWeight: 600 }}>Click to view conversation →</span>
                    </div>
                  </div>
                </button>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
