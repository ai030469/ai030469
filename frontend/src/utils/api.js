import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Events
export const getEvents = (params = {}) => api.get('/events', { params }).then(r => r.data);
export const getEvent = (id) => api.get(`/events/${id}`).then(r => r.data);
export const createEvent = (data) => api.post('/events', data).then(r => r.data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data).then(r => r.data);
export const deleteEvent = (id) => api.delete(`/events/${id}`).then(r => r.data);
export const toggleTask = (taskId, is_done) => api.patch(`/events/tasks/${taskId}`, { is_done }).then(r => r.data);

// Export
export const getWeeklySummary = (weekStart) =>
  api.get('/export/weekly-summary', { params: { weekStart } }).then(r => r.data);

export const exportToExcel = (weekStart) => {
  const params = weekStart ? `?weekStart=${weekStart}` : '';
  window.open(`/api/export/excel${params}`, '_blank');
};

export const exportToGoogleSheets = (data) =>
  api.post('/export/google-sheets', data).then(r => r.data);

// Transcription / field extraction
export const extractFields = (transcript) =>
  api.post('/transcribe/extract', { transcript }).then(r => r.data);

export default api;
