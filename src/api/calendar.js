import api from './axios';

export const getTasks = () =>
  api.get('/api/calendar/tasks').then(r => r.data);

export const createTask = (task) =>
  api.post('/api/calendar/tasks', task).then(r => r.data);

export const toggleTask = (id, completed) =>
  api.patch(`/api/calendar/tasks/${id}`, { completed }).then(r => r.data);

export const deleteTask = (id) =>
  api.delete(`/api/calendar/tasks/${id}`).then(r => r.data);
