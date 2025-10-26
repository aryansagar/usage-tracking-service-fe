import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Feature API
export const featureAPI = {
  create: (featureData) => {
    console.log('Sending feature data:', featureData); // Debug log
    return api.post('/features', featureData);
  },
  getAll: () => {
    return api.get('/features').then(response => {
      console.log('Received features:', response.data); // Debug log
      return response;
    });
  },
  update: (featureKey, updates) => api.put(`/features/${featureKey}`, updates),
};

// Usage API
export const usageAPI = {
  check: (data) => {
    console.log('Check usage data:', data);
    return api.post('/usage/check', data);
  },
  record: (data) => {
    console.log('Record usage data:', data);
    return api.post('/usage/record', data);
  },
  allocateSlot: (data) => {
    console.log('Allocate slot data:', data);
    return api.post('/usage/allocate-slot', data);
  },
  deallocateSlot: (data) => {
    console.log('Deallocate slot data:', data);
    return api.post('/usage/deallocate-slot', data);
  },
  getUserUsage: (userId, featureKey = null) => {
    const params = featureKey ? { featureKey } : {};
    return api.get(`/usage/${userId}`, { params });
  },
  // 🆕 ADD THIS NEW METHOD
  getAllUserUsage: (userId) => {
    console.log('Getting all usage for user:', userId);
    return api.get(`/usage/${userId}/all`);
  },
};

export default api;