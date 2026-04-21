// import { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';
// import { useAuth } from './AuthContext';

// const SocketContext = createContext(null);

// export function SocketProvider({ children }) {
//   const { user } = useAuth();
//   const socketRef = useRef(null);
//   const [connected, setConnected] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState(new Set());

//   useEffect(() => {
//     if (!user) return;

//     socketRef.current = io(
//       import.meta.env.VITE_API_URL || 'http://localhost:5000',
//       { withCredentials: true }
//     );

//     socketRef.current.on('connect', () => setConnected(true));
//     socketRef.current.on('disconnect', () => setConnected(false));

//     socketRef.current.on('users:online', (userIds) => {
//       setOnlineUsers(new Set(userIds));
//     });

//     return () => {
//       socketRef.current?.disconnect();
//       socketRef.current = null;
//       setConnected(false);
//     };
//   }, [user]);

//   const emit = (event, data) => socketRef.current?.emit(event, data);

//   // Registers a socket event listener and returns a cleanup function.
//   // Safe to call before the socket connects — returns a no-op if socket isn't ready.
//   const on = (event, callback) => {
//     if (!socketRef.current) return () => { };
//     const safe = (...args) => { try { callback(...args); } catch (e) { console.error(e); } };
//     socketRef.current.on(event, safe);
//     return () => socketRef.current?.off(event, safe);
//   };

//   const joinSpace = (spaceId) => emit('join_space', spaceId);
//   const leaveSpace = (spaceId) => emit('leave_space', spaceId);
//   const joinDM = (otherUserId) => emit('join_dm', otherUserId);
//   const leaveCurrentDM = (conversationId) => emit('leave_dm', conversationId);

//   const emitTyping = (roomType, roomId, userName, isTyping) => {
//     const event = isTyping ? 'typing:start' : 'typing:stop';
//     emit(event, { roomType, roomId, userName });
//   };

//   // Conversation-specific events
//   const onNewMessage = (cb) => on('new_message', cb);
//   const onMessageEdited = (cb) => on('message:edited', cb);
//   const onMessageDeleted = (cb) => on('message:deleted', cb);
//   const onReactionUpdated = (cb) => on('reaction:updated', cb);
//   const onDMJoined = (cb) => on('dm:joined', cb);
//   const onTypingUpdate = (cb) => on('typing:update', cb);

//   // Fires when any DM conversation the user is part of receives a new message.
//   // Used to refresh the sidebar conversation list preview regardless of current view.
//   const onDMPreviewUpdated = (cb) => on('dm:preview_updated', cb);

//   // Fires when an admin changes this user's role — triggers a user state refresh
//   const onUserRoleChanged = (cb) => on('user:role_changed', cb);

//   return (
//     <SocketContext.Provider value={{
//       connected, onlineUsers,
//       joinSpace, leaveSpace, joinDM, leaveCurrentDM, emitTyping,
//       onNewMessage, onMessageEdited, onMessageDeleted,
//       onReactionUpdated, onDMJoined, onTypingUpdate,
//       onDMPreviewUpdated, onUserRoleChanged,
//     }}>
//       {children}
//     </SocketContext.Provider>
//   );
// }

// export function useSocket() {
//   return useContext(SocketContext);
// }

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // FIX 4: Track per-user status: userId → 'active' | 'away' | 'dnd' | 'offline'
  const [userStatuses, setUserStatuses] = useState(new Map());

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(
      import.meta.env.VITE_API_URL || 'http://localhost:5000',
      { withCredentials: true }
    );

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('users:online', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    // FIX 4: Listen for individual status changes from all users.
    // Server emits: { userId, status: 'active' | 'away' | 'dnd' | 'offline' }
    socketRef.current.on('user:status_changed', ({ userId, status }) => {
      setUserStatuses(prev => {
        const next = new Map(prev);
        next.set(userId, status);
        return next;
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);

  const on = (event, callback) => {
    if (!socketRef.current) return () => {};
    const safe = (...args) => { try { callback(...args); } catch (e) { console.error(e); } };
    socketRef.current.on(event, safe);
    return () => socketRef.current?.off(event, safe);
  };

  const joinSpace       = (spaceId)       => emit('join_space', spaceId);
  const leaveSpace      = (spaceId)       => emit('leave_space', spaceId);
  const joinDM          = (otherUserId)   => emit('join_dm', otherUserId);
  const leaveCurrentDM  = (conversationId)=> emit('leave_dm', conversationId);

  // FIX 4: Let the current user broadcast their own status change
  const emitStatusChange = (status) => emit('user:status_change', status);

  const emitTyping = (roomType, roomId, userName, isTyping) => {
    const event = isTyping ? 'typing:start' : 'typing:stop';
    emit(event, { roomType, roomId, userName });
  };

  const onNewMessage       = (cb) => on('new_message',        cb);
  const onMessageEdited    = (cb) => on('message:edited',     cb);
  const onMessageDeleted   = (cb) => on('message:deleted',    cb);
  const onReactionUpdated  = (cb) => on('reaction:updated',   cb);
  const onDMJoined         = (cb) => on('dm:joined',          cb);
  const onTypingUpdate     = (cb) => on('typing:update',      cb);
  const onDMPreviewUpdated = (cb) => on('dm:preview_updated', cb);
  const onUserRoleChanged  = (cb) => on('user:role_changed',  cb);
  const onReceiptUpdated   = (cb) => on('receipt:updated',   cb);

  // Mark message as delivered
  const emitMarkDelivered = ({ messageId, spaceId, conversationId }) =>
    emit('mark:delivered', { messageId, spaceId, conversationId });

  // Mark message as seen
  const emitMarkSeen = ({ messageId, spaceId, conversationId }) =>
    emit('mark:seen', { messageId, spaceId, conversationId });

  // FIX 4: Helper to get a display status for a user
  // Returns: 'online' | 'away' | 'dnd' | 'offline'
  const getUserStatus = (userId) => {
    if (!onlineUsers.has(userId)) return 'offline';
    const s = userStatuses.get(userId);
    if (s === 'away') return 'away';
    if (s === 'dnd')  return 'dnd';
    return 'online';
  };

  // Dot color helper used by Avatar presence indicators
  const getStatusColor = (userId) => {
    const status = getUserStatus(userId);
    if (status === 'online') return '#10B981'; // green
    if (status === 'away')   return '#FBBC04'; // yellow
    if (status === 'dnd')    return '#EA4335'; // red
    return '#9CA3AF';                          // gray = offline
  };

  return (
    <SocketContext.Provider value={{
      connected, onlineUsers, userStatuses,
      getUserStatus, getStatusColor,
      emitStatusChange,
      joinSpace, leaveSpace, joinDM, leaveCurrentDM, emitTyping,
      onNewMessage, onMessageEdited, onMessageDeleted,
      onReactionUpdated, onDMJoined, onTypingUpdate,
      onDMPreviewUpdated, onUserRoleChanged, onReceiptUpdated,
      emitMarkDelivered, emitMarkSeen,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}