import api from './axios';

export const getAllUsers = () =>
  api.get('/api/users').then(r => r.data);

export const getAllUsersAdmin = () =>
  api.get('/api/users/admin-all').then(r => r.data);

export const getDMMessages = (userId, before = null) => {
  const params = before ? `?before=${before}&limit=1000` : '?limit=1000';

  return api.get(`/api/dm/${userId}/messages${params}`).then(r => r.data);
};

export const sendDMMessage = (userId, content, parentMessageId = null, attachments = [], isForwarded = false) =>
  api.post(`/api/dm/${userId}/messages`, { content, parent_message_id: parentMessageId, attachments, is_forwarded: isForwarded }).then(r => r.data);

export const updateMyProfile = (name) =>
  api.patch('/api/users/me', { name }).then(r => r.data);

// Old base64 avatar — kept for compatibility but new code uses uploadAvatarToCloud
export const updateMyAvatar = (avatar) =>
  api.patch('/api/users/me/avatar', { avatar }).then(r => r.data);

// New Cloudinary avatar upload — sends the actual File object
export const uploadAvatarToCloud = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return api.post('/api/users/me/avatar/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};

export const getPreferences = () =>
  api.get('/api/users/me/preferences').then(r => r.data);

export const updatePreferences = (preferences) =>
  api.patch('/api/users/me/preferences', { preferences }).then(r => r.data);

export const updateUserRole = (userId, role) =>
  api.patch(`/api/users/${userId}/role`, { role }).then(r => r.data);

export const updateUserStatus = (userId, is_active) =>
  api.patch(`/api/users/${userId}/status`, { is_active }).then(r => r.data);

export const getArchivedChats = () =>
  api.get('/api/users/me/archived-chats').then(r => r.data);

export const archiveChat = (chat_id, chat_type) =>
  api.post('/api/users/me/archived-chats', { chat_id, chat_type }).then(r => r.data);

export const unarchiveChat = (chat_id, chat_type) =>
  api.delete(`/api/users/me/archived-chats/${chat_type}/${chat_id}`).then(r => r.data);

export const getLockedChats = () =>
  api.get('/api/users/me/locked-chats').then(r => r.data);

export const lockChat = (chat_id, chat_type) =>
  api.post('/api/users/me/locked-chats', { chat_id, chat_type }).then(r => r.data);

export const unlockChat = (chat_id, chat_type) =>
  api.delete(`/api/users/me/locked-chats/${chat_type}/${chat_id}`).then(r => r.data);

export const setPin = (pin) =>
  api.post('/api/users/me/pin', { pin }).then(r => r.data);

export const verifyPin = (pin) =>
  api.post('/api/users/me/pin/verify', { pin }).then(r => r.data);