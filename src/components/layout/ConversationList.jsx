import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function ConversationList({
  activeView, onSelectConversation, selectedId,
  navSearchQuery, mentionedMessages, allSpaces, dmConversations, currentUserId,
  className = '',
}) {
  const [unreadOnly, setUnreadOnly] = useState(false);

  const items = [
    ...allSpaces.map(s => ({
      id: s.id, type: 'space', name: s.name,
      preview: s.last_message_sender ? `${s.last_message_sender}: ${s.last_message}` : 'No messages yet',
      time: s.last_message_at || s.created_at, isGroup: true,
      initials: s.name.substring(0, 2).toUpperCase(), unread: s.unread || 0,
    })),
    ...(dmConversations || []).map(dm => ({
      id: dm.other_user_id, type: 'dm', name: dm.other_user_name,
      preview: dm.last_message
        ? (dm.last_message_sender_id === currentUserId ? `You: ${dm.last_message}` : dm.last_message)
        : 'No messages yet',
      time: dm.last_message_at, avatar_url: dm.other_user_avatar,
      initials: initials(dm.other_user_name), isGroup: false, unread: 0,
    })),
  ].sort((a, b) => {
    if (!a.time) return 1; if (!b.time) return -1;
    return new Date(b.time) - new Date(a.time);
  });

  let filtered = unreadOnly ? items.filter(i => i.unread > 0) : items;
  if (navSearchQuery?.trim()) {
    const q = navSearchQuery.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.preview?.toLowerCase().includes(q));
  }

  if (activeView === 'mentions') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', width: 360, borderRight: '0.5px solid var(--ws-border)', background: 'var(--ws-bg)', flexShrink: 0, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', height: 57, borderBottom: '0.5px solid var(--ws-border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>Mentions</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(!mentionedMessages?.length) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ws-text)', fontWeight: 600, margin: '0 0 6px' }}>No mentions yet</p>
              <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>When someone @mentions you, it'll show here</p>
            </div>
          )}
          {(mentionedMessages || []).map((msg, i) => (
            <button key={i}
              onClick={() => onSelectConversation({ id: msg.sourceId, type: msg.sourceType })}
              style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '0.5px solid var(--ws-border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {initials(msg.senderName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{msg.senderName}</span>
                  <span style={{ fontSize: 11, color: 'var(--ws-text-muted)' }}>{msg.time}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.text}</p>
                <p style={{ fontSize: 11, color: '#1a73e8', margin: 0 }}>in #{msg.source}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', width: 360, borderRight: '0.5px solid var(--ws-border)', background: 'var(--ws-bg)', flexShrink: 0, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>Home</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>Unread</span>
          <button onClick={() => setUnreadOnly(!unreadOnly)} style={{
            position: 'relative', width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
            background: unreadOnly ? '#1a73e8' : 'var(--ws-border)', transition: 'background 0.2s', padding: 0,
          }}>
            <span style={{ position: 'absolute', top: 2, width: 14, height: 14, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: unreadOnly ? 18 : 2 }} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px 18px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>No conversations yet</p>
          </div>
        )}
        {filtered.map(item => (
          <button key={`${item.type}-${item.id}`} onClick={() => onSelectConversation(item)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px',
              background: selectedId === item.id ? 'rgba(26,115,232,0.09)' : 'none',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '0.5px solid var(--ws-border)',
            }}
            onMouseEnter={e => { if (selectedId !== item.id) e.currentTarget.style.background = 'var(--ws-hover)'; }}
            onMouseLeave={e => { if (selectedId !== item.id) e.currentTarget.style.background = 'none'; }}
          >
            {item.isGroup ? (
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ws-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ws-text-muted)', flexShrink: 0 }}>
                #{item.initials[0]}
              </div>
            ) : item.avatar_url ? (
              <img src={item.avatar_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <Avatar initials={item.initials} color="#0D9488" size={40} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: item.unread > 0 ? 700 : 500, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.isGroup ? `#${item.name}` : item.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', flexShrink: 0, marginLeft: 6 }}>{formatTime(item.time)}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.unread > 0 ? 500 : 400 }}>
                {item.preview}
              </p>
            </div>
            {item.unread > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#1a73e8', color: '#fff', borderRadius: 10, padding: '2px 6px', flexShrink: 0 }}>{item.unread}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}