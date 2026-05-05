import api from './axios';

export const addReaction = (msgId, emoji) =>
  api.post(`/api/messages/${msgId}/reactions`, { emoji }).then(r => r.data);

export const removeReaction = (msgId, emoji) =>
  api.delete(`/api/messages/${msgId}/reactions`, { data: { emoji } }).then(r => r.data);

export const searchMessages = (q, spaceId = null, conversationId = null) => {
  let url = `/api/search?q=${encodeURIComponent(q)}`;
  if (spaceId) url += `&spaceId=${spaceId}`;
  if (conversationId) url += `&conversationId=${conversationId}`;
  return api.get(url).then(r => r.data);
};

// cursor = ISO timestamp of the oldest conversation for pagination
export const getDMConversations = () =>
  api.get('/api/dm/conversations').then(r => r.data);

// Fetch threaded replies for a parent message
export const getThreadReplies = (msgId) =>
  api.get(`/api/messages/${msgId}/thread`).then(r => r.data);

// Upload a file to Cloudinary via the backend — returns { url, name, type, size }
export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};

// Fetch mentions for the current user
export const getMentions = () =>
  api.get('/api/mentions').then(r => r.data);

// Mark all mentions as read — persists the timestamp so badge resets after refresh
export const markMentionsRead = () =>
  api.post('/api/mentions/mark-read').then(r => r.data);

// Star a message
export const starMessage = (msgId) =>
  api.post(`/api/messages/${msgId}/star`).then(r => r.data);

// Unstar a message
export const unstarMessage = (msgId) =>
  api.delete(`/api/messages/${msgId}/star`).then(r => r.data);

// Fetch all starred messages for the current user
export const getStarredMessages = () =>
  api.get('/api/starred').then(r => r.data);

// Authenticated download — axios passes the session cookie automatically
export const downloadAttachment = (url, name) =>
  api.get(`/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name || 'file')}`, {
    responseType: 'blob',
    timeout: 60000, // 60s timeout for large files
  });

export const getAttachments = (spaceId = null, conversationId = null) => {
  let url = '/api/attachments?';
  if (spaceId) url += `spaceId=${spaceId}`;
  if (conversationId) url += `&conversationId=${conversationId}`;
  return api.get(url).then(r => r.data);
};