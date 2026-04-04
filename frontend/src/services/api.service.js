import axios from "axios";

const api = axios.create({ 
  baseURL: import.meta.env.VITE_BACKEND_URL || "/api", 
  timeout: 15000,
  withCredentials: true 
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

// Content
export const contentAPI = {
  save: (data) => api.post("/content", data),
  getAll: (params) => api.get("/content", { params }),
  getOne: (id) => api.get(`/content/${id}`),
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
  toggleFavorite: (id) => api.patch(`/content/${id}/favorite`),
  toggleArchive: (id) => api.patch(`/content/${id}/archive`),
  addHighlight: (id, data) => api.post(`/content/${id}/highlight`, data),
  resurface: () => api.get("/content/resurface"),
  getStats: () => api.get("/content/stats"),
  updateProgress: (id, progress) => api.patch(`/content/${id}/progress`, { progress }),
};

// Collections
export const collectionsAPI = {
  getAll: () => api.get("/collections"),
  getOne: (id) => api.get(`/collections/${id}`),
  create: (data) => api.post("/collections", data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
  addItem: (id, contentId) => api.post(`/collections/${id}/add`, { contentId }),
  removeItem: (id, contentId) => api.delete(`/collections/${id}/remove/${contentId}`),
};

// Search
export const searchAPI = {
  search: (q, type = "semantic") => api.get("/search", { params: { q, type } }),
  getRelated: (id) => api.get(`/search/related/${id}`),
  getTags: () => api.get("/search/tags"),
  getGraphData: () => api.get("/search/graph"),
};

export default api;
