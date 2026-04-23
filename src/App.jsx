// import { useState, useEffect, useRef } from 'react';
// import { ThemeProvider } from './context/ThemeContext';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { SocketProvider, useSocket } from './context/SocketContext.jsx';
// import { ToastProvider, useToast } from './context/ToastContext.jsx';
// import AdminApp from './Admin/AdminApp.jsx';
// import ProfileSettingsModal from './components/ui/ProfileSettingsModal.jsx';
// import ChatSettingsModal from './components/ui/ChatSettingsModal.jsx';
// import { getSpaces, getSpaceMessages, sendSpaceMessage, editSpaceMessage, deleteSpaceMessage, getSpaceMembers } from './api/spaces.js';

// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
// import TermsPage from './pages/TermsPage';
// import CookiePolicyPage from './pages/CookiepolicyPage';
// import SecurityPage from './pages/SecurityPage';

// import TopNavbar from './components/layout/TopNavbar.jsx';
// import LeftSidebar from './components/layout/LeftSidebar.jsx';
// import ConversationList from './components/layout/ConversationList.jsx';
// import ChatArea from './components/layout/ChatArea.jsx';
// import RightIconRail from './components/layout/RightIconRail.jsx';
// import CalendarView from './components/calendar/CalendarView.jsx';
// import { getAllUsers, getDMMessages, sendDMMessage } from './api/users.js';
// import { addReaction, removeReaction, getDMConversations } from './api/messages.js';

// function ChatApp({ onSignOut, onOpenAdmin }) {
//   const { user, refreshUser } = useAuth();
//   const { showToast } = useToast();
//   const {
//     connected,
//     joinSpace, leaveSpace, joinDM,
//     onNewMessage, onMessageEdited, onMessageDeleted, onReactionUpdated,
//     onDMJoined, onTypingUpdate, emitTyping, onlineUsers,
//     onDMPreviewUpdated, onUserRoleChanged,
//   } = useSocket();

//   const currentUser = {
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
//     color: '#0D9488',
//     avatar_url: user.avatar_url,
//   };

//   const [spaces, setSpaces] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [dmConversations, setDmConversations] = useState([]);
//   const [activeSpace, setActiveSpace] = useState(null);
//   const [activeDM, setActiveDM] = useState(null);
//   const [activeView, setActiveView] = useState('home');
//   const [messages, setMessages] = useState([]);
//   const [messagesLoading, setMessagesLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(false);
//   const [spaceMembers, setSpaceMembers] = useState([]);
//   const [showProfileSettings, setShowProfileSettings] = useState(false);
//   const [showChatSettings, setShowChatSettings] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [currentStatus, setCurrentStatus] = useState('active');
//   const [isMaximized, setIsMaximized] = useState(false);
//   const [navSearchQuery, setNavSearchQuery] = useState('');
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [activeDMConversationId, setActiveDMConversationId] = useState(null);

//   // Listen for the calendar back button event from CalendarView
//   useEffect(() => {
//     const handleCalendarBack = () => {
//       setActiveView('home');
//       setActiveSpace(null);
//       setActiveDM(null);
//     };
//     window.addEventListener('calendar:back', handleCalendarBack);
//     return () => window.removeEventListener('calendar:back', handleCalendarBack);
//   }, []);

//   useEffect(() => {
//     getSpaces().then(setSpaces).catch(() => showToast('Failed to load spaces', 'error'));
//     getAllUsers().then(setAllUsers).catch(() => { });
//     getDMConversations().then(setDmConversations).catch(() => { });
//   }, []);

//   useEffect(() => {
//     if (!connected) return;
//     return onDMPreviewUpdated(() => {
//       getDMConversations().then(setDmConversations).catch(() => { });
//     });
//   }, [connected]);

//   useEffect(() => {
//     if (!connected) return;
//     return onUserRoleChanged(() => refreshUser());
//   }, [connected]);

//   useEffect(() => {
//     if (activeView === 'space' && activeSpace) {
//       setMessagesLoading(true);
//       getSpaceMessages(activeSpace.id)
//         .then(data => { setMessages(data.messages || []); setHasMore(data.hasMore || false); })
//         .catch(() => showToast('Failed to load messages', 'error'))
//         .finally(() => setMessagesLoading(false));
//     } else if (activeView === 'dm' && activeDM) {
//       setMessagesLoading(true);
//       getDMMessages(activeDM.id)
//         .then(data => {
//           setMessages(data.messages || []);
//           setHasMore(data.hasMore || false);
//           if (data.conversationId) setActiveDMConversationId(data.conversationId);
//         })
//         .catch(() => showToast('Failed to load messages', 'error'))
//         .finally(() => setMessagesLoading(false));
//     } else {
//       setMessages([]); setHasMore(false);
//     }
//   }, [activeSpace, activeDM, activeView]);

