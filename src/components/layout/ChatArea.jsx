import { useState, useRef, useEffect } from 'react';
import Avatar from '../ui/Avatar.jsx';
import EmojiPicker from '../ui/EmojiPicker.jsx';
import { searchMessages, uploadFile } from '../../api/messages.js';

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const groupReactions = (reactions) => {
  const g = {};
  (reactions || []).forEach(r => {
    if (!g[r.emoji]) g[r.emoji] = { emoji: r.emoji, count: 0, userIds: [], userNames: [] };
    g[r.emoji].count++;
    g[r.emoji].userIds.push(r.userId);
    g[r.emoji].userNames.push(r.userName);
  });
  return Object.values(g);
};

function AttachmentPreview({ attachments }) {
  if (!attachments?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {attachments.map((a, i) => {
        const isImage = a.type?.startsWith('image/');
        return isImage ? (
          <img key={i} src={a.url} alt={a.name} style={{ maxWidth: 200, maxHeight: 160, borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => window.open(a.url, '_blank')} />
        ) : (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
            background: 'var(--ws-surface-2)', borderRadius: 8, textDecoration: 'none',
            fontSize: 12, color: '#1a73e8', border: '0.5px solid var(--ws-border)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {a.name}
          </a>
        );
      })}
    </div>
  );
}

function MessageStatus({ msg, isOwn, totalMembers, isSpace }) {
  if (!isOwn) return null;
  const receipts = msg.receipts || [];
  
  // Delivered: any receipt with deliveredAt
  const delivered = receipts.some(r => r.deliveredAt);
  
  // Seen: 
  // - DM: other person's seenAt is set
  // - Space: receipts.length (excluding sender) == totalMembers - 1
  let seen = false;
  if (isSpace) {
    seen = receipts.filter(r => r.seenAt).length >= (totalMembers - 1) && (totalMembers > 1);
  } else {
    seen = receipts.some(r => r.seenAt);
  }

  const tickColor = seen ? '#34B7F1' : 'var(--ws-text-muted)'; // blue for seen, gray for delivered/sent

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 4, transform: 'translateY(2px)' }}>
      {delivered ? (
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <path d="M0.5 5.5L3.5 8.5L10.5 1.5" stroke={tickColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.5 5.5L8.5 8.5L15.5 1.5" stroke={tickColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: -4 }}/>
        </svg>
      ) : (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4.5L4 7.5L10 1.5" stroke="var(--ws-text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function MessageInfoModal({ msg, onClose, allUsers = [] }) {
  const receipts = msg.receipts || [];
  const sentTime = new Date(msg.created_at).toLocaleString();

  const getReceiptDetails = () => {
    return receipts.map(r => {
      const user = allUsers.find(u => u.id === r.userId) || { name: 'Unknown User' };
      return {
        name: user.name,
        delivered: r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : 'Pending',
        seen: r.seenAt ? new Date(r.seenAt).toLocaleString() : 'Not yet'
      };
    });
  };

  const details = getReceiptDetails();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ws-bg)', borderRadius: 16, width: '100%', maxWidth: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '0.5px solid var(--ws-border)',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--ws-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ws-text)' }}>Message Info</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ws-text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Message Content</p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ws-text)' }}>{msg.text}</p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ws-text-muted)' }}>Sent: {sentTime}</p>
          </div>
          
          <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Receipts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {details.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>No receipts yet.</p>
            ) : details.map((d, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--ws-surface-2)', borderRadius: 10 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 13, color: 'var(--ws-text)' }}>{d.name}</p>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--ws-text-muted)' }}>Delivered</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--ws-text)' }}>{d.delivered}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--ws-text-muted)' }}>Seen</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--ws-text)' }}>{d.seen}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg, currentUserId, onEdit, onReact, onRemoveReact,
  isEditing, editContent, onEditChange, onEditSave, onEditCancel,
  totalMembers, isSpace, onShowInfo
}) {
  const [hovered, setHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const isOwn = msg.senderId === currentUserId;
  const reactions = groupReactions(msg.reactions);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowPicker(false); }}
      style={{
        display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-end', gap: 8, padding: '2px 16px', position: 'relative',
      }}
    >
      {!isOwn && (
        <div style={{ flexShrink: 0, marginBottom: 4 }}>
          {msg.avatar_url
            ? <img src={msg.avatar_url} alt={msg.senderName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            : <Avatar initials={initials(msg.senderName)} color="#0D9488" size={32} />
          }
        </div>
      )}

      <div style={{ maxWidth: 'min(72%, 600px)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
          {!isOwn && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text)' }}>{msg.senderName}</span>}
          <span style={{ fontSize: 10, color: 'var(--ws-text-muted)' }}>{msg.time}</span>
          {msg.is_edited && <span style={{ fontSize: 10, color: 'var(--ws-text-muted)', fontStyle: 'italic' }}>(edited)</span>}
        </div>

        {msg.parentContent && (
          <div style={{
            borderLeft: '3px solid #0D9488',
            padding: '4px 8px', marginBottom: 4,
            background: isOwn ? 'rgba(255,255,255,0.12)' : 'var(--ws-surface-2)',
            borderRadius: '0 6px 6px 0', fontSize: 12,
            color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--ws-text-muted)',
            maxWidth: 280,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 11 }}>↩ {msg.parentSenderName}</div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.parentContent}</div>
          </div>
        )}

        {isEditing ? (
          <div>
            <textarea value={editContent} onChange={e => onEditChange(e.target.value)} autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditSave(); } if (e.key === 'Escape') onEditCancel(); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 12, border: '2px solid #0D9488', fontSize: 14, resize: 'none', outline: 'none', minHeight: 64, boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--ws-bg)', color: 'var(--ws-text)' }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 4, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
              <button onClick={onEditSave} style={{ fontSize: 12, padding: '4px 10px', background: '#0D9488', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save</button>
              <button onClick={onEditCancel} style={{ fontSize: 12, padding: '4px 10px', background: 'none', color: 'var(--ws-text-muted)', border: '0.5px solid var(--ws-border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => onShowInfo(msg)}
            style={{
              background: isOwn ? 'var(--ws-bubble-own)' : 'var(--ws-bubble-other)',
              color: isOwn ? 'var(--ws-bubble-own-text)' : 'var(--ws-bubble-other-text)',
              padding: '8px 12px',
              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div>
              {(msg.text || '').split(/(@[\w ]+)/).map((part, i) =>
                part.startsWith('@')
                  ? <span key={i} style={{ fontWeight: 600, opacity: 0.9 }}>{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </div>
            <AttachmentPreview attachments={msg.attachments} />
            <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', marginTop: 2 }}>
               <MessageStatus msg={msg} isOwn={isOwn} totalMembers={totalMembers} isSpace={isSpace} />
            </div>
          </div>
        )}

        {reactions.length > 0 && !isEditing && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
            {reactions.map(r => {
              const iMine = r.userIds.includes(currentUserId);
              return (
                <button key={r.emoji} title={r.userNames.join(', ')}
                  onClick={() => iMine ? onRemoveReact(msg.id, r.emoji) : onReact(msg.id, r.emoji)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px',
                    borderRadius: 12, fontSize: 12, cursor: 'pointer',
                    border: `1px solid ${iMine ? '#0D9488' : 'var(--ws-border)'}`,
                    background: iMine ? 'rgba(13,148,136,0.15)' : 'var(--ws-surface-2)',
                    transition: 'all 0.1s',
                  }}
                >
                  <span>{r.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: iMine ? '#0D9488' : 'var(--ws-text-muted)' }}>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {msg.replyCount > 0 && !isEditing && (
          <button style={{
            marginTop: 4, fontSize: 11, color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'block', textAlign: isOwn ? 'right' : 'left',
          }}>
            {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {hovered && !isEditing && (
          <div style={{
            position: 'absolute', right: 20, top: 4,
            display: 'flex', gap: 2, background: 'var(--ws-bg)',
            border: '1px solid var(--ws-border)', borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 2,
            zIndex: 10
          }}>
            <ActionBtn title="React" onClick={() => setShowPicker(prev => !prev)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </ActionBtn>
            {showPicker && (
              <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 4, zIndex: 100 }}>
                <EmojiPicker onSelect={(emoji) => { onReact(msg.id, emoji); setShowPicker(false); }} onClose={() => setShowPicker(false)} />
              </div>
            )}
            {isOwn && (
              <ActionBtn title="Edit" onClick={() => onEdit(msg.id, msg.text)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </ActionBtn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ title, onClick, children }) {
  return (
    <button title={title} onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '4px 7px',
      borderRadius: 5, fontSize: 14, transition: 'background 0.1s', color: 'var(--ws-text)',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {children}
    </button>
  );
}

function LoadingSkeleton() {
  const rows = [
    { own: false, w: '55%' }, { own: true, w: '40%' }, { own: false, w: '65%' },
    { own: false, w: '35%' }, { own: true, w: '50%' },
  ];
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: r.own ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
          {!r.own && <div className="skeleton-shimmer" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />}
          <div style={{ width: r.w }}>
            {!r.own && <div className="skeleton-shimmer" style={{ width: 80, height: 10, borderRadius: 4, marginBottom: 6 }} />}
            <div className="skeleton-shimmer" style={{ height: 36, borderRadius: r.own ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MentionDropdown({ users, search, onSelect }) {
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
  if (!filtered.length) return null;
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 12, right: 12, marginBottom: 6, zIndex: 50,
      background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)', borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
    }}>
      <p style={{ fontSize: 10, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px 4px', margin: 0 }}>Mention</p>
      {filtered.map(u => (
        <button key={u.id} onClick={() => onSelect(u)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Avatar initials={initials(u.name)} color={u.color} size={26} avatarUrl={u.avatar_url} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>{u.name}</p>
            <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0 }}>{u.online ? '● Online' : u.email}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function SearchResultsPanel({ results, onClose, onJump, loading }) {
  return (
    <div style={{
      position: 'absolute', top: 57, left: 0, right: 0, bottom: 0, zIndex: 30,
      background: 'var(--ws-bg)', borderTop: '0.5px solid var(--ws-border)', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '0.5px solid var(--ws-border)' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)' }}>{loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 16 }}>✕</button>
      </div>
      {!loading && results.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ws-text-muted)', fontSize: 14 }}>No messages found</div>
      )}
      {results.map(r => (
        <button key={r.id} onClick={() => onJump(r)} style={{
          width: '100%', display: 'flex', gap: 10, padding: '12px 20px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: '0.5px solid var(--ws-border)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Avatar initials={initials(r.sender_name)} color="#0D9488" size={36} avatarUrl={r.avatar_url} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{r.sender_name}</span>
              <span style={{ fontSize: 11, color: 'var(--ws-text-muted)' }}>in #{r.space_name}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function ChatArea({
  title, description, memberCount, messages, onSend, isSpace,
  activeView, onClose, isMaximized, onToggleMaximize,
  spaceMembers, currentUserId, currentUser, allUsers = [],
  onEditMessage, onAddReaction, onRemoveReaction,
  typingUsers, messagesLoading, hasMore, onLoadMore, onTypingChange,
  spaceId,
}) {
  const [input, setInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    if (!loadingMore) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    setShowMembers(false); setEditingId(null);
    setReplyingTo(null); setInput(''); setPendingFiles([]);
    if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); onTypingChange?.(false); }
  }, [title]);

  useEffect(() => {
    return () => { if (typingTimerRef.current) clearTimeout(typingTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!showSearch || !searchQuery.trim()) { setSearchResults([]); return; }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchMessages(searchQuery.trim(), spaceId || null);
        setSearchResults(results);
      } catch { }
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery, showSearch, spaceId]);

  const handleInputChange = (val) => {
    setInput(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1) {
      const afterAt = val.slice(lastAt + 1);
      if (!afterAt.includes(' ') && afterAt.length <= 20) {
        setMentionSearch(afterAt);
        setMentionStartPos(lastAt);
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
      setMentionStartPos(-1);
    }
    onTypingChange?.(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => onTypingChange?.(false), 2000);
  };

  const handleMentionSelect = (user) => {
    const before = input.slice(0, mentionStartPos);
    const after = input.slice(mentionStartPos + 1 + mentionSearch.length);
    setInput(`${before}@${user.name} ${after}`);
    setShowMentionDropdown(false);
    setMentionStartPos(-1);
    inputRef.current?.focus();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    setUploadingFile(true);
    try {
      const result = await uploadFile(file);
      setPendingFiles(prev => [...prev, result]);
    } catch { alert('File upload failed. Check Cloudinary credentials in .env'); }
    setUploadingFile(false);
    e.target.value = '';
  };

  const handleSend = () => {
    if (!input.trim() && !pendingFiles.length) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingChange?.(false);
    onSend(input.trim(), replyingTo?.id || null, pendingFiles);
    setInput('');
    setPendingFiles([]);
    setReplyingTo(null);
    setShowMentionDropdown(false);
    inputRef.current?.focus();
  };

  const handleEditSave = async () => {
    if (!editContent.trim() || !editingId) return;
    try {
      await onEditMessage(editingId, editContent.trim());
      setEditingId(null); setEditContent('');
    } catch { }
  };

  const handleLoadMore = async () => {
    if (!onLoadMore) return;
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  if (!title || activeView === 'home' || activeView === 'mentions') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ws-bg)' }}>
        <svg viewBox="0 0 200 180" fill="none" style={{ width: 160, height: 140, marginBottom: 20, opacity: 0.5 }}>
          <rect x="65" y="20" width="80" height="110" rx="8" fill="var(--ws-surface-2)" stroke="var(--ws-border)" strokeWidth="2" />
          <rect x="80" y="45" width="50" height="4" rx="2" fill="var(--ws-border)" />
          <rect x="80" y="57" width="40" height="4" rx="2" fill="var(--ws-border)" />
          <rect x="80" y="69" width="45" height="4" rx="2" fill="var(--ws-border)" />
          <circle cx="55" cy="140" r="18" fill="#0D9488" opacity="0.7" />
          <path d="M48 140l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p style={{ fontSize: 16, color: 'var(--ws-text)', fontWeight: 600, margin: '0 0 6px' }}>No conversation selected</p>
        <p style={{ fontSize: 14, color: 'var(--ws-text-muted)' }}>Select a space or DM to start</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', height: '100%', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0, background: 'var(--ws-bg)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {isSpace && <span style={{ color: 'var(--ws-text-muted)', fontSize: 18, fontWeight: 300 }}>#</span>}
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ws-text)', margin: 0 }}>{title}</h2>
              {memberCount && <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', marginLeft: 2 }}>· {memberCount} members</span>}
            </div>
            {description && (
              <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0, marginTop: 1, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <button onClick={() => { setShowSearch(p => !p); setSearchQuery(''); setSearchResults([]); }} style={iconBtn(showSearch)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
            {memberCount && (
              <button onClick={() => setShowMembers(p => !p)} style={iconBtn(showMembers)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Members
              </button>
            )}
            <button onClick={onToggleMaximize} style={iconBtn(false)} title={isMaximized ? 'Restore' : 'Expand'}>
              {isMaximized ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="10" y1="14" x2="21" y2="3" /><line x1="3" y1="21" x2="14" y2="10" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>
            <button onClick={onClose} style={{ ...iconBtn(false), color: 'var(--ws-text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {showSearch && (
          <div style={{ padding: '8px 16px', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-surface)' }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
              style={{ width: '100%', padding: '7px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)', color: 'var(--ws-text)' }}
            />
          </div>
        )}

        {showSearch && (searchQuery.trim() || searchLoading) && (
          <SearchResultsPanel
            results={searchResults}
            loading={searchLoading}
            onClose={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
            onJump={(r) => { setShowSearch(false); setSearchQuery(''); }}
          />
        )}

        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
          {messagesLoading ? <LoadingSkeleton /> : (
            <>
              {hasMore && (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <button onClick={handleLoadMore} disabled={loadingMore} style={{ fontSize: 12, color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {loadingMore ? 'Loading...' : 'Load earlier messages'}
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 16px 10px' }}>
                <div style={{ flex: 1, height: '0.5px', background: 'var(--ws-border)' }} />
                <span style={{ fontSize: 10, color: 'var(--ws-text-muted)', fontWeight: 500 }}>Today</span>
                <div style={{ flex: 1, height: '0.5px', background: 'var(--ws-border)' }} />
              </div>

              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId}
                  onEdit={(id, text) => { setEditingId(id); setEditContent(text); }}
                  onReact={onAddReaction} onRemoveReact={onRemoveReaction}
                  onReply={(msg) => { setReplyingTo(msg); inputRef.current?.focus(); }}
                  isEditing={editingId === msg.id}
                  editContent={editingId === msg.id ? editContent : ''}
                  onEditChange={setEditContent}
                  onEditSave={handleEditSave}
                  onEditCancel={() => { setEditingId(null); setEditContent(''); }}
                  totalMembers={isSpace ? memberCount : 2}
                  isSpace={isSpace}
                  onShowInfo={setInfoMessage}
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {typingUsers?.length > 0 && (
          <div style={{ padding: '2px 16px 4px', fontSize: 11, color: 'var(--ws-text-muted)', fontStyle: 'italic' }}>
            {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`}
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div style={{ padding: '6px 16px', borderTop: '0.5px solid var(--ws-border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pendingFiles.map((f, i) => (
              <div key={i} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ws-surface-2)', borderRadius: 8, padding: '4px 8px', fontSize: 12, color: 'var(--ws-text)' }}>
                {f.type?.startsWith('image/') ? <img src={f.url} alt={f.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} /> : '📎'}
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <button onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {replyingTo && (
          <div style={{ padding: '6px 16px', borderTop: '0.5px solid var(--ws-border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ws-surface)' }}>
            <div style={{ flex: 1, borderLeft: '3px solid #0D9488', paddingLeft: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#0D9488', margin: 0 }}>Replying to {replyingTo.senderName}</p>
              <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{replyingTo.text}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 18 }}>✕</button>
          </div>
        )}

        <div style={{ padding: '8px 16px 14px', flexShrink: 0, position: 'relative' }}>
          {showMentionDropdown && (
            <MentionDropdown users={allUsers} search={mentionSearch} onSelect={handleMentionSelect} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ws-input-bg)', borderRadius: 12, padding: '8px 12px', border: '0.5px solid var(--ws-border)', transition: 'border-color 0.15s' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              title="Attach file"
              style={{ background: 'none', border: 'none', cursor: uploadingFile ? 'not-allowed' : 'pointer', color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0 }}
            >
              {uploadingFile ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              )}
            </button>
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv" />

            <input
              ref={inputRef}
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                if (e.key === 'Escape') { setShowMentionDropdown(false); setReplyingTo(null); }
              }}
              placeholder={`Message ${isSpace ? '#' : ''}${title}...`}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ws-text)' }}
            />

            <button onClick={handleSend} disabled={!input.trim() && !pendingFiles.length}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                cursor: (input.trim() || pendingFiles.length) ? 'pointer' : 'not-allowed',
                background: (input.trim() || pendingFiles.length) ? '#0D9488' : 'var(--ws-surface-2)',
                color: (input.trim() || pendingFiles.length) ? '#fff' : 'var(--ws-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {showMembers && isSpace && (
        <div style={{ width: 240, borderLeft: '0.5px solid var(--ws-border)', background: 'var(--ws-bg)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: 57, borderBottom: '0.5px solid var(--ws-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)', margin: 0 }}>Members ({spaceMembers?.length || 0})</h3>
            <button onClick={() => setShowMembers(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {(spaceMembers || []).map(m => (
              <div key={m.id || m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px' }}>
                <Avatar initials={initials(m.name || String(m))} color="#0D9488" size={30} avatarUrl={m.avatar_url} />
                <span style={{ fontSize: 13, color: 'var(--ws-text)', fontWeight: 500 }}>
                  {m.name || m}
                  {m.id === currentUserId && <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 400 }}> (you)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {infoMessage && (
        <MessageInfoModal 
          msg={infoMessage} 
          onClose={() => setInfoMessage(null)} 
          allUsers={allUsers} 
        />
      )}
    </div>
  );
}

const iconBtn = (active) => ({
  background: active ? 'var(--ws-surface-2)' : 'none',
  color: active ? '#1a73e8' : 'var(--ws-text-muted)',
  border: 'none', cursor: 'pointer', padding: '5px 10px',
  borderRadius: 6, fontSize: 12, fontWeight: 500,
  display: 'flex', alignItems: 'center', gap: 4,
});