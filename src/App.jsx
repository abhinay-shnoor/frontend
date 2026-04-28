import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import AdminApp from './Admin/AdminApp.jsx';
import ProfileSettingsModal from './components/ui/ProfileSettingsModal.jsx';
import ChatSettingsModal from './components/ui/ChatSettingsModal.jsx';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiePolicyPage from './pages/CookiepolicyPage';
import SecurityPage from './pages/SecurityPage';

import TopNavbar from './components/layout/TopNavbar.jsx';
import LeftSidebar from './components/layout/LeftSidebar.jsx';
import ConversationList from './components/layout/ConversationList.jsx';
import ChatArea from './components/layout/ChatArea.jsx';
import RightIconRail from './components/layout/RightIconRail.jsx';
import GlobalSearch from './components/features/GlobalSearch.jsx';
import CalendarView from './components/calendar/CalendarView.jsx';
import { 
  getSpaces, 
  createSpace, 
  getSpaceMessages, 
  sendSpaceMessage, 
  editSpaceMessage, 
  deleteSpaceMessage,
  getSpaceMembers
} from './api/spaces.js';
import { getAllUsers, getDMMessages, sendDMMessage } from './api/users.js';
import { addReaction, removeReaction, getDMConversations, searchMessages, getMentions, markMentionsRead, starMessage, unstarMessage, getStarredMessages } from './api/messages.js';
import MentionsActivityFeed from './components/layout/MentionsActivityFeed.jsx';
import StarredMessagesFeed from './components/layout/StarredMessagesFeed.jsx';
import api from './api/axios.js';
import { requestNotificationPermission, showNotification } from './utils/notifications.js';

