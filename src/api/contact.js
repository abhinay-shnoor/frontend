import api from './axios';

export const submitContactQuery = (data) =>
  api.post('/api/contact', data).then(r => r.data);

export const getContactQueries = () =>
  api.get('/api/contact').then(r => r.data);

export const updateQueryStatus = (id, status) =>
  api.patch(`/api/contact/${id}/status`, { status }).then(r => r.data);