//   useEffect(() => {
//     if (activeView !== 'space' || !activeSpace) return;
//     joinSpace(activeSpace.id);
//     setTypingUsers([]);
//     const cleanups = [
//       onNewMessage((msg) => {
//         if (msg.space_id !== activeSpace.id) return;
//         setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
//       }),
//       onMessageEdited((msg) => {
//         if (msg.space_id !== activeSpace.id) return;
//         setMessages(prev => prev.map(m => m.id === msg.id ? { ...formatMsg(msg), reactions: m.reactions } : m));
//       }),
//       onMessageDeleted(({ messageId, spaceId }) => {
//         if (spaceId !== activeSpace.id) return;
//         setMessages(prev => prev.filter(m => m.id !== messageId));
//       }),
//       onReactionUpdated(({ messageId, reactions }) => {
//         setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
//       }),
//       onTypingUpdate(({ userId: uid, userName, isTyping }) => {
//         if (uid === user.id) return;
//         setTypingUsers(prev => isTyping
//           ? (prev.includes(userName) ? prev : [...prev, userName])
//           : prev.filter(n => n !== userName));
//       }),
//     ];
//     return () => { leaveSpace(activeSpace.id); cleanups.forEach(fn => fn?.()); };
//   }, [activeSpace, activeView]);

//   useEffect(() => {
//     if (activeView !== 'dm' || !activeDM) return;
//     joinDM(activeDM.id);
//     setTypingUsers([]);
//     const cleanups = [
//       onDMJoined(({ conversationId }) => setActiveDMConversationId(conversationId)),
//       onNewMessage((msg) => {
//         if (!msg.conversation_id) return;
//         setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
//       }),
//       onReactionUpdated(({ messageId, reactions }) => {
//         setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
//       }),
//       onTypingUpdate(({ userId: uid, userName, isTyping }) => {
//         if (uid === user.id) return;
//         setTypingUsers(prev => isTyping
//           ? (prev.includes(userName) ? prev : [...prev, userName])
//           : prev.filter(n => n !== userName));
//       }),
//     ];
//     return () => cleanups.forEach(fn => fn?.());
//   }, [activeDM, activeView]);

//   const formatMsg = (m) => ({
//     id: m.id, senderId: m.sender_id, senderName: m.sender_name,
//     initials: (m.sender_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
//     color: '#0D9488', avatar_url: m.avatar_url,
//     time: new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
//     text: m.content, is_edited: m.is_edited, reactions: m.reactions || [],
//   });

//   const formattedMessages = messages
//     .filter(m => m && (m.content || m.text) && (m.sender_name || m.senderName))
//     .map(m => m.senderId ? m : formatMsg(m));

//   const formattedSpaces = spaces.map(s => ({
//     id: s.id, name: s.name, unread: 0,
//     memberCount: s.member_count, members: [],
//     last_message: s.last_message, last_message_at: s.last_message_at,
//     last_message_sender: s.last_message_sender,
//   }));

//   const dmUsers = allUsers.filter(u => u.id !== user.id).map(u => ({
//     id: u.id, name: u.name, email: u.email, avatar_url: u.avatar_url,
//     initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
//     color: '#0D9488', online: onlineUsers.has(u.id),
//   }));

//   const handleSelectSpace = async (space) => {
//     setActiveSpace(space); setActiveDM(null); setActiveView('space');
//     setSpaceMembers([]);
//     // Fetch real members for this space so the Members panel works
//     try {
//       const members = await getSpaceMembers(space.id);
//       setSpaceMembers(members);
//     } catch { setSpaceMembers([]); }
//   };
//   const handleSelectDM = (dmUser) => { setActiveDM(dmUser); setActiveSpace(null); setActiveView('dm'); setActiveDMConversationId(null); };
//   const handleBackToHome = () => {
//     setActiveSpace(null); setActiveDM(null);
//     setActiveView('home'); setIsMaximized(false);
//     setMessages([]); setTypingUsers([]); setSpaceMembers([]);
//   };

//   const handleSendMessage = async (text) => {
//     if (!text.trim()) return;
//     try {
//       if (activeView === 'space' && activeSpace) await sendSpaceMessage(activeSpace.id, text);
//       else if (activeView === 'dm' && activeDM) await sendDMMessage(activeDM.id, text);
//     } catch { showToast('Failed to send message', 'error'); }
//   };


//   const handleEditMessage = async (msgId, content) => {
//     if (!activeSpace) return;
//     try {
//       await editSpaceMessage(activeSpace.id, msgId, content);
//       setMessages(prev => prev.map(m =>
//         m.id === msgId ? { ...m, text: content, is_edited: true } : m
//       ));
//     } catch (err) {
//       showToast('Failed to edit message', 'error');
//       throw err; 
//     }
//   };

//   const handleDeleteMessage = async (msgId) => {
//     if (!activeSpace) return;
//     try {
//       await deleteSpaceMessage(activeSpace.id, msgId);
//       // Remove locally immediately — don't rely on socket
//       setMessages(prev => prev.filter(m => m.id !== msgId));
//     } catch { showToast('Failed to delete message', 'error'); }
//   };

