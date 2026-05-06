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

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to server. ID:', socketRef.current.id);
      setConnected(true);
    });
    socketRef.current.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected from server. Reason:', reason);
      setConnected(false);
    });

    // Universal Online Users Listener
    const handleOnlineUsers = (userIds) => {
      if (!userIds) return;
      console.log('[Socket] Received users:online list:', userIds);
      const ids = Array.isArray(userIds) ? userIds.map(u => (typeof u === 'object' ? (u.id || u._id || u.userId) : u)) : [];
      setOnlineUsers(new Set(ids));
    };
    socketRef.current.on('users:online', handleOnlineUsers);
    socketRef.current.on('online_users', handleOnlineUsers);
    socketRef.current.on('users_list', handleOnlineUsers);

    // Sync full presence map from server
    socketRef.current.on('users:presence', (presenceMap) => {
      console.log('[Socket] Received Full Presence Map:', presenceMap);
      if (!presenceMap) return;
      
      const ids = Object.keys(presenceMap);
      setOnlineUsers(new Set(ids));
      
      // Replace the entire status map with the server's current snapshot
      // This ensures that users who went offline are removed from the map.
      setUserStatuses(new Map(Object.entries(presenceMap)));
    });

    const handleStatusUpdate = (data) => {
      if (!data) return;
      // Capture ID and Status from ANY possible property name
      const uid = data.userId || data.id || data.uid || data.user_id || data._id;
      const status = data.status || data.mode || data.user_status || data.presence;
      if (uid && status) {
        setUserStatuses(prev => {
          const next = new Map(prev);
          next.set(uid, status);
          return next;
        });
      }
    };

    socketRef.current.on('user:status_changed', handleStatusUpdate);
    socketRef.current.on('user_status_changed', handleStatusUpdate);
    socketRef.current.on('status_update', handleStatusUpdate);
    socketRef.current.on('presence_change', handleStatusUpdate);

    // Heartbeat Interval (Production Reliability)
    const heartbeatInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('heartbeat');
      }
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
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
  const emitStatusChange = (status, userId) => {
    // 1. Broadcast to others
    emit('user:status_change', status);
    
    // 2. Update locally for instant feedback
    if (userId) {
      setUserStatuses(prev => {
        const next = new Map(prev);
        next.set(userId, status);
        return next;
      });
    }
  };

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
  const onSpacePreviewUpdated = (cb) => on('space:preview_updated', cb);
  const onUserRoleChanged  = (cb) => on('user:role_changed',  cb);
  const onReceiptUpdated   = (cb) => on('receipt:updated',   cb);
  const onMessagePinned    = (cb) => on('message:pinned',    cb);
  const onMessageUnpinned  = (cb) => on('message:unpinned',  cb);

  // Mark message as delivered
  const emitMarkDelivered = ({ messageId, spaceId, conversationId }) =>
    emit('mark:delivered', { messageId, spaceId, conversationId });

  // Mark message as seen
  const emitMarkSeen = ({ messageId, spaceId, conversationId }) =>
    emit('mark:seen', { messageId, spaceId, conversationId });

  // Mark entire chat (space or DM) as read
  const emitMarkSpaceRead = (spaceId) =>
    emit('mark:space_read', spaceId);

  const emitMarkDMRead = (conversationId) =>
    emit('mark:dm_read', conversationId);

  // FIX 4: Helper to get a display status for a user
  // Returns: 'online' | 'away' | 'dnd' | 'offline'
  const getUserStatus = (userId) => {
    if (!userId) return 'offline';
    
    // Normalize ID to string, handling all possible formats with ultra-lenient matching
    const normalizeId = (id) => {
      if (!id) return '';
      let strId = '';
      if (typeof id === 'string') strId = id;
      else if (typeof id === 'number') strId = String(id);
      else if (typeof id === 'object') {
        strId = String(id.id || id._id || id.userId || id.uid || id.partner_id || JSON.stringify(id));
      } else {
        strId = String(id);
      }
      
      // Ultra-lenient: strip everything except alphanumeric characters for comparison
      return strId.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const targetId = normalizeId(userId);
    if (!targetId) return 'offline';

    // Check userStatuses Map for explicit mode first (highest priority)
    let explicitStatus = null;
    for (let [uid, status] of userStatuses.entries()) {
      if (normalizeId(uid) === targetId) {
        explicitStatus = status;
        break;
      }
    }
    
    if (explicitStatus === 'away') return 'away';
    if (explicitStatus === 'dnd')  return 'dnd';
    if (explicitStatus === 'active' || explicitStatus === 'online') return 'online';

    // Check online status by looking for ID in onlineUsers set
    const onlineList = Array.from(onlineUsers);
    const isOnline = onlineList.some(u => normalizeId(u) === targetId);
    
    if (isOnline) return 'online';
    
    return 'offline';
  };

  // Dot color helper used by Avatar presence indicators
  const getStatusColor = (userId) => {
    const status = getUserStatus(userId);
    if (status === 'online') return '#34A853'; // green
    if (status === 'away')   return '#FBBC04'; // yellow
    if (status === 'dnd')    return '#EA4335'; // red
    return '#9CA3AF';                          // gray = offline (always visible)
  };

  return (
    <SocketContext.Provider value={{
      connected, onlineUsers, userStatuses,
      getUserStatus, getStatusColor,
      emitStatusChange,
      joinSpace, leaveSpace, joinDM, leaveCurrentDM, emitTyping,
      onNewMessage, onMessageEdited, onMessageDeleted,
      onReactionUpdated, onDMJoined, onTypingUpdate,
      onDMPreviewUpdated, onSpacePreviewUpdated, onUserRoleChanged, onReceiptUpdated,
      onMessagePinned, onMessageUnpinned,
      emitMarkDelivered, emitMarkSeen,
      emitMarkSpaceRead, emitMarkDMRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}