import apiClient from './apiClients.js';

export const feedbackApi = {
    getList: async (params) => {
        const response = await apiClient.get('/feedback', { params });
        return response.data;
    },

    getDetail: async (id) => {
        const response = await apiClient.get(`/feedback/${id}`);
        return response.data;
    },

    resolve: async (id) => {
        const response = await apiClient.put(`/feedback/${id}/resolve`);
        return response.data;
    },

    reply: async (id, message) => {
        const response = await apiClient.put(`/feedback/${id}/reply`, { message });
        return response.data;
    },

    saveNote: async (id, note) => {
        const response = await apiClient.put(`/feedback/${id}/note`, { note });
        return response.data;
    }
};