//   const handleAddReaction = async (msgId, emoji) => {
//     try {
//       const result = await addReaction(msgId, emoji);
//       setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m));
//     } catch { showToast('Failed to add reaction', 'error'); }
//   };

//   const handleRemoveReaction = async (msgId, emoji) => {
//     try {
//       const result = await removeReaction(msgId, emoji);
//       setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m));
//     } catch { showToast('Failed to remove reaction', 'error'); }
//   };

//   const handleLoadMore = async () => {
//     const oldest = messages[0];
//     if (!oldest) return;
//     try {
//       let data;
//       if (activeView === 'space' && activeSpace) data = await getSpaceMessages(activeSpace.id, oldest.created_at || oldest.time);
//       else if (activeView === 'dm' && activeDM) data = await getDMMessages(activeDM.id, oldest.created_at);
//       if (data?.messages) { setMessages(prev => [...data.messages.map(formatMsg), ...prev]); setHasMore(data.hasMore || false); }
//     } catch { showToast('Failed to load more messages', 'error'); }
//   };

//   const handleTypingChange = (isTyping) => {
//     if (activeView === 'space' && activeSpace) emitTyping('space', activeSpace.id, user.name, isTyping);
//     else if (activeView === 'dm' && activeDMConversationId) emitTyping('dm', activeDMConversationId, user.name, isTyping);
//   };

//   const chatTitle = activeView === 'space' && activeSpace ? activeSpace.name : activeDM?.name || '';
//   const memberCount = activeView === 'space' && activeSpace ? activeSpace.memberCount : null;

//   return (
//     <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
//       <TopNavbar
//         currentStatus={currentStatus}
//         onStatusChange={setCurrentStatus}
//         onOpenChatSettings={() => setShowChatSettings(true)}
//         onOpenProfileSettings={() => setShowProfileSettings(true)}
//         onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//         navSearchQuery={navSearchQuery}
//         onNavSearchChange={setNavSearchQuery}
//         onSignOut={onSignOut}
//         currentUser={currentUser}
//         onOpenAdmin={onOpenAdmin}
//         isAdmin={user.role === 'admin'}
//         onOpenCalendar={() => setActiveView('calendar')}
//         onOpenChat={() => { setActiveSpace(null); setActiveDM(null); setActiveView('home'); }}
//         activeView={activeView}
//       />
//       <div className="flex flex-1 overflow-hidden">
//         {activeView !== 'calendar' && (
//           <LeftSidebar
//             isOpen={isSidebarOpen}
//             onSelectSpace={handleSelectSpace}
//             onSelectDM={handleSelectDM}
//             activeSpace={activeSpace}
//             activeDM={activeDM}
//             activeView={activeView}
//             onHomeClick={handleBackToHome}
//             onMentionsClick={() => { setActiveSpace(null); setActiveDM(null); setActiveView('mentions'); setIsMaximized(false); }}
//             onCreateSpace={() => { }}
//             allSpaces={formattedSpaces}
//             currentUser={currentUser}
//             dmUsers={dmUsers}
//           />
//         )}
//         {activeView === 'calendar' ? (
//           <CalendarView isSidebarOpen={isSidebarOpen} navSearchQuery={navSearchQuery} />
//         ) : (
//           <>
//             {!isMaximized && (
//               <ConversationList
//                 activeView={activeView}
//                 onSelectConversation={(item) => {
//                   if (item.type === 'space') { const s = formattedSpaces.find(s => s.id === item.id); if (s) handleSelectSpace(s); }
//                   else { const d = dmUsers.find(d => d.id === item.id); if (d) handleSelectDM(d); }
//                 }}
//                 selectedId={activeSpace?.id || activeDM?.id}
//                 navSearchQuery={navSearchQuery}
//                 mentionedMessages={[]}
//                 allSpaces={formattedSpaces}
//                 dmConversations={dmConversations}
//                 currentUserId={user.id}
//               />
//             )}
//             <ChatArea
//               title={chatTitle}
//               memberCount={memberCount}
//               messages={messagesLoading ? [] : formattedMessages}
//               onSend={handleSendMessage}
//               isSpace={activeView === 'space'}
//               activeView={activeView}
//               onClose={handleBackToHome}
//               isMaximized={isMaximized}
//               onToggleMaximize={() => setIsMaximized(prev => !prev)}
//               spaceMembers={spaceMembers}
//               currentUserId={user.id}
//               onEditMessage={handleEditMessage}
//               onDeleteMessage={handleDeleteMessage}
//               onAddReaction={handleAddReaction}
//               onRemoveReaction={handleRemoveReaction}
//               typingUsers={typingUsers}
//               messagesLoading={messagesLoading}
//               hasMore={hasMore}
//               onLoadMore={handleLoadMore}
//               onTypingChange={handleTypingChange}
//               spaceId={activeSpace?.id}
//             />
//           </>
//         )}
//         {activeView !== 'calendar' && (
//           <RightIconRail onNavigateToCalendar={() => setActiveView('calendar')} />
//         )}
//       </div>
//       {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
//       {showChatSettings && <ChatSettingsModal onClose={() => setShowChatSettings(false)} />}
//     </div>
//   );
// }

