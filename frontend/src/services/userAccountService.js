import apiClient from './apiClients.js';

export const userApi = {
    getAll: async (params) => {
        const response = await apiClient.get('/users', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/users/stats');
        return response.data;
    },

    updateStatus: async (id, action) => {
        const response = await apiClient.put(`/users/${id}/status`, { action });
        return response.data;
    },

    create: async (userData) => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    }
};