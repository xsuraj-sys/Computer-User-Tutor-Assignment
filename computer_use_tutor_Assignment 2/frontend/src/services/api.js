import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here - let components handle auth errors
      console.warn('Authentication failed - token removed from localStorage');
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Event API methods
export const eventAPI = {
  // Get all events with optional date range
  getAllEvents: async (start, end) => {
    const params = {};
    if (start && end) {
      params.start = start.toISOString();
      params.end = end.toISOString();
    }
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  // Get events by date
  getEventsByDate: async (date) => {
    const dateString = date.toISOString().split('T')[0];
    const response = await apiClient.get(`/events/date/${dateString}`);
    return response.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id, updates) => {
    const response = await apiClient.put(`/events/${id}`, updates);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    await apiClient.delete(`/events/${id}`);
    return id;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Export the axios instance for direct use if needed
export default apiClient;