// function WorkspaceRoot({ user, onSignOut }) {
//   const [inAdmin, setInAdmin] = useState(false);
//   if (inAdmin && user.role === 'admin') return <AdminApp onBack={() => setInAdmin(false)} />;
//   return <ChatApp onSignOut={onSignOut} onOpenAdmin={() => setInAdmin(true)} />;
// }

// function AppRouter() {
//   const { user, loading, logout } = useAuth();
//   const [page, setPage] = useState('landing');
//   const navigate = (to) => { setPage(to); window.scrollTo({ top: 0 }); };
//   const handleSignOut = async () => { await logout(); navigate('landing'); };

//   if (loading) {
//     return (
//       <div style={{ height: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, padding: 6 }}>
//           <img src="/shnoor-logo.png" alt="SHNOOR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
//         </div>
//       </div>
//     );
//   }

//   if (user) return <WorkspaceRoot user={user} onSignOut={handleSignOut} />;
//   if (page === 'login') return <LoginPage onNavigate={navigate} />;
//   if (page === 'privacy') return <PrivacyPolicyPage onNavigate={navigate} />;
//   if (page === 'terms') return <TermsPage onNavigate={navigate} />;
//   if (page === 'cookie') return <CookiePolicyPage onNavigate={navigate} />;
//   if (page === 'security') return <SecurityPage onNavigate={navigate} />;
//   return <LandingPage onNavigate={navigate} />;
// }

// export default function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <SocketProvider>
//           <ToastProvider>
//             <AppRouter />
//           </ToastProvider>
//         </SocketProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }

