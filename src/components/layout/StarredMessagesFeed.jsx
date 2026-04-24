import Avatar from '../ui/Avatar.jsx';

export default function StarredMessagesFeed({ starredMessages, onSelectMessage, onUnstar, onClose }) {
  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0, background: 'var(--ws-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(251,188,4,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbc04' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ws-text)', margin: 0 }}>Starred Messages</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 18 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scrollbar">
        {!starredMessages?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ws-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ws-text)', margin: '0 0 8px' }}>No starred messages</h3>
            <p style={{ fontSize: 14, color: 'var(--ws-text-muted)', margin: 0, maxWidth: 300 }}>Star important messages to keep them handy here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 24px' }}>
             <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Saved for later</p>
             {starredMessages.map((msg, i) => (
                <div key={msg.id || i} style={{ position: 'relative' }}>
                  <button
                    onClick={() => onSelectMessage(msg)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px',
                      background: 'var(--ws-bg)', border: '1px solid var(--ws-border)', borderRadius: 12,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#fbbc04';
                      e.currentTarget.style.background = 'rgba(251,188,4,0.02)';
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
                        <span style={{ fontSize: 11, color: '#fbbc04', fontWeight: 600 }}>Click to jump to message →</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onUnstar(msg.id); }}
                    title="Unstar"
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(251,188,4,0.1)', border: 'none', borderRadius: '50%',
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fbbc04', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fbbc04'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,188,4,0.1)'; e.currentTarget.style.color = '#fbbc04'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
