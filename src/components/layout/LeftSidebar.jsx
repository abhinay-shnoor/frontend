import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import React from 'react';

const ChevronIcon = ({ isOpen }) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"
    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--ws-text-muted)' }}>
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
  </svg>
);


const ChevronIcon = ({ isOpen }) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"
    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--ws-text-muted)' }}>
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
  </svg>
);

function NewChatPicker({ dmUsers, onSelectDM, onlineUsers, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = (dmUsers || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ borderTop: '0.5px solid var(--ws-border)', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-surface)' }}>
      <div style={{ padding: '7px 10px 5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)', borderRadius: 7, padding: '5px 9px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search teammates..." onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--ws-text)' }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 13 }}>✕</button>
        </div>
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', textAlign: 'center', padding: '14px 12px', margin: 0 }}>
            {search ? 'No teammates found' : 'No other users yet'}
          </p>
        ) : filtered.map(user => {
          const isOnline = onlineUsers.has(user.id);
          return (
            <button key={user.id} onClick={() => { onSelectDM(user); onClose(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar initials={user.initials} color={user.color} size={26} avatarUrl={user.avatar_url} />
                {isOnline && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, background: '#10B981', borderRadius: '50%', border: '1.5px solid var(--ws-surface)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--ws-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ fontSize: 10, color: 'var(--ws-text-muted)', margin: 0 }}>{isOnline ? 'Online' : user.email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LeftSidebar({
  isOpen, onSelectSpace, onSelectDM, activeSpace, activeDM, activeView,
  onHomeClick, onMentionsClick, onStarredClick, onCreateSpace, allSpaces, currentUser,
  dmUsers, onLoadMoreDMs, dmHasMore, dmLoadingMore, onCloseMobile, className = '',
  unreadMentions = 0, unreadCounts = {},
  isMobile = false,
}) {
  const { onlineUsers } = useSocket();
  const [shortcutsOpen, setShortcutsOpen] = useState(true);
  const [dmOpen,        setDmOpen]        = useState(false);
  const [spacesOpen,    setSpacesOpen]    = useState(false);
  const [showNewChat,   setShowNewChat]   = useState(false);

  const navItemStyle = (active) => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 10px', borderRadius: 7, background: active ? 'rgba(26,115,232,0.1)' : 'none',
    border: 'none', cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.1s', color: active ? '#1a73e8' : 'var(--ws-text)',
  });

  return (
    // FIX 1: Sidebar slide animation — width transitions between 220px and 0
    <div
      className={`ws-sidebar ${isOpen ? 'open' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        // On mobile, use fixed positioning and translateX
        position: isMobile ? 'fixed' : 'relative',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: isMobile ? 50 : 'auto',
        // Animate width: 220 when open, 0 when closed (on desktop)
        // On mobile, we use position: fixed and transform
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 50 : 'auto',
        left: 0, top: 0, bottom: 0,
        width: 220,
        minWidth: isMobile ? 220 : (isOpen ? 220 : 0),
        background: 'var(--ws-sidebar)',
        borderRight: (isMobile || isOpen) ? '0.5px solid var(--ws-border)' : 'none',
        flexShrink: 0,
        height: '100%',
        // Hide content overflow while animating
        overflow: 'hidden',
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'width 0.3s ease, min-width 0.3s ease, transform 0.3s ease, left 0.3s ease',
      }}
    >
      {/* Inner container always 220px wide so content doesn't compress while animating */}
      <div style={{ width: 220, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* New chat button */}
        <div style={{ padding: '12px 10px 8px' }}>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 20,
              background: showNewChat ? 'rgba(26,115,232,0.1)' : 'var(--ws-bg)',
              border: `0.5px solid ${showNewChat ? '#1a73e8' : 'var(--ws-border)'}`,
              cursor: 'pointer', fontSize: 13, fontWeight: 500, color: showNewChat ? '#1a73e8' : 'var(--ws-text)',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            New chat
          </button>
        </div>

        {showNewChat && (
          <NewChatPicker dmUsers={dmUsers} onSelectDM={(u) => { onSelectDM(u); onCloseMobile?.(); }} onlineUsers={onlineUsers} onClose={() => setShowNewChat(false)} />
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '2px 6px' }}>

          {/* Shortcuts */}
          <div style={{ marginBottom: 2 }}>
            <button onClick={() => setShortcutsOpen(!shortcutsOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronIcon isOpen={shortcutsOpen} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)' }}>Shortcuts</span>
            </button>
            {shortcutsOpen && (
              <div style={{ paddingLeft: 14 }}>
                <button onClick={() => { onHomeClick(); onCloseMobile?.(); }}
                  style={navItemStyle(activeView === 'home')}
                  onMouseEnter={e => { if (activeView !== 'home') e.currentTarget.style.background = 'var(--ws-hover)'; }}
                  onMouseLeave={e => { if (activeView !== 'home') e.currentTarget.style.background = 'none'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span style={{ fontSize: 12 }}>Home</span>
                </button>

                {/* FIX 5: Mentions button with unread badge */}
                <button onClick={() => { onMentionsClick(); onCloseMobile?.(); }}
                  style={{ ...navItemStyle(activeView === 'mentions'), position: 'relative' }}
                  onMouseEnter={e => { if (activeView !== 'mentions') e.currentTarget.style.background = 'var(--ws-hover)'; }}
                  onMouseLeave={e => { if (activeView !== 'mentions') e.currentTarget.style.background = 'none'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-3.92 7.94"/>
                  </svg>
                  <span style={{ fontSize: 12, flex: 1 }}>Mentions</span>
                  {/* Badge showing unread mention count */}
                  {unreadMentions > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, background: '#ea4335', color: '#fff',
                      minWidth: 18, height: 18, borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px', flexShrink: 0,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      animation: 'popBadge 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                      <style>{`@keyframes popBadge { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
                      {unreadMentions}
                    </span>
                  )}
                </button>
                <button onClick={() => { onStarredClick?.(); onCloseMobile?.(); }}
                  style={navItemStyle(activeView === 'starred')}
                  onMouseEnter={e => { if (activeView !== 'starred') e.currentTarget.style.background = 'var(--ws-hover)'; }}
                  onMouseLeave={e => { if (activeView !== 'starred') e.currentTarget.style.background = 'none'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ fontSize: 12 }}>Starred</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct Messages */}
          <div style={{ marginBottom: 2 }}>
            <button onClick={() => setDmOpen(!dmOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ws-text-muted)', width: 10 }}>{dmOpen ? '−' : '+'}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)' }}>Direct messages</span>
            </button>
            {dmOpen && (
              <div>
                {(dmUsers || []).map(member => {
                  // FIX 4: Use socket-based online status — green if online, gray if offline
                  const isOnline = onlineUsers.has(member.id);
                  const dmUnread = unreadCounts[`dm_${member.id}`] || 0;
                  return (
                    <button key={member.id} onClick={() => { onSelectDM?.(member); onCloseMobile?.(); }}
                      style={{ ...navItemStyle(activeDM?.id === member.id), paddingLeft: 10, position: 'relative' }}
                      onMouseEnter={e => { if (activeDM?.id !== member.id) e.currentTarget.style.background = 'var(--ws-hover)'; }}
                      onMouseLeave={e => { if (activeDM?.id !== member.id) e.currentTarget.style.background = activeDM?.id === member.id ? 'rgba(26,115,232,0.1)' : 'none'; }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar initials={member.initials} color={member.color} size={24} avatarUrl={member.avatar_url} />
                        {/* Presence dot: green=online, gray=offline (no yellow/away for others unless server sends it) */}
                        <div style={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 8, height: 8, borderRadius: '50%',
                          background: isOnline ? '#10B981' : '#9CA3AF',
                          border: '1.5px solid var(--ws-sidebar)',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{member.name}</span>
                      {/* FIX 6: Unread count badge per DM */}
                      {dmUnread > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#1a73e8', color: '#fff', borderRadius: 10, padding: '1px 5px', flexShrink: 0 }}>{dmUnread}</span>
                      )}
                    </button>
                  );
                })}
                {dmHasMore && (
                  <button onClick={onLoadMoreDMs} disabled={dmLoadingMore} style={{ width: '100%', fontSize: 11, color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', textAlign: 'left' }}>
                    {dmLoadingMore ? 'Loading...' : 'Show more'}
                  </button>
                )}
                {(dmUsers || []).length === 0 && (
                  <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', padding: '4px 10px', margin: 0 }}>No teammates yet</p>
                )}
              </div>
            )}
          </div>

          {/* Spaces — FIX 3: "Create a new space" button is REMOVED */}
          <div style={{ marginBottom: 2 }}>
            <button onClick={() => setSpacesOpen(!spacesOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronIcon isOpen={spacesOpen} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)' }}>Spaces</span>
            </button>
            {spacesOpen && (
              <div style={{ paddingLeft: 14 }}>
                {/* "Create a new space" button removed — space creation is admin-only */}
                {(allSpaces || []).map(space => {
                  const spaceUnread = unreadCounts[`space_${space.id}`] || 0;
                  return (
                    <button key={space.id} onClick={() => { onSelectSpace?.(space); onCloseMobile?.(); }}
                      style={{ ...navItemStyle(activeSpace?.id === space.id), paddingLeft: 8 }}
                      onMouseEnter={e => { if (activeSpace?.id !== space.id) e.currentTarget.style.background = 'var(--ws-hover)'; }}
                      onMouseLeave={e => { if (activeSpace?.id !== space.id) e.currentTarget.style.background = 'none'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{space.name}</span>
                      {/* FIX 6: Unread count badge per space */}
                      {spaceUnread > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#1a73e8', color: '#fff', borderRadius: 10, padding: '1px 5px', flexShrink: 0 }}>{spaceUnread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}