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
  archivedChats = [], onArchiveChat, onUnarchiveChat,
  lockedChats = [], tempUnlockedChats = [], onLockChat, onUnlockChatPermanently
}) {
  const [showMenuId, setShowMenuId] = useState(null);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [showLockedOnly, setShowLockedOnly] = useState(false);
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

  const isArchived = (item) => archivedChats.some(a => a.chat_id === item.id && a.chat_type === item.type);
  const isLocked = (item) => (lockedChats || []).some(c => c.chat_id === item.id && c.chat_type === item.type);
  const isTempUnlocked = (item) => (tempUnlockedChats || []).some(c => c.id === item.id && c.type === item.type);

  const activeChats = filtered.filter(i => !isArchived(i) && (!isLocked(i) || isTempUnlocked(i)));
  const archivedList = filtered.filter(i => isArchived(i) && (!isLocked(i) || isTempUnlocked(i)));
  const lockedList = filtered.filter(i => isLocked(i));

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setShowMenuId(prev => prev === id ? null : id);
  };

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
          {(showArchivedOnly || showLockedOnly) && (
            <button
              onClick={() => { setShowArchivedOnly(false); setShowLockedOnly(false); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ws-text-muted)',
                padding: '6px',
                marginRight: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              title="Go to Home"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          )}
          {showArchivedOnly ? (
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>
              Archived Chats
            </h2>
          ) : showLockedOnly ? (
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>
              Locked Chats
            </h2>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ws-text)', padding: '4px 0' }} title="Home">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          {!showArchivedOnly && !showLockedOnly && (() => {
            const otherCount = onlineUsers ? (onlineUsers.has(currentUserId) ? onlineUsers.size - 1 : onlineUsers.size) : 0;
            if (otherCount <= 0) return null;
            return (
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
                {otherCount} online
              </span>
            );
          })()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Locked Chats Toggle */}
          <button
            onClick={() => {
              setShowLockedOnly(prev => !prev);
              setShowArchivedOnly(false);
            }}
            title={showLockedOnly ? "Show Home" : "Show Locked Chats"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: showLockedOnly ? 'rgba(239,68,68,0.15)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: showLockedOnly ? '#EF4444' : 'var(--ws-text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (!showLockedOnly) e.currentTarget.style.background = 'var(--ws-hover)';
            }}
            onMouseLeave={e => {
              if (!showLockedOnly) e.currentTarget.style.background = 'none';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>

          {/* Archived Chats Toggle */}
          <button
            onClick={() => {
              setShowArchivedOnly(prev => !prev);
              setShowLockedOnly(false);
            }}
            title={showArchivedOnly ? "Show Home" : "Show Archived Chats"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: showArchivedOnly ? 'rgba(26,115,232,0.15)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: showArchivedOnly ? '#1a73e8' : 'var(--ws-text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (!showArchivedOnly) e.currentTarget.style.background = 'var(--ws-hover)';
            }}
            onMouseLeave={e => {
              if (!showArchivedOnly) e.currentTarget.style.background = 'none';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <polyline points="9 14 12 17 15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {showArchivedOnly ? (
          <>
            {archivedList.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--ws-text)', fontWeight: 600, margin: '0 0 6px' }}>No archived chats</p>
                <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>Chats you archive will appear here</p>
              </div>
            ) : (
              archivedList.map(item => (
                <div key={`${item.type}-${item.id}`} style={{ position: 'relative' }}>
                  <button onClick={() => onSelectConversation(item)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px',
                      background: selectedId === item.id ? 'rgba(26,115,232,0.09)' : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      borderBottom: '0.5px solid var(--ws-border)', opacity: 0.8
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
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.isGroup ? `#${item.name}` : item.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 400, flexShrink: 0, marginLeft: 6 }}>{formatSidebarTime(item.time)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }}>
                        {item.preview}
                      </p>
                    </div>
                  </button>
                  <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)' }}>
                    <button onClick={(e) => toggleMenu(e, `${item.type}-${item.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ws-text-muted)', fontSize: 16 }}>⋮</button>
                    {showMenuId === `${item.type}-${item.id}` && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={(e) => toggleMenu(e, `${item.type}-${item.id}`)} />
                        <div style={{ position: 'absolute', right: 0, top: 24, background: 'var(--ws-surface)', border: '1px solid var(--ws-border)', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 101, minWidth: 140, padding: 4 }}>
                          <button onClick={(e) => { e.stopPropagation(); onUnarchiveChat?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Unarchive Chat</button>
                          {isLocked(item) ? (
                            <button onClick={(e) => { e.stopPropagation(); onUnlockChatPermanently?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Unlock Chat</button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); onLockChat?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Lock Chat</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        ) : showLockedOnly ? (
          <>
            {lockedList.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--ws-text)', fontWeight: 600, margin: '0 0 6px' }}>No locked chats</p>
                <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>Chats you lock will appear here</p>
              </div>
            ) : (
              lockedList.map(item => (
                <div key={`${item.type}-${item.id}`} style={{ position: 'relative' }}>
                  <button onClick={() => onSelectConversation(item)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px',
                      background: selectedId === item.id ? 'rgba(26,115,232,0.09)' : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      borderBottom: '0.5px solid var(--ws-border)', opacity: 0.8
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
                      <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, border: '2px solid var(--ws-bg)' }}>
                        🔒
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.isGroup ? `#${item.name}` : item.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 400, flexShrink: 0, marginLeft: 6 }}>{formatSidebarTime(item.time)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }}>
                        Locked (Verify PIN to open)
                      </p>
                    </div>
                  </button>
                  <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)' }}>
                    <button onClick={(e) => toggleMenu(e, `${item.type}-${item.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ws-text-muted)', fontSize: 16 }}>⋮</button>
                    {showMenuId === `${item.type}-${item.id}` && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={(e) => toggleMenu(e, `${item.type}-${item.id}`)} />
                        <div style={{ position: 'absolute', right: 0, top: 24, background: 'var(--ws-surface)', border: '1px solid var(--ws-border)', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 101, minWidth: 140, padding: 4 }}>
                          <button onClick={(e) => { e.stopPropagation(); onUnlockChatPermanently?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Unlock Chat</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {activeChats.length === 0 ? (
              <div style={{ padding: '40px 18px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>No conversations yet</p>
              </div>
            ) : (
              activeChats.map(item => (
                <div key={`${item.type}-${item.id}`} style={{ position: 'relative' }}>
                  <button onClick={() => onSelectConversation(item)}
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
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
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
                  <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)' }}>
                    <button onClick={(e) => toggleMenu(e, `${item.type}-${item.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ws-text-muted)', fontSize: 16 }}>⋮</button>
                    {showMenuId === `${item.type}-${item.id}` && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={(e) => toggleMenu(e, `${item.type}-${item.id}`)} />
                        <div style={{ position: 'absolute', right: 0, top: 24, background: 'var(--ws-surface)', border: '1px solid var(--ws-border)', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 101, minWidth: 140, padding: 4 }}>
                          <button onClick={(e) => { e.stopPropagation(); onArchiveChat?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Archive Chat</button>
                          {isLocked(item) ? (
                            <button onClick={(e) => { e.stopPropagation(); onUnlockChatPermanently?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Unlock Chat</button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); onLockChat?.(item.id, item.type); setShowMenuId(null); }} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Lock Chat</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}