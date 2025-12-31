//handle all communication with backend

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if you have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Assuming you store token in localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching profile';
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, userData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error updating profile';
  }
};

export const uploadUserAvatar = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/avatar`, formData, {
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error uploading avatar';
  }
};