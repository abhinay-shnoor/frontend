import { useState, useEffect, useRef } from 'react';
import { searchMessages } from '../../api/messages';
import Avatar from '../ui/Avatar.jsx';

export default function GlobalSearch({ query, onClose, onSelectResult, spaceId, conversationId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!query?.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMessages(query.trim(), spaceId, conversationId);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, spaceId, conversationId]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!query?.trim()) return null;

  return (
    <div ref={dropdownRef} style={{
      position: 'absolute', top: 54, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: 650, maxHeight: 520, overflowY: 'auto',
      background: 'var(--ws-bg)', border: '1px solid var(--ws-border)',
      borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      animation: 'fadeSlideDown 0.2s ease-out'
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--ws-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Search Results ({results.length})
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 18 }}>×</button>
      </div>

      {loading && (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div className="skeleton-shimmer" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>Searching history...</p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 4 }}>🔍</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>No messages found</p>
          <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', marginTop: 4 }}>Try a different keyword or check your spelling</p>
        </div>
      )}

      {!loading && results.map(msg => (
        <button key={msg.id} onClick={() => onSelectResult(msg)} style={{
          width: '100%', padding: '14px 18px', display: 'flex', gap: 14,
          background: 'none', border: 'none', borderBottom: '0.5px solid var(--ws-border)',
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--ws-hover)';
            e.currentTarget.style.paddingLeft = '22px';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.paddingLeft = '18px';
          }}
        >
          <div style={{ flexShrink: 0 }}>
             <Avatar 
               initials={(msg.sender_name || '').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)} 
               size={38} 
               avatarUrl={msg.avatar_url} 
               color="#0D9488"
             />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{msg.sender_name}</span>
              <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 400 }}>
                {formatDate(msg.created_at)}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
               <span style={{ 
                 fontSize: 9, padding: '2px 6px', borderRadius: 4, 
                 background: msg.chat_type === 'space' ? 'rgba(13, 148, 136, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                 color: msg.chat_type === 'space' ? '#0D9488' : '#4F46E5',
                 fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em'
               }}>
                 {msg.chat_type}
               </span>
               <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                 {msg.chat_type === 'space' ? msg.space_name : msg.dm_partner_name}
               </span>
            </div>

            <p style={{ 
              fontSize: 13, color: 'var(--ws-text)', margin: 0, 
              lineHeight: 1.5,
              overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', 
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' 
            }}>
              <Highlight text={msg.content} highlight={query} />
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Highlight({ text = '', highlight = '' }) {
  if (!highlight.trim()) return text;
  // Escape special regex chars
  const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safeHighlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
          ? <mark key={i} style={{ background: '#fef08a', color: '#854d0e', borderRadius: 2, padding: '0 2px', margin: '0 -1px' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}