import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import AdminApp from './Admin/AdminApp.jsx';
import ProfileSettingsModal from './components/ui/ProfileSettingsModal.jsx';
import ChatSettingsModal from './components/ui/ChatSettingsModal.jsx';
import { getSpaces, getSpaceMessages, sendSpaceMessage, editSpaceMessage, deleteSpaceMessage, getSpaceMembers } from './api/spaces.js';

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
import CalendarView from './components/calendar/CalendarView.jsx';
import { getAllUsers, getDMMessages, sendDMMessage } from './api/users.js';
import { addReaction, removeReaction, getDMConversations, searchMessages } from './api/messages.js';
import MentionsActivityFeed from './components/layout/MentionsActivityFeed.jsx';
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
    onDMPreviewUpdated, onUserRoleChanged,
    onReceiptUpdated, emitMarkDelivered, emitMarkSeen,
  } = useSocket();

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488',
    avatar_url: user.avatar_url,
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
  const [spaceMembers, setSpaceMembers] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('active');
  const [isMaximized, setIsMaximized] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeDMConversationId, setActiveDMConversationId] = useState(null);

  // ─── FIX 5 & 6: Unread counts and mention tracking ──────────────────────
  // unreadCounts: { "space_<id>": N, "dm_<userId>": N }
  const [unreadCounts, setUnreadCounts] = useState({});
  // mentionedMessages: array of mention objects for the Mentions panel
  const [mentionedMessages, setMentionedMessages] = useState([]);
  // unreadMentions: badge count on the Mentions shortcut
  const [unreadMentions, setUnreadMentions] = useState(0);

  // Track current active view key to decide whether a new message increments unread
  const activeViewRef   = useRef(activeView);
  const activeSpaceRef  = useRef(activeSpace);
  const activeDMRef     = useRef(activeDM);
  useEffect(() => { activeViewRef.current  = activeView;  }, [activeView]);
  useEffect(() => { activeSpaceRef.current = activeSpace; }, [activeSpace]);
  useEffect(() => { activeDMRef.current    = activeDM;    }, [activeDM]);

  const formatMsg = (m) => {
    if (!m) return m;
    // If already formatted, return m (ensure it has common fields)
    if (m.senderId && m.time) return m;

    return {
      id: m.id, senderId: m.sender_id, senderName: m.sender_name,
      initials: (m.sender_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: '#0D9488', avatar_url: m.avatar_url,
      time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
      text: m.content || m.text, is_edited: m.is_edited, reactions: m.reactions || [],
      receipts: m.receipts || [], created_at: m.created_at,
      is_forwarded: m.is_forwarded,
      parentMessageId: m.parent_message_id,
      parentContent: m.parent_content,
      parentSenderName: m.parent_sender_name,
    };
  };

  function partiallyFormatted(m) { return m.text && m.senderName; }
  function rawMessage(m) { return m.content && m.sender_name; }

  const formattedMessages = messages
    .filter(m => m && (partiallyFormatted(m) || rawMessage(m)))
    .map(formatMsg);

  // Helper: does a message text contain a @mention for the current user?
  const isMentioned = (text) =>
    text && (
      text.toLowerCase().includes(`@${user.name.toLowerCase()}`) ||
      text.includes(`@${user.name}`)
    );

  // Request notification permissions on mount
  useEffect(() => {
    console.log('Notification permission status:', Notification.permission);
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      requestNotificationPermission().then(granted => {
        console.log('Notification permission granted:', granted);
        if (granted) showToast('Notifications enabled!', 'success');
      });
    }
  }, []);

  // Listen for calendar back button event
  useEffect(() => {
    const handleCalendarBack = () => {
      setActiveView('home');
      setActiveSpace(null);
      setActiveDM(null);
    };
    window.addEventListener('calendar:back', handleCalendarBack);
    return () => window.removeEventListener('calendar:back', handleCalendarBack);
  }, []);

  // Fetch historical mentions on startup
  useEffect(() => {
    if (!user?.name) return;
    searchMessages(`@${user.name}`)
      .then(msgs => {
        const unique = msgs.filter((m, i, self) => self.findIndex(t => t.id === m.id) === i);
        setMentionedMessages(unique.map(formatMsg).map(m => {
          // Find source space/dm for the historical mention
          const s = spaces.find(sp => sp.id === m.space_id);
          return {
            ...m,
            source: s ? s.name : 'Direct Message',
            sourceId: m.space_id || m.senderId,
            sourceType: m.space_id ? 'space' : 'dm'
          };
        }));
      })
      .catch(() => {});
  }, [user?.name, spaces.length]);

  useEffect(() => {
    getSpaces().then(setSpaces).catch(() => showToast('Failed to load spaces', 'error'));
    getAllUsers().then(setAllUsers).catch(() => {});
    getDMConversations().then(setDmConversations).catch(() => {});
  }, []);

  useEffect(() => {
    if (!connected) return;
    return onDMPreviewUpdated(() => {
      getDMConversations().then(setDmConversations).catch(() => {});
    });
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    return onUserRoleChanged(() => refreshUser());
  }, [connected]);

  useEffect(() => {
    if (activeView === 'space' && activeSpace) {
      setMessagesLoading(true);
      getSpaceMessages(activeSpace.id)
        .then(data => { setMessages(data.messages || []); setHasMore(data.hasMore || false); })
        .catch(() => showToast('Failed to load messages', 'error'))
        .finally(() => setMessagesLoading(false));
      // Mark space as read when opened — reset unread count
      setUnreadCounts(prev => ({ ...prev, [`space_${activeSpace.id}`]: 0 }));
    } else if (activeView === 'dm' && activeDM) {
      setMessagesLoading(true);
      getDMMessages(activeDM.id)
        .then(data => {
          setMessages(data.messages || []);
          setHasMore(data.hasMore || false);
          if (data.conversationId) setActiveDMConversationId(data.conversationId);
        })
        .catch(() => showToast('Failed to load messages', 'error'))
        .finally(() => setMessagesLoading(false));
      // Mark DM as read when opened — reset unread count
      setUnreadCounts(prev => ({ ...prev, [`dm_${activeDM.id}`]: 0 }));
    } else {
      setMessages([]); setHasMore(false);
    }
  }, [activeSpace, activeDM, activeView]);

  useEffect(() => {
    if (activeView !== 'space' || !activeSpace) return;
    joinSpace(activeSpace.id);
    setTypingUsers([]);
    const cleanups = [
      onNewMessage((msg) => {
        if (msg.space_id !== activeSpace.id) return;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
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
        if (uid === user.id) return;
        setTypingUsers(prev => isTyping
          ? (prev.includes(userName) ? prev : [...prev, userName])
          : prev.filter(n => n !== userName));
      }),
      onReceiptUpdated(({ messageId, receipts }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, receipts } : m));
      }),
    ];
    return () => { leaveSpace(activeSpace.id); cleanups.forEach(fn => fn?.()); };
  }, [activeSpace, activeView]);

  useEffect(() => {
    if (activeView !== 'dm' || !activeDM) return;
    joinDM(activeDM.id);
    setTypingUsers([]);
    const cleanups = [
      onDMJoined(({ conversationId }) => setActiveDMConversationId(conversationId)),
      onNewMessage((msg) => {
        if (!msg.conversation_id) return;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
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
        if (uid === user.id) return;
        setTypingUsers(prev => isTyping
          ? (prev.includes(userName) ? prev : [...prev, userName])
          : prev.filter(n => n !== userName));
      }),
      onReceiptUpdated(({ messageId, receipts }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, receipts } : m));
      }),
    ];
    return () => cleanups.forEach(fn => fn?.());
  }, [activeDM, activeView]);

  // ─── FIX 5 & 6: Global new-message listener for unread counts + mentions ─
  // This listener stays active regardless of which conversation is open.
  useEffect(() => {
    if (!connected) return;

    const cleanup = onNewMessage((msg) => {
      const senderIsMe = msg.sender_id === user.id;
      if (senderIsMe) return; // Don't count our own messages

      // ── Unread count for spaces ──
      if (msg.space_id) {
        const isCurrentSpace =
          activeViewRef.current === 'space' &&
          activeSpaceRef.current?.id === msg.space_id;
        if (!isCurrentSpace) {
          setUnreadCounts(prev => ({
            ...prev,
            [`space_${msg.space_id}`]: (prev[`space_${msg.space_id}`] || 0) + 1,
          }));
        }
      }

      // ── Unread count for DMs ──
      if (msg.conversation_id && msg.sender_id) {
        const isCurrentDM =
          activeViewRef.current === 'dm' &&
          activeDMRef.current?.id === msg.sender_id;
        if (!isCurrentDM) {
          setUnreadCounts(prev => ({
            ...prev,
            [`dm_${msg.sender_id}`]: (prev[`dm_${msg.sender_id}`] || 0) + 1,
          }));
        }
      }

      // ── FIX 5: Mention detection ──
      const content = msg.content || msg.text || '';
      if (isMentioned(content)) {
        const formatted = formatMsg(msg);
        const mentionEntry = {
          ...formatted,
          source: msg.space_id
            ? (spaces.find(s => s.id === msg.space_id)?.name || 'space')
            : 'Direct Message',
          sourceId: msg.space_id || msg.sender_id,
          sourceType: msg.space_id ? 'space' : 'dm',
        };
        setMentionedMessages(prev => [mentionEntry, ...prev]);
        // Only increment badge if Mentions panel is not currently open
        if (activeViewRef.current !== 'mentions') {
          setUnreadMentions(prev => prev + 1);
        }
      }

      // ── Desktop Notifications ──
      const isCurrentSpace = activeViewRef.current === 'space' && activeSpaceRef.current?.id === msg.space_id;
      const isCurrentDM = activeViewRef.current === 'dm' && activeDMRef.current?.id === msg.sender_id;
      const isTabFocused = document.visibilityState === 'visible' && document.hasFocus();

      if ((!isCurrentSpace && !isCurrentDM) || !isTabFocused) {
        console.log('Triggering notification for:', msg.sender_name);
        showNotification(msg.sender_name, {
          body: msg.content || msg.text || 'New message received',
          icon: msg.avatar_url || '/shnoor-logo.png',
          tag: msg.space_id ? `space_${msg.space_id}` : `dm_${msg.sender_id}`,
          renotify: true,
          onClick: () => {
            console.log('Notification clicked, redirecting...');
            if (msg.space_id) {
              const space = spaces.find(s => s.id === msg.space_id);
              if (space) handleSelectSpace(space);
            } else if (msg.sender_id) {
              const dmUser = allUsers.find(u => u.id === msg.sender_id);
              if (dmUser) handleSelectDM(dmUser);
            }
          }
        });
      } else {
        console.log('Notification skipped: tab focused or in same conversation');
      }
    });

    return cleanup;
  }, [connected, user.id, spaces, allUsers]);

  const formattedSpaces = spaces.map(s => ({
    id: s.id, name: s.name,
    unread: unreadCounts[`space_${s.id}`] || 0,   // FIX 6
    memberCount: s.member_count, members: [],
    last_message: s.last_message, last_message_at: s.last_message_at,
    last_message_sender: s.last_message_sender,
  }));

  const dmUsers = allUsers.filter(u => u.id !== user.id).map(u => ({
    id: u.id, name: u.name, email: u.email, avatar_url: u.avatar_url,
    initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', online: onlineUsers.has(u.id),
    unread: unreadCounts[`dm_${u.id}`] || 0,      // FIX 6
  }));

  const handleSelectSpace = async (space) => {
    setActiveSpace(space); setActiveDM(null); setActiveView('space');
    setSpaceMembers([]);
    // Reset unread when opening
    setUnreadCounts(prev => ({ ...prev, [`space_${space.id}`]: 0 }));
    try {
      const members = await getSpaceMembers(space.id);
      setSpaceMembers(members);
    } catch { setSpaceMembers([]); }
  };

  const handleSelectDM = (dmUser) => {
    setActiveDM(dmUser); setActiveSpace(null); setActiveView('dm');
    setActiveDMConversationId(null);
    // Reset unread when opening
    setUnreadCounts(prev => ({ ...prev, [`dm_${dmUser.id}`]: 0 }));
  };

  const handleBackToHome = () => {
    setActiveSpace(null); setActiveDM(null);
    setActiveView('home'); setIsMaximized(false);
    setMessages([]); setTypingUsers([]); setSpaceMembers([]);
  };

  // FIX 5: When user opens Mentions tab, reset the badge count
  const handleMentionsClick = () => {
    setActiveSpace(null); setActiveDM(null);
    setActiveView('mentions'); setIsMaximized(false);
    setUnreadMentions(0); // reset badge
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    try {
      if (activeView === 'space' && activeSpace) await sendSpaceMessage(activeSpace.id, text);
      else if (activeView === 'dm' && activeDM) await sendDMMessage(activeDM.id, text);
    } catch { showToast('Failed to send message', 'error'); }
  };

  // FIX 7: Edit message — works for both spaces AND DMs
  const handleEditMessage = async (msgId, content) => {
    try {
      if (activeView === 'space' && activeSpace) {
        await editSpaceMessage(activeSpace.id, msgId, content);
      } else if (activeView === 'dm' && activeDM) {
        await api.patch(`/api/dm/${activeDM.id}/messages/${msgId}`, { content });
      } else {
        return;
      }
      // Optimistically update local state
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, text: content, is_edited: true } : m
      ));
    } catch (err) {
      showToast('Failed to edit message', 'error');
      throw err;
    }
  };

  // FIX 7: Delete message — works for both spaces AND DMs
  const handleDeleteMessage = async (msgId) => {
    try {
      if (activeView === 'space' && activeSpace) {
        await deleteSpaceMessage(activeSpace.id, msgId);
      } else if (activeView === 'dm' && activeDM) {
        await api.delete(`/api/dm/${activeDM.id}/messages/${msgId}`);
      } else {
        return;
      }
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { showToast('Failed to delete message', 'error'); }
  };

  const handleHideMessage = async (msgId) => {
    try {
      await api.post(`/api/messages/${msgId}/hide`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { showToast('Failed to hide message', 'error'); }
  };

  const handleAddReaction = async (msgId, emoji) => {
    try {
      const result = await addReaction(msgId, emoji);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m));
    } catch { showToast('Failed to add reaction', 'error'); }
  };

  const handleRemoveReaction = async (msgId, emoji) => {
    try {
      const result = await removeReaction(msgId, emoji);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m));
    } catch { showToast('Failed to remove reaction', 'error'); }
  };

  const handleLoadMore = async () => {
    const oldest = messages[0];
    if (!oldest) return;
    try {
      let data;
      if (activeView === 'space' && activeSpace) data = await getSpaceMessages(activeSpace.id, oldest.created_at || oldest.time);
      else if (activeView === 'dm' && activeDM) data = await getDMMessages(activeDM.id, oldest.created_at);
      if (data?.messages) { setMessages(prev => [...data.messages.map(formatMsg), ...prev]); setHasMore(data.hasMore || false); }
    } catch { showToast('Failed to load more messages', 'error'); }
  };

  const handleForwardMessage = async (target, message) => {
    try {
      if (target.type === 'space') {
        await sendSpaceMessage(target.id, message.text, null, message.attachments, true);
      } else {
        await sendDMMessage(target.id, message.text, null, message.attachments, true);
      }
      showToast('Message forwarded!', 'success');
    } catch {
      showToast('Failed to forward message', 'error');
    }
  };

