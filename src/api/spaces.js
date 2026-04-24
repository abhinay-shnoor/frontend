import api from './axios';

export const getSpaces = () =>
  api.get('/api/spaces').then(r => r.data);

export const createSpace = (name, description) =>
  api.post('/api/spaces', { name, description }).then(r => r.data);

export const deleteSpaceAPI = (spaceId) =>
  api.delete(`/api/spaces/${spaceId}`).then(r => r.data);

export const updateSpaceDescription = (spaceId, description) =>
  api.patch(`/api/spaces/${spaceId}/description`, { description }).then(r => r.data);

export const getSpaceMessages = (spaceId, before = null) => {
  const params = before ? `?before=${before}&limit=1000` : '?limit=1000';

  return api.get(`/api/spaces/${spaceId}/messages${params}`).then(r => r.data);
};

export const sendSpaceMessage = (spaceId, content, parentMessageId = null, attachments = [], isForwarded = false) =>
  api.post(`/api/spaces/${spaceId}/messages`, { content, parent_message_id: parentMessageId, attachments, is_forwarded: isForwarded }).then(r => r.data);

export const editSpaceMessage = (spaceId, msgId, content) =>
  api.patch(`/api/spaces/${spaceId}/messages/${msgId}`, { content }).then(r => r.data);

export const deleteSpaceMessage = (spaceId, msgId) =>
  api.delete(`/api/spaces/${spaceId}/messages/${msgId}`).then(r => r.data);

export const getSpaceMembers = (spaceId) =>
  api.get(`/api/spaces/${spaceId}/members`).then(r => r.data);

export const addSpaceMember = (spaceId, email) =>
  api.post(`/api/spaces/${spaceId}/members`, { email }).then(r => r.data);

export const removeSpaceMember = (spaceId, userId) =>
  api.delete(`/api/spaces/${spaceId}/members/${userId}`).then(r => r.data);