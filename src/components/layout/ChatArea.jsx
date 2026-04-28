import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Avatar from '../ui/Avatar.jsx';
import EmojiPicker from '../ui/EmojiPicker.jsx';
import { searchMessages, uploadFile, downloadAttachment } from '../../api/messages.js';
import { formatDateLabel } from '../../utils/dateUtils.js';
import VoiceRecorder from '../chat/VoiceRecorder.jsx';
import VoiceMessagePlayer from '../chat/VoiceMessagePlayer.jsx';

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

function AttachmentPreview({ attachments: rawAttachments, isOwn, onPreview }) {
    let attachments = rawAttachments;
    if (typeof rawAttachments === 'string') {
        try {
            attachments = JSON.parse(rawAttachments);
        } catch {
            return null;
        }
    }

    if (!attachments || !attachments.length) return null;

    return (
        <div style={{ marginTop: 8, padding: 8, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            {attachments.map((a, i) => {
                if (!a) return <div key={i} style={{ color: 'red' }}>Empty attachment object</div>;
                if (!a.url) return <div key={i} style={{ color: 'orange' }}>⚠️ Attachment Data Missing</div>;

                // Voice / audio message detection
                const isAudio = a.type?.startsWith('audio/') || a.isVoice
                    || /\.(webm|ogg|mp3|m4a|wav|mp4)$/i.test(a.url);

                if (isAudio) {
                    return (
                        <div key={i} style={{ marginBottom: 6 }} onClick={e => e.stopPropagation()}>
                            <VoiceMessagePlayer url={a.url} />
                        </div>
                    );
                }

                const getExt = (u, n) => {
                    const uExt = (u || '').split('?')[0].split('.').pop().toLowerCase();
                    const nExt = (n || '').split('.').pop().toLowerCase();
                    return { uExt, nExt };
                };

                const { uExt: ext, nExt: nameExt } = getExt(a.url, a.name);
                
                const isPdf = ext === 'pdf' || nameExt === 'pdf' || a.type?.toLowerCase().includes('pdf');
                
                const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
                const isImage = (imageExts.includes(ext) || imageExts.includes(nameExt) || a.type?.startsWith('image/')) && !isPdf;
                
                const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp'];
                const isDoc = officeExts.includes(ext) || officeExts.includes(nameExt) || a.type?.includes('officedocument') || a.type?.includes('msword') || a.type?.includes('ms-excel') || a.type?.includes('ms-powerpoint');
                
                const isText = ['txt', 'md', 'js', 'css', 'json', 'html', 'py', 'c', 'cpp'].includes(ext) || ['txt', 'md', 'js', 'css', 'json', 'html', 'py', 'c', 'cpp'].includes(nameExt) || a.type?.startsWith('text/');

                return (
                    <div key={i} style={{ marginBottom: 6 }} onClick={e => { e.stopPropagation(); onPreview(a); }}>
                        {isImage ? (
                            <img src={a.url} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, display: 'block', cursor: 'pointer' }} />
                        ) : (
                            <div
                                style={{
                                    color: '#1a73e8', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
                                    display: 'inline-block', padding: '4px 0',
                                }}
                            >
                                📎 {a.name || 'File'}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function MessageStatus({ msg, isOwn, totalMembers, isSpace }) {
    if (!isOwn) return null;

    // Handle optimistic "sending" state
    if (msg.is_sending) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 4, transform: 'translateY(2px)', opacity: 0.6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 2s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
            </div>
        );
    }

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
                    <path d="M0.5 5.5L3.5 8.5L10.5 1.5" stroke={tickColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.5 5.5L8.5 8.5L15.5 1.5" stroke={tickColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: -4 }} />
                </svg>
            ) : (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1.5" stroke="var(--ws-text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    );
}

function MessageInfoModal({ msg, onClose, allUsers = [], currentUserId }) {
    const receipts = msg.receipts || [];
    const filteredReceipts = receipts.filter(r => r.userId !== currentUserId);

    // Helper to ensure database timestamps are treated as UTC if they lack a timezone
    const parseUTC = (d) => {
        if (!d) return null;
        if (typeof d !== 'string') return new Date(d);
        const hasTZ = d.includes('Z') || d.includes('+') || (d.includes('-') && d.split('-').length > 3);
        return new Date(hasTZ ? d : `${d.replace(' ', 'T')}Z`);
    };

    const createdDate = msg.created_at ? parseUTC(msg.created_at) : new Date();
    const sentTime = createdDate.toLocaleString([], {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'
    });

    const getReceiptDetails = () => {
        return filteredReceipts.map(r => {
            const u = allUsers.find(user => user.id === r.userId) || { name: 'Unknown User' };
            const dDate = parseUTC(r.deliveredAt);
            const sDate = parseUTC(r.seenAt);
            return {
                name: u.name,
                avatar_url: u.avatar_url,
                delivered: dDate ? dDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Pending',
                deliveredDate: dDate ? dDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : null,
                seen: sDate ? sDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not yet',
                seenDate: sDate ? sDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : null,
            };
        });
    };

    const details = getReceiptDetails();

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={onClose}>
            <div style={{
                background: 'var(--ws-bg)', borderRadius: 24, width: '100%', maxWidth: 420,
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--ws-border)',
                overflow: 'hidden', animation: 'modalEntry 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} onClick={e => e.stopPropagation()}>
                <style>{`
          @keyframes modalEntry {
            from { transform: scale(0.9) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ws-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ws-surface)' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ws-text)', letterSpacing: '-0.02em' }}>Message Info</h3>
                    <button onClick={onClose} style={{ background: 'var(--ws-surface-2)', border: 'none', color: 'var(--ws-text)', cursor: 'pointer', fontSize: 14, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ padding: '16px 20px', background: 'var(--ws-surface-2)', borderRadius: 16, marginBottom: 24 }}>
                        <p style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--ws-text)', lineHeight: 1.6 }}>{msg.text}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ws-text-muted)', fontSize: 13 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            Sent: {sentTime}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {details.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <p style={{ fontSize: 14, color: 'var(--ws-text-muted)', margin: 0 }}>Waiting for recipients...</p>
                            </div>
                        ) : details.map((d, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12 }}>
                                <Avatar initials={initials(d.name)} color="#0D9488" size={40} avatarUrl={d.avatar_url} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14, color: 'var(--ws-text)' }}>{d.name}</p>
                                    <div style={{ display: 'flex', gap: 24 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase' }}>Delivered</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 13, color: 'var(--ws-text)' }}>{d.delivered}</p>
                                            {d.deliveredDate && <p style={{ margin: 0, fontSize: 10, color: 'var(--ws-text-muted)' }}>{d.deliveredDate}</p>}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#34B7F1', textTransform: 'uppercase' }}>Seen</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 13, color: 'var(--ws-text)' }}>{d.seen}</p>
                                            {d.seenDate && <p style={{ margin: 0, fontSize: 10, color: 'var(--ws-text-muted)' }}>{d.seenDate}</p>}
                                        </div>
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

function ForwardModal({ spaces, dmUsers, onClose, onForward }) {
    const [search, setSearch] = useState('');

    const allDestinations = [
        ...spaces.map(s => ({ id: s.id, type: 'space', name: s.name, initials: s.name.substring(0, 2).toUpperCase() })),
        ...dmUsers.map(u => ({ id: u.id, type: 'dm', name: u.name, initials: u.initials, avatar_url: u.avatar_url }))
    ].filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={onClose}>
            <div style={{
                background: 'var(--ws-bg)', borderRadius: 24, width: '100%', maxWidth: 400,
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--ws-border)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh',
                animation: 'modalEntry 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ws-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ws-surface)' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ws-text)', letterSpacing: '-0.02em' }}>Forward Message</h3>
                    <button onClick={onClose} style={{ background: 'var(--ws-surface-2)', border: 'none', color: 'var(--ws-text)', cursor: 'pointer', fontSize: 14, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--ws-border)' }}>
                    <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ws-text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search spaces or people..."
                            autoFocus
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12, border: '1px solid var(--ws-border)', background: 'var(--ws-bg)', color: 'var(--ws-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {allDestinations.map(d => (
                        <button key={`${d.type}-${d.id}`} onClick={() => { onForward(d); onClose(); }} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                            background: 'none', border: 'none', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.1s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            {d.type === 'space' ? (
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ws-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ws-text-muted)' }}>
                                    #{d.initials[0]}
                                </div>
                            ) : (
                                <Avatar initials={d.initials} avatarUrl={d.avatar_url} size={40} color="#0D9488" />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.type === 'space' ? `#${d.name}` : d.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600 }}>{d.type === 'space' ? 'Space' : 'Direct Message'}</div>
                            </div>
                            <div style={{ background: 'rgba(13,148,136,0.1)', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#0D9488' }}>Forward</div>
                        </button>
                    ))}
                    {allDestinations.length === 0 && (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: 14, color: 'var(--ws-text-muted)', margin: 0 }}>No results found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageContextMenu({ isOwn, isStarred, onClose, onInfo, onDeleteForMe, onDeleteForEveryone, onEmojis, onEdit, onForward, onReply, onToggleStar }) {
    const [showDeleteSub, setShowDeleteSub] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div ref={ref} style={{
            position: 'absolute', bottom: 'calc(100% + 5px)',
            right: isOwn ? 0 : 'auto',
            left: isOwn ? 'auto' : 0,
            zIndex: 1000,
            background: 'var(--ws-bg)', border: '1px solid var(--ws-border)',
            borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            padding: '6px 0', minWidth: 160,
            animation: 'menuEntry 0.15s ease-out'
        }} onClick={e => e.stopPropagation()}>
            <style>{`
        @keyframes menuEntry {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .menu-item {
          display: flex; alignItems: center; gap: 10px;
          width: 100%; padding: 8px 14px;
          background: none; border: none;
          color: var(--ws-text); font-size: 13px;
          cursor: pointer; text-align: left;
          transition: background 0.1s;
        }
        .menu-item:hover { background: var(--ws-hover); }
        .menu-item svg { color: var(--ws-text-muted); }
      `}</style>

            {!showDeleteSub ? (
                <>
                    {isOwn && (
                        <button className="menu-item" onClick={onInfo}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            Message Info
                        </button>
                    )}
                    <button className="menu-item" onClick={onEmojis}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                        Emojis
                    </button>
                    <button className="menu-item" onClick={() => setShowDeleteSub(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        Delete
                    </button>
                    {isOwn && (
                        <button className="menu-item" onClick={onEdit}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Edit
                        </button>
                    )}
                    <button className="menu-item" onClick={onReply}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17L4 12L9 7" /><path d="M20 18V14C20 12.3431 18.6569 11 17 11H5" /></svg>
                        Reply
                    </button>
                    <button className="menu-item" onClick={onForward}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 10 5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
                        Forward
                    </button>
                    <button className="menu-item" onClick={onToggleStar}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {isStarred ? 'Unstar' : 'Star'}
                    </button>
                </>
            ) : (
                <>
                    <button className="menu-item" onClick={() => setShowDeleteSub(false)} style={{ color: 'var(--ws-text-muted)', fontSize: 11, fontWeight: 700 }}>
                        ← BACK
                    </button>
                    <button className="menu-item" onClick={onDeleteForMe}>Delete for me</button>
                    {isOwn && <button className="menu-item" onClick={onDeleteForEveryone} style={{ color: '#ef4444' }}>Delete for everyone</button>}
                </>
            )}
        </div>
    );
}

function MessageBubble({
    msg, currentUserId, onEdit, onReact, onRemoveReact,
    isEditing, editContent, onEditChange, onEditSave, onEditCancel,
    totalMembers, isSpace, onShowInfo, onDeleteMessage, onHideMessage, onForward, onReply,
    onQuoteClick, onToggleStar, isMobile, showSenderInfo, onPreview
}) {
    const [hovered, setHovered] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [menuPos, setMenuPos] = useState(null);
    const [pickerPos, setPickerPos] = useState(null);

    const isOwn = msg.senderId === currentUserId;
    const reactions = groupReactions(msg.reactions);

    const handleOpenMenu = (e) => {
        e.preventDefault();
        setMenuPos(true);
    };

    const closeMenu = () => setMenuPos(false);

    return (
        <div
            id={`message-${msg.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8, padding: '2px 16px', position: 'relative',
            }}
        >
            {!isOwn && (
                <div style={{ flexShrink: 0, marginBottom: 4, width: 32 }}>
                    {showSenderInfo && (
                        msg.avatar_url
                            ? <img src={msg.avatar_url} alt={msg.senderName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            : <Avatar initials={initials(msg.senderName)} color="#0D9488" size={32} />
                    )}
                </div>
            )}

            <div style={{ maxWidth: isMobile ? 'min(88%, 340px)' : 'min(72%, 600px)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                {showSenderInfo && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                        {!isOwn && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text)' }}>{msg.senderName}</span>}
                        <span style={{ fontSize: 10, color: 'var(--ws-text-muted)' }}>{msg.time}</span>
                        {msg.is_edited && <span style={{ fontSize: 10, color: 'var(--ws-text-muted)', fontStyle: 'italic' }}>(edited)</span>}
                        {msg.is_forwarded && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--ws-text-muted)', fontStyle: 'italic', opacity: 0.8 }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 10 5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
                                Forwarded
                            </span>
                        )}
                    </div>
                )}

                {(msg.parentContent || msg.parentMessageId) && (
                    <div
                        onClick={(e) => { e.stopPropagation(); onQuoteClick(msg.parentMessageId); }}
                        style={{
                            borderLeft: '3px solid #0D9488',
                            padding: '4px 8px', marginBottom: 4,
                            background: 'var(--ws-surface-2)',
                            borderRadius: '0 6px 6px 0', fontSize: 12,
                            color: 'var(--ws-text-muted)',
                            maxWidth: 280,
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}>
                        <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 11, color: '#0D9488' }}>↩ {msg.parentSenderName}</div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {(() => {
                                const text = msg.parentContent;
                                let atts = msg.parentAttachments;
                                if (typeof atts === 'string') try { atts = JSON.parse(atts); } catch { atts = []; }

                                if (text) return text;
                                if (!atts || !atts.length) return '📎 Attachment';

                                const a = atts[0];
                                const isAudio = a.type?.startsWith('audio/') || a.isVoice || /\.(webm|ogg|mp3|m4a|wav|mp4)$/i.test(a.url);
                                const isImage = (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(a.url) || a.type?.startsWith('image/'));

                                if (isAudio) return <>🎤 Voice message</>;
                                if (isImage) return <>📷 Photo</>;
                                return <>📎 {a.name || 'File'}</>;
                            })()}
                        </div>
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
                        onClick={handleOpenMenu}
                        style={{
                            background: isOwn ? 'var(--ws-bubble-own)' : 'var(--ws-bubble-other)',
                            color: isOwn ? 'var(--ws-bubble-own-text)' : 'var(--ws-bubble-other-text)',
                            padding: '8px 12px',
                            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isOwn ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            border: isOwn ? '1px solid var(--ws-border)' : 'none',
                            transition: 'transform 0.1s, opacity 0.2s',
                            position: 'relative',
                            opacity: msg.is_sending ? 0.7 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div>
                            {(msg.text || '').split(/(@[\w ]+)/).map((part, i) =>
                                part.startsWith('@')
                                    ? <span key={i} style={{ fontWeight: 600, opacity: 0.9 }}>{part}</span>
                                    : <span key={i}>{part}</span>
                            )}
                        </div>
                        <AttachmentPreview attachments={msg.attachments} isOwn={isOwn} onPreview={onPreview} />
                        <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <MessageStatus msg={msg} isOwn={isOwn} totalMembers={totalMembers} isSpace={isSpace} />
                        </div>
                        {menuPos && (
                            <MessageContextMenu
                                isOwn={isOwn}
                                isStarred={msg.isStarred}
                                onClose={closeMenu}
                                onInfo={() => { onShowInfo(msg); closeMenu(); }}
                                onDeleteForMe={() => { onDeleteMessage(msg.id, false); closeMenu(); }}
                                onDeleteForEveryone={() => { onDeleteMessage(msg.id, true); closeMenu(); }}
                                onEmojis={() => { setShowPicker(true); closeMenu(); }}
                                onEdit={() => { onEdit(msg.id, msg.text); closeMenu(); }}
                                onReply={() => { onReply(msg); closeMenu(); }}
                                onForward={() => { onForward(msg); closeMenu(); }}
                                onToggleStar={() => { onToggleStar(msg); closeMenu(); }}
                            />
                        )}
                    </div>
                )}

                {showPicker && (
                    <div style={{ position: 'absolute', bottom: '100%', left: isOwn ? 'auto' : 0, right: isOwn ? 0 : 'auto', zIndex: 1001, marginBottom: 8 }}>
                        <EmojiPicker onSelect={(emoji) => { onReact(msg.id, emoji); setShowPicker(false); }} onClose={() => setShowPicker(false)} />
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

function MentionDropdown({ users, search, onSelect, currentUserId }) {
    // De-duplicate users by ID and filter out the current user
    const uniqueUsers = Array.from(new Map((users || []).filter(u => u.id !== currentUserId).map(u => [u.id, u])).values());
    const filtered = uniqueUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
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

function SearchResultsPanel({ results, query, onSelectResult, onClose, loading, isSpace, dmPartnerName }) {
    return (
        <div style={{
            position: 'absolute', top: 57, left: 0, right: 0, bottom: 0, zIndex: 30,
            background: 'var(--ws-bg)', borderTop: '0.5px solid var(--ws-border)', overflowY: 'auto',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-bg)' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)' }}>
                    {loading ? 'Searching history...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
                </span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 16 }}>✕</button>
            </div>
            {!loading && results.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ws-text-muted)', fontSize: 14 }}>
                    No messages found in this {isSpace ? 'space' : 'conversation'}.
                </div>
            )}
            {results.map(r => (
                <button key={r.id} onClick={() => onSelectResult(r)} style={{
                    width: '100%', display: 'flex', gap: 12, padding: '14px 20px',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: '0.5px solid var(--ws-border)', transition: 'background 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    <Avatar initials={initials(r.sender_name)} color="#0D9488" size={36} avatarUrl={r.avatar_url} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{r.sender_name}</span>
                            <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 400 }}>
                                {isSpace ? `in #${r.space_name || ''}` : `in DM with ${dmPartnerName || ''}`}
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ws-text)', margin: 0, lineHeight: 1.5 }}>
                            <Highlight text={r.content} highlight={query} />
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', marginTop: 4 }}>
                            {new Date(r.created_at).toLocaleString()}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}

function Highlight({ text = '', highlight = '' }) {
    if (!highlight.trim()) return text;
    const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safeHighlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase()
                    ? <mark key={i} style={{ background: '#fef08a', color: '#854d0e', borderRadius: 2, padding: '0 2px' }}>{part}</mark>
                    : <span key={i}>{part}</span>
            )}
        </>
    );
}

export default function ChatArea({
    activeView, title, isSpace, messages, onSend, onEdit, onDelete, onReact, onRemoveReact,
    messagesLoading, hasMore, onLoadMore, currentUserId, allSpaces, dmUsers, onForwardMessage,
    spaceMembers, onAddReaction, onRemoveReaction, onDeleteMessage, onHideMessage,
    onToggleStar, description, isMaximized, onToggleMaximize, onClose,
    highlightMessageId, spaceId, dmConversationId, typingUsers, onTypingChange, allUsers,
    isMobile,
}) {
    const [previewFile, setPreviewFile] = useState(null);
    const memberCount = spaceMembers?.length || 0;
    const [loadingMore, setLoadingMore] = useState(false);
    const [input, setInput] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const scrollRef = useRef(null);
    const [isPrepending, setIsPrepending] = useState(false);
    const [justPrepended, setJustPrepended] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [floatingDate, setFloatingDate] = useState('');
    const [showFloatingDate, setShowFloatingDate] = useState(false);
    const prevScrollHeightRef = useRef(0);
    const scrollTimeoutRef = useRef(null);

    const [, setMidnightRefresh] = useState(0);

    // Re-calculate date labels at midnight to ensure 'Today' becomes 'Yesterday'
    useEffect(() => {
        const now = new Date();
        const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
        const msToMidnight = night.getTime() - now.getTime();

        const timer = setTimeout(() => {
            setMidnightRefresh(v => v + 1);
        }, msToMidnight);

        return () => clearTimeout(timer);
    }, []);

    const [showMembers, setShowMembers] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const [replyingTo, setReplyingTo] = useState(null);
    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionStartPos, setMentionStartPos] = useState(-1);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [infoMessage, setInfoMessage] = useState(null);
    const [forwardMessage, setForwardMessage] = useState(null);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimerRef = useRef(null);
    const fileInputRef = useRef(null);
    const searchTimerRef = useRef(null);
    const messageRefs = useRef({});

    const scrollToMessage = (msgId) => {
        const el = document.getElementById(`message-${msgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.animation = 'highlightMessage 2s ease-out';
            setTimeout(() => {
                if (el) el.style.animation = '';
            }, 2000);
        }
    };

    useEffect(() => {
        setHasScrolledToBottom(false);
        setFloatingDate('');
        setShowFloatingDate(false);
    }, [title, messagesLoading]);

    useLayoutEffect(() => {
        if (!scrollRef.current || messagesLoading) return;

        if (isPrepending) {
            const delta = scrollRef.current.scrollHeight - prevScrollHeightRef.current;
            scrollRef.current.scrollTop = delta;
            setIsPrepending(false);
            setJustPrepended(true);
            setTimeout(() => setJustPrepended(false), 200);
        } else if (!loadingMore && !highlightMessageId && !isPrepending && !justPrepended) {
            if (!hasScrolledToBottom) {
                // Use a small timeout to ensure the browser has finished layout for thousands of pixels
                const jump = () => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                        setHasScrolledToBottom(true);
                    }
                };
                jump();
                requestAnimationFrame(jump); // Second pass to be sure
            } else {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages.length, loadingMore, highlightMessageId, isPrepending, justPrepended, hasScrolledToBottom, messagesLoading]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;

        // Show floating date
        setShowFloatingDate(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setShowFloatingDate(false), 1500);

        // Find first visible message's date
        const containerTop = container.getBoundingClientRect().top;
        let foundDate = '';
        for (const m of messages) {
            const el = messageRefs.current[m.id];
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= containerTop + 100) {
                    foundDate = formatDateLabel(m.created_at);
                } else {
                    break;
                }
            }
        }
        if (foundDate) setFloatingDate(foundDate);

        // Infinite scroll: auto-load more messages when reaching the top
        if (container.scrollTop < 50 && hasMore && !loadingMore && !isPrepending) {
            onLoadMore();
            setIsPrepending(true);
            prevScrollHeightRef.current = container.scrollHeight;
        }
    };


    useEffect(() => {
        if (highlightMessageId && messageRefs.current[highlightMessageId]) {
            messageRefs.current[highlightMessageId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const el = messageRefs.current[highlightMessageId];
            el.style.transition = 'background 0.5s';
            el.style.background = 'rgba(254, 240, 138, 0.4)';
            setTimeout(() => { el.style.background = 'none'; }, 2000);
        }
    }, [highlightMessageId, messages]);

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
                const results = await searchMessages(searchQuery.trim(), spaceId || null, dmConversationId || null);
                setSearchResults(results);
            } catch { }
            setSearchLoading(false);
        }, 350);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery, showSearch, spaceId, dmConversationId]);

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
        } catch (err) {
            console.error('Upload error:', err);
            // Show the real server error so it's easier to diagnose
            const serverMsg = err?.response?.data?.message;
            alert(serverMsg || 'File upload failed. The server might be restarting or there is a connection issue. Please try again in a moment.');
        }
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
            await onEdit(editingId, editContent.trim());
            setEditingId(null); setEditContent('');
        } catch { }
    };

    const handleLoadMore = async () => {
        if (!onLoadMore) return;
        setIsPrepending(true);
        prevScrollHeightRef.current = scrollRef.current?.scrollHeight || 0;
        setLoadingMore(true);
        await onLoadMore();
        setLoadingMore(false);
    };

    if (activeView === 'home' || activeView === 'mentions' || (!title && !activeView)) {
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
            <style>{`
        @keyframes highlightMessage {
          0% { background: rgba(13, 148, 136, 0.2); }
          100% { background: transparent; }
        }
      `}</style>

            {/* Main Chat Content Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', height: '100%', overflow: 'hidden', minWidth: 0 }}>

                {/* Chat Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0, background: 'var(--ws-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        {isMobile && (
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center', padding: '4px', marginLeft: -4 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m15 18-6-6 6-6" />
                                </svg>
                            </button>
                        )}
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {isSpace && <span style={{ color: 'var(--ws-text-muted)', fontSize: 18, fontWeight: 300 }}>#</span>}
                                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ws-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h2>
                                {memberCount > 0 && <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', marginLeft: 2, whiteSpace: 'nowrap' }}>· {memberCount} members</span>}
                            </div>
                            {description && (
                                <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0, marginTop: 1, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        <button onClick={() => { setShowSearch(p => !p); setSearchQuery(''); setSearchResults([]); }} style={iconBtn(showSearch)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            Search
                        </button>
                        {isSpace && memberCount > 0 && (
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

                {/* Search Bar Overlay */}
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

                {/* Search Results Panel */}
                {showSearch && (searchQuery.trim() || searchLoading) && (
                    <SearchResultsPanel
                        results={searchResults}
                        query={searchQuery}
                        loading={searchLoading}
                        onSelectResult={(r) => {
                            scrollToMessage(r.id);
                            setShowSearch(false);
                            setSearchQuery('');
                        }}
                        onClose={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                        isSpace={isSpace}
                        dmPartnerName={title}
                    />
                )}

                {/* Messages Scrolling Area */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    style={{ flex: 1, overflowY: 'auto', paddingTop: 8, position: 'relative', width: '100%' }}
                >
                    {floatingDate && (
                        <div style={{
                            position: 'sticky', top: 12, zIndex: 100,
                            display: 'flex', justifyContent: 'center',
                            pointerEvents: 'none',
                            transition: 'opacity 0.3s ease-out',
                            opacity: showFloatingDate ? 1 : 0,
                            width: '100%',
                            marginBottom: -32, // Offset the space taken by the sticky container
                        }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700,
                                background: 'rgba(255, 255, 255, 0.8)',
                                color: '#374151',
                                padding: '5px 16px', borderRadius: 20,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                pointerEvents: 'auto',
                            }}>
                                {floatingDate}
                            </span>
                        </div>
                    )}

                    {messagesLoading ? <LoadingSkeleton /> : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {(() => {
                                let lastDate = null;
                                let lastSenderId = null;
                                let lastTime = null;

                                return messages.map((msg, idx) => {
                                    const dateStr = msg.created_at;
                                    const msgTime = dateStr ? new Date(dateStr).getTime() : 0;

                                    // Group messages if from same sender within 5 minutes
                                    const showSenderInfo = msg.senderId !== lastSenderId || (msgTime - lastTime > 5 * 60 * 1000);

                                    lastSenderId = msg.senderId;
                                    lastTime = msgTime;

                                    if (!dateStr) return (
                                        <div key={msg.id} id={`message-${msg.id}`} ref={el => messageRefs.current[msg.id] = el}>
                                            <MessageBubble
                                                msg={msg}
                                                currentUserId={currentUserId}
                                                onEdit={(id, text) => { setEditingId(id); setEditContent(text); }}
                                                onReact={onAddReaction}
                                                onRemoveReact={onRemoveReaction}
                                                onReply={(msg) => { setReplyingTo(msg); inputRef.current?.focus(); }}
                                                isEditing={editingId === msg.id}
                                                editContent={editingId === msg.id ? editContent : ''}
                                                onEditChange={setEditContent}
                                                onEditSave={handleEditSave}
                                                onEditCancel={() => { setEditingId(null); setEditContent(''); }}
                                                totalMembers={isSpace ? memberCount : 2}
                                                isSpace={isSpace}
                                                onShowInfo={setInfoMessage}
                                                onDeleteMessage={onDeleteMessage}
                                                onHideMessage={onHideMessage}
                                                onForward={setForwardMessage}
                                                onQuoteClick={scrollToMessage}
                                                onToggleStar={onToggleStar}
                                                isMobile={isMobile}
                                                showSenderInfo={showSenderInfo}
                                                onPreview={setPreviewFile}
                                            />
                                        </div>
                                    );

                                    const msgDate = new Date(dateStr).toDateString();
                                    const showDivider = msgDate !== lastDate;
                                    lastDate = msgDate;

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDivider && (
                                                <div style={{
                                                    display: 'flex', justifyContent: 'center',
                                                    padding: '32px 0 20px',
                                                }}>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600,
                                                        background: 'var(--ws-surface-2)',
                                                        color: 'var(--ws-text-muted)',
                                                        padding: '4px 16px', borderRadius: 20,
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                        border: '1px solid var(--ws-border)',
                                                    }}>
                                                        {formatDateLabel(msg.created_at)}
                                                    </span>
                                                </div>
                                            )}
                                            <div id={`message-${msg.id}`} ref={el => messageRefs.current[msg.id] = el}>
                                                <MessageBubble
                                                    msg={msg}
                                                    currentUserId={currentUserId}
                                                    onEdit={(id, text) => { setEditingId(id); setEditContent(text); }}
                                                    onReact={onAddReaction}
                                                    onRemoveReact={onRemoveReaction}
                                                    onReply={(msg) => { setReplyingTo(msg); inputRef.current?.focus(); }}
                                                    isEditing={editingId === msg.id}
                                                    editContent={editingId === msg.id ? editContent : ''}
                                                    onEditChange={setEditContent}
                                                    onEditSave={handleEditSave}
                                                    onEditCancel={() => { setEditingId(null); setEditContent(''); }}
                                                    totalMembers={isSpace ? memberCount : 2}
                                                    isSpace={isSpace}
                                                    onShowInfo={setInfoMessage}
                                                    onDeleteMessage={onDeleteMessage}
                                                    onHideMessage={onHideMessage}
                                                    onForward={setForwardMessage}
                                                    onQuoteClick={scrollToMessage}
                                                    onToggleStar={onToggleStar}
                                                    isMobile={isMobile}
                                                    showSenderInfo={showSenderInfo}
                                                    onPreview={setPreviewFile}
                                                />
                                            </div>
                                        </React.Fragment>
                                    );
                                });
                            })()}
                            <div ref={bottomRef} style={{ height: 1 }} />
                        </div>
                    )}
                </div>

                {/* Typing Indicator */}
                {typingUsers?.length > 0 && (
                    <div style={{ padding: '2px 16px 4px', fontSize: 11, color: 'var(--ws-text-muted)', fontStyle: 'italic' }}>
                        {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`}
                    </div>
                )}

                {/* Pending Files Preview */}
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

                {/* Reply Context Bar */}
                {replyingTo && (
                    <div style={{
                        background: 'var(--ws-surface)', padding: '10px 16px', borderRadius: '16px 16px 0 0',
                        border: '1px solid var(--ws-border)', borderBottom: 'none',
                        display: 'flex', alignItems: 'center', gap: 12, animation: 'slideUp 0.2s ease-out'
                    }}>
                        <style>{`
               @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
             `}</style>
                        <div style={{ borderLeft: '3px solid #0D9488', paddingLeft: 10, flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', marginBottom: 2 }}>Replying to {replyingTo.senderName}</div>
                            <div style={{ fontSize: 13, color: 'var(--ws-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {replyingTo.text || (
                                    replyingTo.attachments?.length
                                        ? (replyingTo.attachments.some(a => a.type?.startsWith('audio/') || a.isVoice) ? '🎤 Voice message'
                                            : replyingTo.attachments.some(a => a.type?.startsWith('image/')) ? '📷 Photo'
                                                : '📎 Attachment')
                                        : '📎 Attachment'
                                )}
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'var(--ws-hover)', border: 'none', color: 'var(--ws-text)', cursor: 'pointer', width: 24, height: 24, borderRadius: '50%', fontSize: 10 }}>✕</button>
                    </div>
                )}

                {/* Forward Modal */}
                {forwardMessage && (
                    <ForwardModal
                        spaces={allSpaces}
                        dmUsers={dmUsers}
                        onClose={() => setForwardMessage(null)}
                        onForward={(target) => onForwardMessage(target, forwardMessage)}
                    />
                )}

                {/* Message Input Area */}
                <div style={{ padding: '8px 16px 14px', flexShrink: 0, position: 'relative' }}>
                    {showMentionDropdown && (
                        <MentionDropdown
                            users={allUsers}
                            search={mentionSearch}
                            onSelect={handleMentionSelect}
                            currentUserId={currentUserId}
                        />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ws-input-bg)', borderRadius: replyingTo ? '0 0 16px 16px' : 16, padding: '8px 12px', border: '0.5px solid var(--ws-border)', transition: 'border-color 0.15s' }}>
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
                        <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv,audio/*" />

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

                        {(input.trim() || pendingFiles.length) ? (
                            <button onClick={handleSend}
                                style={{
                                    width: 32, height: 32, borderRadius: 8, border: 'none',
                                    cursor: 'pointer',
                                    background: '#0D9488',
                                    color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                            </button>
                        ) : (
                            <VoiceRecorder onSend={onSend} disabled={uploadingFile} replyingTo={replyingTo} onReplySent={() => setReplyingTo(null)} />
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Members (only for spaces) */}
            {showMembers && isSpace && (
                <div style={{ width: 240, borderLeft: '0.5px solid var(--ws-border)', background: 'var(--ws-bg)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0 }}>
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

            {/* Modals */}
            {infoMessage && (
                <MessageInfoModal
                    msg={infoMessage}
                    onClose={() => setInfoMessage(null)}
                    allUsers={allUsers}
                    currentUserId={currentUserId}
                />
            )}

            {previewFile && (
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
}

function FilePreviewModal({ file, onClose }) {
    if (!file) return null;

    const uExt = (file.url || '').split('?')[0].split('.').pop().toLowerCase();
    const nExt = (file.name || '').split('.').pop().toLowerCase();
    
    const isPdf = uExt === 'pdf' || nExt === 'pdf' || file.type?.toLowerCase().includes('pdf');
    
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    const isImage = (imageExts.includes(uExt) || imageExts.includes(nExt) || file.type?.startsWith('image/')) && !isPdf;
    
    const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(uExt) || ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(nExt) || file.type?.startsWith('video/');
    
    const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp'];
    const isOffice = officeExts.includes(uExt) || officeExts.includes(nExt) || file.type?.includes('officedocument') || file.type?.includes('msword') || file.type?.includes('ms-excel') || file.type?.includes('ms-powerpoint');
    
    const isText = ['txt', 'md', 'js', 'css', 'json', 'html', 'py', 'c', 'cpp'].includes(uExt) || ['txt', 'md', 'js', 'css', 'json', 'html', 'py', 'c', 'cpp'].includes(nExt) || file.type?.startsWith('text/');

    const handleDownload = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await downloadAttachment(file.url, file.name || 'file');
            const blob = response.data;
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', file.name || 'attachment');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed. Please try again.');
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                zIndex: 10000, display: 'flex', flexDirection: 'column',
                backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
            }}
            onClick={onClose}
        >
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', background: 'rgba(0,0,0,0.3)', color: '#fff'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name || 'File Preview'}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            background: '#0D9488', color: '#fff', border: 'none',
                            padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
                        }}
                    >
                        Download
                    </button>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24, padding: '0 8px' }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'hidden' }}
                onClick={onClose}
            >
                <div
                    style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={e => e.stopPropagation()}
                >
                    {isImage ? (
                        <img
                            src={file.url}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                        />
                    ) : (isPdf || isOffice) ? (
                        <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                            title="File Preview"
                            style={{ width: 'min(94vw, 1100px)', height: '88vh', border: 'none', borderRadius: 8, background: '#fff' }}
                        />
                    ) : isText ? (
                        <iframe
                            src={file.url}
                            title="Text Preview"
                            style={{ width: 'min(90vw, 1000px)', height: '85vh', border: 'none', borderRadius: 8, background: '#fff' }}
                        />
                    ) : (
                        <div style={{
                            background: 'var(--ws-surface-2)', padding: '40px 60px',
                            borderRadius: 16, textAlign: 'center', color: 'var(--ws-text)'
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>📎</div>
                            <h3 style={{ margin: '0 0 8px' }}>No Preview Available</h3>
                            <p style={{ color: 'var(--ws-text-muted)', margin: '0 0 24px' }}>This file type cannot be previewed in-app.</p>
                            <button
                                onClick={handleDownload}
                                style={{
                                    background: '#0D9488', color: '#fff', border: 'none',
                                    padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                                    fontSize: 14, fontWeight: 600
                                }}
                            >
                                Download to View
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
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