// ─── Mark as Delivered/Seen effects ───────────────────────────────────────
  useEffect(() => {
    if (!connected || !messages.length) return;
    
    messages.forEach(msg => {
      // If I am NOT the sender, mark as delivered if not already
      if (msg.senderId !== user.id) {
        const myReceipt = msg.receipts?.find(r => r.userId === user.id);
        if (!myReceipt || !myReceipt.deliveredAt) {
          emitMarkDelivered({
            messageId: msg.id,
            spaceId: activeSpace?.id,
            conversationId: activeDMConversationId
          });
        }
        
        // If this is the active view, also mark as seen
        if (!myReceipt || !myReceipt.seenAt) {
          emitMarkSeen({
            messageId: msg.id,
            spaceId: activeSpace?.id,
            conversationId: activeDMConversationId
          });
        }
      }
    });
  }, [messages.length, activeSpace?.id, activeDMConversationId, connected]);

  const chatTitle    = activeView === 'space' && activeSpace ? activeSpace.name : activeDM?.name || '';
  const memberCount  = activeView === 'space' && activeSpace ? activeSpace.memberCount : null;

  // FIX 2: Build mention-aware user list for @ autocomplete in ChatArea
  // Use spaceMembers when in a space, all dmUsers otherwise
  const chatAllUsers = [
    { id: user.id, name: user.name, avatar_url: user.avatar_url },
    ...(activeView === 'space'
      ? spaceMembers.map(m => ({ id: m.id, name: m.name, avatar_url: m.avatar_url }))
      : dmUsers.map(u => ({ id: u.id, name: u.name, avatar_url: u.avatar_url })))
  ];

  const handleTypingChange = (isTyping) => {
    if (activeView === 'space' && activeSpace) emitTyping('space', activeSpace.id, user.name, isTyping);
    else if (activeView === 'dm' && activeDMConversationId) emitTyping('dm', activeDMConversationId, user.name, isTyping);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      <TopNavbar
        currentStatus={currentStatus}
        onStatusChange={setCurrentStatus}
        onOpenChatSettings={() => setShowChatSettings(true)}
        onOpenProfileSettings={() => setShowProfileSettings(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        navSearchQuery={navSearchQuery}
        onNavSearchChange={setNavSearchQuery}
        onSignOut={onSignOut}
        currentUser={currentUser}
        onOpenAdmin={onOpenAdmin}
        isAdmin={user.role === 'admin'}
        onOpenCalendar={() => setActiveView('calendar')}
        onOpenChat={() => { setActiveSpace(null); setActiveDM(null); setActiveView('home'); }}
        activeView={activeView}
      />
      <div className="flex flex-1 overflow-hidden">
        {activeView !== 'calendar' && (
          <LeftSidebar
            isOpen={isSidebarOpen}
            onSelectSpace={handleSelectSpace}
            onSelectDM={handleSelectDM}
            activeSpace={activeSpace}
            activeDM={activeDM}
            activeView={activeView}
            onHomeClick={handleBackToHome}
            onMentionsClick={handleMentionsClick}     // FIX 5
            onCreateSpace={() => {}}
            allSpaces={formattedSpaces}
            currentUser={currentUser}
            dmUsers={dmUsers}
            unreadMentions={unreadMentions}           // FIX 5
            unreadCounts={unreadCounts}               // FIX 6
          />
        )}
        {activeView === 'calendar' ? (
          // FIX 9: CalendarView no longer receives navSearchQuery — it has its own search
          <CalendarView isSidebarOpen={isSidebarOpen} />
        ) : (
          <>
            {!isMaximized && (
              <ConversationList
                activeView={activeView}
                onSelectConversation={(item) => {
                  if (item.type === 'space') { const s = formattedSpaces.find(s => s.id === item.id); if (s) handleSelectSpace(s); }
                  else { const d = dmUsers.find(d => d.id === item.id); if (d) handleSelectDM(d); }
                }}
                selectedId={activeSpace?.id || activeDM?.id}
                navSearchQuery={navSearchQuery}
                mentionedMessages={mentionedMessages}  // FIX 5
                allSpaces={formattedSpaces}
                dmConversations={dmConversations}
                currentUserId={user.id}
                unreadCounts={unreadCounts}            // FIX 6
              />
            )}
            {activeView === 'mentions' ? (
              <MentionsActivityFeed 
                mentions={mentionedMessages}
                onSelectMention={(m) => {
                  if (m.sourceType === 'space') {
                    const s = spaces.find(sp => sp.id === m.sourceId);
                    if (s) handleSelectSpace(s);
                  } else {
                    const d = allUsers.find(u => u.id === m.sourceId);
                    if (d) handleSelectDM(d);
                  }
                }}
                onClose={handleBackToHome}
              />
            ) : (
              <ChatArea
                title={chatTitle}
                memberCount={memberCount}
                messages={messagesLoading ? [] : formattedMessages}
                onSend={handleSendMessage}
                isSpace={activeView === 'space'}
                activeView={activeView}
                onClose={handleBackToHome}
                isMaximized={isMaximized}
                onToggleMaximize={() => setIsMaximized(prev => !prev)}
                spaceMembers={spaceMembers}
                currentUserId={user.id}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onHideMessage={handleHideMessage}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                typingUsers={typingUsers}
                messagesLoading={messagesLoading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onTypingChange={handleTypingChange}
                spaceId={activeSpace?.id}
                allUsers={chatAllUsers}   // FIX 2: enables @mention autocomplete
                allSpaces={formattedSpaces}
                dmUsers={dmUsers}
                onForwardMessage={handleForwardMessage}
              />
            )}
          </>
        )}
        {activeView !== 'calendar' && (
          <RightIconRail onNavigateToCalendar={() => setActiveView('calendar')} />
        )}
      </div>
      {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
      {showChatSettings && <ChatSettingsModal onClose={() => setShowChatSettings(false)} />}
    </div>
  );
}

function WorkspaceRoot({ user, onSignOut }) {
  const [inAdmin, setInAdmin] = useState(false);
  if (inAdmin && user.role === 'admin') return <AdminApp onBack={() => setInAdmin(false)} />;
  return <ChatApp onSignOut={onSignOut} onOpenAdmin={() => setInAdmin(true)} />;
}

function AppRouter() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('landing');
  const navigate = (to) => { setPage(to); window.scrollTo({ top: 0 }); };
  const handleSignOut = async () => { await logout(); navigate('landing'); };

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, padding: 6 }}>
          <img src="/shnoor-logo.png" alt="SHNOOR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>
    );
  }

  if (user) return <WorkspaceRoot user={user} onSignOut={handleSignOut} />;
  if (page === 'login')   return <LoginPage onNavigate={navigate} />;
  if (page === 'privacy') return <PrivacyPolicyPage onNavigate={navigate} />;
  if (page === 'terms')   return <TermsPage onNavigate={navigate} />;
  if (page === 'cookie')  return <CookiePolicyPage onNavigate={navigate} />;
  if (page === 'security')return <SecurityPage onNavigate={navigate} />;
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