import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';
import { formatDateLabel, formatTime as formatMsgTime } from '../../utils/dateUtils.js';
import { useSocket } from '../../context/SocketContext.jsx';


const formatSidebarTime = (ts) => {
  if (!ts) return '';
  const label = formatDateLabel(ts);
  if (label === 'Today') return formatMsgTime(ts);
  return label;
};


const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function ConversationList({
  activeView, onSelectConversation, selectedId,
  navSearchQuery, mentionedMessages, allSpaces, dmConversations, currentUserId,
  unreadCounts = {}, className = '',
  isMobile = false,
}) {
  const { getStatusColor, onlineUsers } = useSocket();
  const items = [
    ...allSpaces.map(s => ({
      id: s.id, type: 'space', name: s.name,
      preview: s.last_message_sender ? `${s.last_message_sender}: ${s.last_message}` : 'No messages yet',
      time: s.last_message_at || s.created_at, isGroup: true,
      initials: s.name.substring(0, 2).toUpperCase(), unread: unreadCounts[`space_${s.id}`] || 0,
    })),
    ...(dmConversations || []).map(dm => {
      const partnerId = dm.partnerId || dm.other_user_id || dm.id;
      return {
        id: partnerId, type: 'dm', name: dm.other_user_name,
        preview: dm.last_message
          ? (dm.last_message_sender_id === currentUserId ? `You: ${dm.last_message}` : dm.last_message)
          : 'No messages yet',
        time: dm.last_message_at, avatar_url: dm.other_user_avatar,
        initials: initials(dm.other_user_name), isGroup: false, unread: unreadCounts[`dm_${partnerId}`] || 0,
        partnerId: partnerId,
        statusColor: dm.statusColor
      };
    }),
  ].sort((a, b) => {
    if (!a.time) return 1; if (!b.time) return -1;
    return new Date(b.time) - new Date(a.time);
  });

  let filtered = items;
  if (navSearchQuery?.trim()) {
    const q = navSearchQuery.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.preview?.toLowerCase().includes(q));
  }

  if (activeView === 'mentions') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 360, borderRight: isMobile ? 'none' : '0.5px solid var(--ws-border)', background: 'var(--ws-bg)', flexShrink: 0, height: '100%' }}>
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
    <div className={className} style={{ display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 360, borderRight: isMobile ? 'none' : '0.5px solid var(--ws-border)', background: 'var(--ws-bg)', flexShrink: 0, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>Home</h2>
          {onlineUsers && onlineUsers.size > 0 && (
            <span style={{ 
              fontSize: 12, 
              color: '#34A853', 
              background: '#34A85315', 
              padding: '2px 8px', 
              borderRadius: 20,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34A853' }} />
              {onlineUsers.size} online
            </span>
          )}
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
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {item.isGroup ? (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ws-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ws-text-muted)' }}>
                  #{item.initials[0]}
                </div>
              ) : (
                <Avatar 
                  initials={item.initials} 
                  color="#0D9488" 
                  size={40} 
                  avatarUrl={item.avatar_url} 
                  statusColor={item.statusColor || getStatusColor(item.partnerId || item.id)} 
                />
              )}
              {item.unread > 0 && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: '#ea4335', color: '#fff', fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: '2px solid var(--ws-bg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  animation: 'popBadge 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  <style>{`@keyframes popBadge { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
                  {item.unread > 99 ? '99+' : item.unread}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: item.unread > 0 ? 800 : 500, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.isGroup ? `#${item.name}` : item.name}
                </span>
                <span style={{ fontSize: 11, color: item.unread > 0 ? '#ea4335' : 'var(--ws-text-muted)', fontWeight: item.unread > 0 ? 600 : 400, flexShrink: 0, marginLeft: 6 }}>{formatSidebarTime(item.time)}</span>
              </div>
              <p style={{ fontSize: 12, color: item.unread > 0 ? 'var(--ws-text)' : 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.unread > 0 ? 600 : 400 }}>
                {item.preview}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}