function ChatApp({ onSignOut, onOpenAdmin }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const {
    connected,
    joinSpace, leaveSpace, joinDM,
    onNewMessage, onMessageEdited, onMessageDeleted, onReactionUpdated,
    onDMJoined, onTypingUpdate, emitTyping, onlineUsers,
    onDMPreviewUpdated, onSpacePreviewUpdated, onUserRoleChanged,
    onReceiptUpdated, emitMarkDelivered, emitMarkSeen,
    emitStatusChange,
  } = useSocket();

  const currentUser = {
    id: user?.id,
    name: user?.name || 'User',
    email: user?.email,
    initials: (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488',
    avatar_url: user?.avatar_url,
  };

  const [spaces, setSpaces] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [dmConversations, setDmConversations] = useState([]);
  const [activeSpace, setActiveSpace] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [activeView, setActiveView] = useState('home');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [spaceMembers, setSpaceMembers] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [currentStatus, setCurrentStatus] = useState('active');
  const [isMaximized, setIsMaximized] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeDMConversationId, setActiveDMConversationId] = useState(null);
  const [highlightMessageId, setHighlightMessageId] = useState(null);

  const handleStatusChange = (status) => {
    setCurrentStatus(status);
    emitStatusChange(status);
  };

  const handleSelectSearchResult = (msg) => {
    if (msg.chat_type === 'space') {
      const space = spaces.find(s => s.id === msg.space_id);
      if (space) handleSelectSpace(space);
    } else if (msg.chat_type === 'dm') {
      const partner = allUsers.find(u => u.id === msg.dm_partner_id);
      if (partner) handleSelectDM(partner);
    }
    setHighlightMessageId(msg.id);
    setNavSearchQuery('');
    // Clear highlight after some time
    setTimeout(() => setHighlightMessageId(null), 3000);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1200;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [unreadCounts, setUnreadCounts] = useState({});
  const [mentionedMessages, setMentionedMessages] = useState([]);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const [starredMessages, setStarredMessages] = useState([]);

  const activeViewRef = useRef(activeView);
  const activeSpaceRef = useRef(activeSpace);
  const activeDMRef = useRef(activeDM);
  useEffect(() => { activeViewRef.current = activeView; }, [activeView]);
  useEffect(() => { activeSpaceRef.current = activeSpace; }, [activeSpace]);
  useEffect(() => { activeDMRef.current = activeDM; }, [activeDM]);

  const formatMsg = (m) => {
    if (!m) return m;
    if (m.senderId && m.time) return m;
    return {
      id: m.id, senderId: m.sender_id, senderName: m.sender_name,
      initials: (m.sender_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: '#0D9488', avatar_url: m.avatar_url,
      time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
      text: m.content || m.text, is_edited: m.is_edited, reactions: m.reactions || [],
      receipts: m.receipts || [], created_at: m.created_at,
      is_forwarded: m.is_forwarded,
      isStarred: !!m.is_starred,
      spaceId: m.space_id,
      conversationId: m.conversation_id,
      dmPartnerId: m.dm_partner_id,
      parentMessageId: m.parent_message_id || m.parentMessageId,
      parentContent: m.parent_content || m.parentContent,
      parentAttachments: m.parent_attachments || m.parentAttachments,
      parentSenderName: m.parent_sender_name || m.parentSenderName,
      attachments: m.attachments || [],
      source: m.source,
      sourceId: m.sourceId || m.space_id || m.dm_partner_id || m.sender_id,
      sourceType: m.sourceType || (m.space_id ? 'space' : 'dm'),
    };

  };

  const isMentioned = (text, isSpace) => {
    if (!text) return false;
    const name = user?.name || '';
    const firstName = name.split(' ')[0];
    return (
      (name && (text.toLowerCase().includes(`@${name.toLowerCase()}`) || text.includes(`@${name}`))) ||
      (firstName && (text.toLowerCase().includes(`@${firstName.toLowerCase()}`))) ||
      (isSpace && (text.toLowerCase().includes('@all') || text.toLowerCase().includes('@everyone')))
    );
  };

  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      requestNotificationPermission();
    }
  }, []);

  useEffect(() => {
    const handleCalendarBack = () => { setActiveView('home'); setActiveSpace(null); setActiveDM(null); };
    window.addEventListener('calendar:back', handleCalendarBack);
    return () => window.removeEventListener('calendar:back', handleCalendarBack);
  }, []);

  useEffect(() => {
    getSpaces().then(setSpaces).catch(() => showToast('Failed to load spaces', 'error'));
    getAllUsers().then(setAllUsers).catch(() => { });
    getDMConversations().then(setDmConversations).catch(() => { });
  }, []);

  useEffect(() => {
    if (user?.id) {
      getMentions().then(data => {
        if (data?.mentions) {
          setMentionedMessages(data.mentions.map(formatMsg));
          setUnreadMentions(data.unreadMentions || 0);
        }
      }).catch(err => console.error('Failed to fetch mentions:', err));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      getStarredMessages().then(data => {
        if (data?.messages) {
          setStarredMessages(data.messages.map(formatMsg));
        }
      }).catch(err => console.error('Failed to fetch starred messages:', err));
    }
  }, [user?.id]);


  useEffect(() => {
    if (!connected) return;
    // Removing redundant fetches — updateConversationPreviews handles this locally now.
    const cleanups = [
      // onDMPreviewUpdated(() => { getDMConversations().then(setDmConversations).catch(() => { }); }),
      // onSpacePreviewUpdated(() => { getSpaces().then(setSpaces).catch(() => { }); })
    ];
    return () => cleanups.forEach(fn => fn());
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    return onUserRoleChanged(() => refreshUser());
  }, [connected]);

  useEffect(() => {
    if (activeView === 'space' && activeSpace) {
      setMessagesLoading(true);
      setActiveDMConversationId(null);
      getSpaceMessages(activeSpace.id)
        .then(data => {
          setMessages(data?.messages || []);
          setHasMore(data?.hasMore || false);
        })
        .catch(() => showToast('Failed to load messages', 'error'))
        .finally(() => setMessagesLoading(false));
      setUnreadCounts(prev => ({ ...prev, [`space_${activeSpace.id}`]: 0 }));
    } else if (activeView === 'dm' && activeDM) {
      setMessagesLoading(true);
      getDMMessages(activeDM.id)
        .then(data => {
          if (data) {
            setMessages(data.messages || []);
            setHasMore(data.hasMore || false);
            if (data.conversationId) setActiveDMConversationId(data.conversationId);
          } else {
            setMessages([]);
            setHasMore(false);
          }
        })
        .catch(() => showToast('Failed to load messages', 'error'))
        .finally(() => setMessagesLoading(false));
      setUnreadCounts(prev => ({ ...prev, [`dm_${activeDM.id}`]: 0 }));
    } else {
      setMessages([]); setHasMore(false);
      setActiveDMConversationId(null);
    }
  }, [activeSpace, activeDM, activeView]);

  useEffect(() => {
    if (activeView !== 'space' || !activeSpace) return;
    joinSpace(activeSpace.id);
    const cleanups = [
      onNewMessage((msg) => {
        if (msg.space_id !== activeSpace.id) return;
        setMessages(prev => {
          // 1. If we already have this exact message ID, skip
          if (prev.find(m => m.id === msg.id)) return prev;

          // 2. If this is our own message, check if we have a matching optimistic message
          if (msg.sender_id === user?.id) {
            const tempMatch = prev.find(m => 
              m.id.toString().startsWith('temp-') && 
              m.text === (msg.content || msg.text)
            );
            if (tempMatch) {
              // Replace optimistic with real message
              return prev.map(m => m.id === tempMatch.id ? formatMsg(msg) : m);
            }
          }

          // 3. Otherwise, just add it
          return [...prev, formatMsg(msg)];
        });
      }),
      onMessageEdited((msg) => {
        if (msg.space_id !== activeSpace.id) return;
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...formatMsg(msg), reactions: m.reactions } : m));
      }),
      onMessageDeleted(({ messageId, spaceId }) => {
        if (spaceId !== activeSpace.id) return;
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }),
      onReactionUpdated(({ messageId, reactions }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
      }),
      onTypingUpdate(({ userId: uid, userName, isTyping }) => {
        if (uid === user?.id) return;
        setTypingUsers(prev => isTyping ? [...new Set([...prev, userName])] : prev.filter(n => n !== userName));
      }),
      onReceiptUpdated(({ messageId, receipts }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, receipts } : m));
      }),
    ];
    return () => { leaveSpace(activeSpace.id); cleanups.forEach(fn => fn?.()); };
  }, [activeSpace, activeView, connected]);

  useEffect(() => {
    if (activeView !== 'dm' || !activeDM) return;
    joinDM(activeDM.id);
    const cleanups = [
      onDMJoined(({ conversationId }) => setActiveDMConversationId(conversationId)),
      onNewMessage((msg) => {
        // Only process if it belongs to a DM conversation
        if (!msg.conversation_id) return;
        
        // If we have a known active conversation ID, verify it matches
        if (activeDMConversationId && msg.conversation_id !== activeDMConversationId) return;

        setMessages(prev => {
          // 1. If we already have this exact message ID, skip
          if (prev.find(m => m.id === msg.id)) return prev;

          // 2. If this is our own message, check for a matching optimistic message
          if (msg.sender_id === user?.id) {
            const tempMatch = prev.find(m => 
              m.id.toString().startsWith('temp-') && 
              m.text === (msg.content || msg.text)
            );
            if (tempMatch) {
              // Replace optimistic with real message
              return prev.map(m => m.id === tempMatch.id ? formatMsg(msg) : m);
            }
          }

          // 3. Otherwise, just add it
          return [...prev, formatMsg(msg)];
        });
      }),
      onReactionUpdated(({ messageId, reactions }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
      }),
      onMessageEdited((msg) => {
        if (!msg.conversation_id) return;
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...formatMsg(msg), reactions: m.reactions } : m));
      }),
      onMessageDeleted(({ messageId, conversationId }) => {
        if (!conversationId) return;
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }),
      onTypingUpdate(({ userId: uid, userName, isTyping }) => {
        if (uid === user?.id) return;
        setTypingUsers(prev => isTyping ? [...new Set([...prev, userName])] : prev.filter(n => n !== userName));
      }),
      onReceiptUpdated(({ messageId, receipts }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, receipts } : m));
      }),
    ];
    return () => cleanups.forEach(fn => fn?.());
  }, [activeDM, activeView, connected]);

  const updateConversationPreviews = (msg) => {
    if (!msg) return;
    const content = msg.content || msg.text || (msg.attachments?.length ? (msg.attachments[0].isVoice ? '🎤 Voice message' : '📎 Attachment') : '');
    const createdAt = msg.created_at || new Date().toISOString();

    if (msg.space_id) {
      setSpaces(prev => prev.map(s =>
        s.id === msg.space_id ? {
          ...s,
          last_message: content,
          last_message_at: createdAt,
          last_message_sender: msg.sender_name
        } : s
      ));
    }

    if (msg.conversation_id) {
      setDmConversations(prev => prev.map(d =>
        d.conversation_id === msg.conversation_id ? {
          ...d,
          last_message: content,
          last_message_at: createdAt,
          last_message_sender_id: msg.sender_id,
          last_message_sender_name: msg.sender_name
        } : d
      ));
    }
  };

  useEffect(() => {
    if (!connected || !user?.id) return;
    const cleanup = onNewMessage((msg) => {
      updateConversationPreviews(msg);

      if (msg.sender_id === user.id) return;

      const content = msg.content || msg.text || (msg.attachments?.length ? 'Attachment' : '');

      if (msg.space_id) {
        if (activeViewRef.current !== 'space' || activeSpaceRef.current?.id !== msg.space_id) {
          setUnreadCounts(prev => ({ ...prev, [`space_${msg.space_id}`]: (prev[`space_${msg.space_id}`] || 0) + 1 }));
        }
      }
      if (msg.conversation_id && msg.sender_id) {
        if (activeViewRef.current !== 'dm' || activeDMRef.current?.id !== msg.sender_id) {
          setUnreadCounts(prev => ({ ...prev, [`dm_${msg.sender_id}`]: (prev[`dm_${msg.sender_id}`] || 0) + 1 }));
        }
      }
      if (isMentioned(content, !!msg.space_id)) {
        const formatted = formatMsg(msg);
        setMentionedMessages(prev => [{ ...formatted, source: msg.space_id ? (spaces.find(s => s.id === msg.space_id)?.name || 'space') : 'Direct Message', sourceId: msg.space_id || msg.sender_id, sourceType: msg.space_id ? 'space' : 'dm' }, ...prev]);
        if (activeViewRef.current !== 'mentions') setUnreadMentions(prev => prev + 1);
      }
      const isFocused = document.visibilityState === 'visible' && document.hasFocus();
      if ((activeViewRef.current !== (msg.space_id ? 'space' : 'dm') || (msg.space_id ? activeSpaceRef.current?.id !== msg.space_id : activeDMRef.current?.id !== msg.sender_id)) || !isFocused) {
        showNotification(msg.sender_name, { body: content, icon: msg.avatar_url || '/shnoor-logo.png', tag: msg.space_id ? `space_${msg.space_id}` : `dm_${msg.sender_id}` });
      }
    });
    return cleanup;
  }, [connected, user?.id, spaces, allUsers]);

  const formattedSpaces = spaces.map(s => ({
    id: s.id, name: s.name, unread: unreadCounts[`space_${s.id}`] || 0,
    memberCount: s.member_count, last_message: s.last_message, last_message_at: s.last_message_at,
    last_message_sender: s.last_message_sender,
  }));

  const dmUsers = allUsers.filter(u => u.id !== user?.id).map(u => ({
    id: u.id, name: u.name, email: u.email, avatar_url: u.avatar_url,
    initials: (u.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', online: onlineUsers.has(u.id), unread: unreadCounts[`dm_${u.id}`] || 0,
  }));

  const handleSelectSpace = async (space) => {
    setActiveSpace(space); setActiveDM(null); setActiveView('space'); setSpaceMembers([]);
    setUnreadCounts(prev => ({ ...prev, [`space_${space.id}`]: 0 }));
    if (isMobile) setIsSidebarOpen(false);
    try { const members = await getSpaceMembers(space.id); setSpaceMembers(members); } catch { setSpaceMembers([]); }
  };

  const handleSelectDM = (dmUser) => {
    setActiveDM(dmUser); setActiveSpace(null); setActiveView('dm'); setActiveDMConversationId(null);
    setUnreadCounts(prev => ({ ...prev, [`dm_${dmUser.id}`]: 0 }));
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleCreateSpace = () => {
    // To be implemented
  };

  const handleBackToHome = () => { setActiveSpace(null); setActiveDM(null); setActiveView('home'); setIsMaximized(false); setMessages([]); setTypingUsers([]); setSpaceMembers([]); };
  const handleMentionsClick = () => {
    setActiveSpace(null);
    setActiveDM(null);
    setActiveView('mentions');
    setIsMaximized(false);
    setUnreadMentions(0);
    if (isMobile) setIsSidebarOpen(false);
    // Persist "read at NOW()" to the DB so the badge stays at 0 after a page refresh
    markMentionsRead().catch(err => console.warn('markMentionsRead failed:', err));
  };

  const handleSendMessage = async (text, parentMessageId = null, attachments = []) => {
    if (!text.trim() && !attachments.length) return;

    // 1. Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender_id: user.id,
      sender_name: user.name,
      avatar_url: user.avatar_url,
      content: text,
      text: text,
      created_at: new Date().toISOString(),
      attachments: attachments,
      is_sending: true, // Custom flag for visual feedback
      parent_message_id: parentMessageId,
      // For spaces/DMs
      space_id: activeView === 'space' ? activeSpace?.id : null,
      dm_partner_id: activeView === 'dm' ? activeDM?.id : null,
    };

    const formatted = formatMsg(optimisticMsg);
    
    // 2. Update UI immediately
    setMessages(prev => [...prev, formatted]);
    updateConversationPreviews(optimisticMsg);

    try {
      let result;
      if (activeView === 'space' && activeSpace) {
        result = await sendSpaceMessage(activeSpace.id, text, parentMessageId, attachments);
      } else if (activeView === 'dm' && activeDM) {
        result = await sendDMMessage(activeDM.id, text, parentMessageId, attachments);
      }

      if (result) {
        const confirmed = formatMsg(result);
        // 3. Replace optimistic message with confirmed one
        setMessages(prev => prev.map(m => m.id === tempId ? confirmed : m));
        updateConversationPreviews(result);
      }
    } catch (err) {
      console.error('handleSendMessage error:', err);
      showToast('Failed to send message', 'error');
      // 4. Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleEditMessage = async (msgId, content) => {
    try {
      if (activeView === 'space' && activeSpace) await editSpaceMessage(activeSpace.id, msgId, content);
      else if (activeView === 'dm' && activeDM) await api.patch(`/api/dm/${activeDM.id}/messages/${msgId}`, { content });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: content, is_edited: true } : m));
    } catch { showToast('Failed to edit message', 'error'); }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      if (activeView === 'space' && activeSpace) await deleteSpaceMessage(activeSpace.id, msgId);
      else if (activeView === 'dm' && activeDM) await api.delete(`/api/dm/${activeDM.id}/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { showToast('Failed to delete message', 'error'); }
  };

  const handleHideMessage = async (msgId) => {
    try { await api.post(`/api/messages/${msgId}/hide`); setMessages(prev => prev.filter(m => m.id !== msgId)); }
    catch { showToast('Failed to hide message', 'error'); }
  };

  const handleAddReaction = async (msgId, emoji) => {
    try { const result = await addReaction(msgId, emoji); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m)); }
    catch { showToast('Failed to add reaction', 'error'); }
  };

  const handleRemoveReaction = async (msgId, emoji) => {
    try { const result = await removeReaction(msgId, emoji); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m)); }
    catch { showToast('Failed to remove reaction', 'error'); }
  };

  const handleLoadMore = async () => {
    const oldest = messages[0];
    if (!oldest || loadingMore) return;
    setLoadingMore(true);
    try {
      let data;
      if (activeView === 'space' && activeSpace) data = await getSpaceMessages(activeSpace.id, oldest.created_at || oldest.time);
      else if (activeView === 'dm' && activeDM) data = await getDMMessages(activeDM.id, oldest.created_at);
      if (data?.messages) { setMessages(prev => [...data.messages.map(formatMsg), ...prev]); setHasMore(data.hasMore || false); }
    } catch { showToast('Failed to load more messages', 'error'); }
    finally { setLoadingMore(false); }
  };


  const handleToggleStar = async (msg) => {
    try {
      if (msg.isStarred) {
        await unstarMessage(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: false } : m));
        setStarredMessages(prev => prev.filter(m => m.id !== msg.id));
        showToast('Message unstarred', 'success');
      } else {
        await starMessage(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: true } : m));
        setStarredMessages(prev => [...prev, { ...msg, isStarred: true }]);
        showToast('Message starred', 'success');
      }
    } catch { showToast('Failed to update star status', 'error'); }
  };

  const handleForwardMessage = async (target, message) => {
    try {
      let result;
      if (target.type === 'space') {
        result = await sendSpaceMessage(target.id, message.text, null, message.attachments, true);
      } else {
        result = await sendDMMessage(target.id, message.text, null, message.attachments, true);
      }
      if (result) updateConversationPreviews(result);
      showToast('Message forwarded!', 'success');
    } catch { showToast('Failed to forward message', 'error'); }
  };

  // Optimizing receipt marking: only process the last message if it's from someone else
  useEffect(() => {
    if (!connected || !messages.length || !user?.id) return;
    
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== user.id) {
      const myReceipt = lastMsg.receipts?.find(r => r.userId === user.id);
      if (!myReceipt || !myReceipt.deliveredAt) {
        emitMarkDelivered({ messageId: lastMsg.id, spaceId: activeSpace?.id, conversationId: activeDMConversationId });
      }
      if (!myReceipt || !myReceipt.seenAt) {
        emitMarkSeen({ messageId: lastMsg.id, spaceId: activeSpace?.id, conversationId: activeDMConversationId });
      }
    }
  }, [messages.length, activeSpace?.id, activeDMConversationId, connected, user?.id]);

  const handleTypingChange = (isTyping) => {
    if (activeView === 'space' && activeSpace) emitTyping('space', activeSpace.id, user?.name, isTyping);
    else if (activeView === 'dm' && activeDMConversationId) emitTyping('dm', activeDMConversationId, user?.name, isTyping);
  };

  return (
    <div 
      className="flex flex-col h-full overflow-hidden bg-[var(--ws-bg)] text-[var(--ws-text)]"
      data-mobile={isMobile}
    >
      <TopNavbar
        currentStatus={currentStatus} onStatusChange={handleStatusChange}
        onOpenChatSettings={() => setShowChatSettings(true)} onOpenProfileSettings={() => setShowProfileSettings(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        navSearchQuery={navSearchQuery} onNavSearchChange={setNavSearchQuery}
        onSignOut={onSignOut} currentUser={currentUser}
        onOpenAdmin={onOpenAdmin} isAdmin={user?.role === 'admin'}
        onOpenCalendar={() => setActiveView('calendar')}
        onOpenChat={() => { setActiveSpace(null); setActiveDM(null); setActiveView('home'); }}
        activeView={activeView}
        isMobile={isMobile}
      />
      {navSearchQuery && (
        <GlobalSearch
          query={navSearchQuery}
          onClose={() => setNavSearchQuery('')}
          onSelectResult={handleSelectSearchResult}
          spaceId={activeView === 'space' ? activeSpace?.id : null}
          conversationId={activeView === 'dm' ? activeDMConversationId : null}
        />
      )}
      <div className="flex flex-1 overflow-hidden relative">
        {activeView !== 'calendar' && (
          <>
            {isMobile && isSidebarOpen && (
              <div 
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, transition: 'opacity 0.25s' }}
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <LeftSidebar
              isOpen={isSidebarOpen}
              onSelectSpace={handleSelectSpace}
              onSelectDM={handleSelectDM}
              activeSpace={activeSpace}
              activeDM={activeDM}
              activeView={activeView}
              onHomeClick={handleBackToHome}
              onMentionsClick={handleMentionsClick}
              onStarredClick={() => {
                setActiveView('starred');
                if (isMobile) setIsSidebarOpen(false);
              }}
              onCreateSpace={handleCreateSpace}
              allSpaces={formattedSpaces}
              currentUser={currentUser}
              dmUsers={dmUsers}
              unreadMentions={unreadMentions}
              unreadCounts={unreadCounts}
              isMobile={isMobile}
              onOpenCalendar={() => {
                setActiveView('calendar');
                if (isMobile) setIsSidebarOpen(false);
              }}
            />
          </>
        )}
        {activeView === 'calendar' ? <CalendarView isSidebarOpen={isSidebarOpen} isMobile={isMobile} /> : (
          <>
            {(!isMobile || (activeView === 'home' && !activeSpace && !activeDM)) && !isMaximized && (
              <ConversationList
                activeView={activeView}
                onSelectConversation={(item) => {
                  if (item.type === 'space') { const s = formattedSpaces.find(s => s.id === item.id); if (s) handleSelectSpace(s); }
                  else { const d = dmUsers.find(d => d.id === item.id); if (d) handleSelectDM(d); }
                }}
                selectedId={activeSpace?.id || activeDM?.id}
                navSearchQuery={navSearchQuery} mentionedMessages={mentionedMessages}
                allSpaces={formattedSpaces} 
                dmConversations={dmConversations.map(dm => ({
                  ...dm,
                  partnerId: dm.other_user_id || dm.partner_id || dm.id
                }))}
                currentUserId={user?.id} unreadCounts={unreadCounts}
                isMobile={isMobile}
              />
            )}
            {(!isMobile || (activeView !== 'home' || activeSpace || activeDM)) && (
              activeView === 'mentions' ? (
                <MentionsActivityFeed
                  mentions={mentionedMessages}
                  onSelectMention={(m) => {
                    if (m.sourceType === 'space') { const s = spaces.find(sp => sp.id === m.sourceId); if (s) handleSelectSpace(s); }
                    else { const d = allUsers.find(u => u.id === m.sourceId); if (d) handleSelectDM(d); }
                    setHighlightMessageId(m.id);
                    setTimeout(() => setHighlightMessageId(null), 3000);
                  }}
                  onDirectMessage={(senderId) => {
                    const partner = allUsers.find(u => u.id === senderId);
                    if (partner) handleSelectDM(partner);
                  }}
                  onClose={handleBackToHome}
                />
              ) : activeView === 'starred' ? (
                <StarredMessagesFeed
                  starredMessages={starredMessages}
                  onSelectMessage={(m) => {
                    if (m.sourceType === 'space') { const s = spaces.find(sp => sp.id === m.sourceId); if (s) handleSelectSpace(s); }
                    else { const d = allUsers.find(u => u.id === m.sourceId); if (d) handleSelectDM(d); }
                    setHighlightMessageId(m.id);
                    setTimeout(() => setHighlightMessageId(null), 3000);
                  }}
                  onDirectMessage={(senderId) => {
                    const partner = allUsers.find(u => u.id === senderId);
                    if (partner) handleSelectDM(partner);
                  }}
                  onUnstar={(id) => handleToggleStar({ id, isStarred: true })}
                  onClose={handleBackToHome}
                />
              ) : (
                <ChatArea
                  title={activeView === 'space' && activeSpace ? activeSpace.name : activeDM?.name || ''}
                  isSpace={activeView === 'space'}
                  messages={messagesLoading ? [] : messages.map(formatMsg)}
                  onSend={handleSendMessage}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReact={handleAddReaction}
                  onRemoveReact={handleRemoveReaction}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                  onDeleteMessage={handleDeleteMessage}
                  onHideMessage={handleHideMessage}
                  onToggleStar={handleToggleStar}
                  messagesLoading={messagesLoading}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  currentUserId={user?.id}
                  allSpaces={formattedSpaces}
                  dmUsers={dmUsers}
                  onForwardMessage={handleForwardMessage}
                  spaceMembers={spaceMembers}
                  activeView={activeView}
                  description={activeSpace?.description}
                  isMaximized={isMaximized}
                  onToggleMaximize={() => setIsMaximized(!isMaximized)}
                  onClose={handleBackToHome}
                  highlightMessageId={highlightMessageId}
                  spaceId={activeSpace?.id}
                  dmConversationId={activeDMConversationId}
                  typingUsers={typingUsers}
                  onTypingChange={handleTypingChange}
                  allUsers={allUsers}
                  isMobile={isMobile}
                />
              )
            )}
          </>
        )}
        {!isMobile && activeView !== 'calendar' && <RightIconRail onNavigateToCalendar={() => setActiveView('calendar')} />}
      </div>
      {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
      {showChatSettings && <ChatSettingsModal onClose={() => setShowChatSettings(false)} />}
    </div>
  );
}

function WorkspaceRoot({ user, onSignOut }) {
  const [inAdmin, setInAdmin] = useState(false);
  if (inAdmin && user?.role === 'admin') return <AdminApp onBack={() => setInAdmin(false)} />;
  return <ChatApp onSignOut={onSignOut} onOpenAdmin={() => setInAdmin(true)} />;
}

function AppRouter() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('landing');
  const navigate = (to) => { setPage(to); window.scrollTo({ top: 0 }); };
  const handleSignOut = async () => { await logout(); navigate('landing'); };

  if (loading) return (
    <div style={{ height: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, padding: 6 }}>
        <img src="/shnoor-logo.png" alt="SHNOOR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    </div>
  );

  if (user) return <WorkspaceRoot user={user} onSignOut={handleSignOut} />;
  if (page === 'login') return <LoginPage onNavigate={navigate} />;
  if (page === 'privacy') return <PrivacyPolicyPage onNavigate={navigate} />;
  if (page === 'terms') return <TermsPage onNavigate={navigate} />;
  if (page === 'cookie') return <CookiePolicyPage onNavigate={navigate} />;
  if (page === 'security') return <SecurityPage onNavigate={navigate} />;
  return <LandingPage onNavigate={navigate} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}