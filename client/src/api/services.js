import api from './axios';

export const authApi = {
  register: (body) => api.post('/auth/register', body),
  login: (body) => api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh', {}, { withCredentials: true }),
  me: () => api.get('/auth/me'),
};

export const roomsApi = {
  list: (params) => api.get('/rooms', { params }),
  myRooms: () => api.get('/rooms/user'),
  getById: (id) => api.get(`/rooms/${id}`),
  getFullById: (id) => api.get(`/rooms/${id}/full`),
  nearby: (params) => api.get('/rooms/nearby', { params }),
  compare: (ids) => api.get('/rooms/compare', { params: { ids: ids.join(',') } }),
  create: (formData) => api.post('/rooms', formData),
  update: (id, formData) => api.put(`/rooms/${id}`, formData),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const favoritesApi = {
  list: () => api.get('/favorites'),
  add: (roomId) => api.post(`/favorites/${roomId}`),
  remove: (roomId) => api.delete(`/favorites/${roomId}`),
};

export const aiApi = {
  recommendRoom: (body) => api.post('/ai/recommend-room', body),
  chat: (body) => api.post('/ai/chat', body),
};

export const recommendationApi = {
  savePreferences: (body) => api.post('/recommendations/preferences', body),
  getRecommendations: () => api.get('/recommendations'),
};

export const reviewApi = {
  create: (body) => api.post('/reviews', body),
  listByRoom: (roomId) => api.get(`/reviews/${roomId}`),
  reply: (reviewId, body) => api.patch(`/reviews/${reviewId}/reply`, body),
};

export const inquiryApi = {
  create: (body) => api.post('/inquiries', body),
  mine: () => api.get('/inquiries/me'),
  reply: (inquiryId, body) => api.patch(`/inquiries/${inquiryId}/reply`, body),
};

export const analyticsApi = {
  owner: () => api.get('/analytics/owner'),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

export const roommatesApi = {
  getMyProfile: () => api.get('/roommates/me'),
  upsertMyProfile: (body) => api.put('/roommates/me', body),
  findMatches: () => api.get('/roommates/matches')
};
