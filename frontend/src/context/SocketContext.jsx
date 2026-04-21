import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [userPresence, setUserPresence] = useState({});

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(
      import.meta.env.VITE_API_URL || 'http://localhost:5000',
      { withCredentials: true }
    );

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('users:presence', (presenceMap) => {
      setUserPresence(presenceMap);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);

  // Registers a socket event listener and returns a cleanup function.
  // Safe to call before the socket connects — returns a no-op if socket isn't ready.
  const on = (event, callback) => {
    if (!socketRef.current) return () => { };
    const safe = (...args) => { try { callback(...args); } catch (e) { console.error(e); } };
    socketRef.current.on(event, safe);
    return () => socketRef.current?.off(event, safe);
  };

  const joinSpace = (spaceId) => emit('join_space', spaceId);
  const leaveSpace = (spaceId) => emit('leave_space', spaceId);
  const joinDM = (otherUserId) => emit('join_dm', otherUserId);
  const leaveCurrentDM = (conversationId) => emit('leave_dm', conversationId);

  const emitStatus = (status) => emit('status:update', status);
  const markDelivered = (data) => emit('mark:delivered', data);
  const markSeen = (data) => emit('mark:seen', data);

  const emitTyping = (roomType, roomId, userName, isTyping) => {
    const event = isTyping ? 'typing:start' : 'typing:stop';
    emit(event, { roomType, roomId, userName });
  };

  // Conversation-specific events
  const onNewMessage = (cb) => on('new_message', cb);
  const onMessageEdited = (cb) => on('message:edited', cb);
  const onMessageDeleted = (cb) => on('message:deleted', cb);
  const onReactionUpdated = (cb) => on('reaction:updated', cb);
  const onReceiptUpdated = (cb) => on('receipt:updated', cb);
  const onDMJoined = (cb) => on('dm:joined', cb);
  const onTypingUpdate = (cb) => on('typing:update', cb);

  // Fires when any DM conversation the user is part of receives a new message.
  // Used to refresh the sidebar conversation list preview regardless of current view.
  const onDMPreviewUpdated = (cb) => on('dm:preview_updated', cb);

  // Fires when an admin changes this user's role — triggers a user state refresh
  const onUserRoleChanged = (cb) => on('user:role_changed', cb);

  return (
    <SocketContext.Provider value={{
      connected, userPresence,
      joinSpace, leaveSpace, joinDM, leaveCurrentDM, emitTyping, emitStatus,
      markDelivered, markSeen,
      onNewMessage, onMessageEdited, onMessageDeleted,
      onReactionUpdated, onReceiptUpdated, onDMJoined, onTypingUpdate,
      onDMPreviewUpdated, onUserRoleChanged,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}