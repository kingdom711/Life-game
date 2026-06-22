import apiClient from './apiClient';

const feedbackApi = {
    create: async (data) => {
        return apiClient.post('/feedback', data);
    },

    getMine: async () => {
        return apiClient.get('/feedback/me');
    },

    getAll: async (status) => {
        const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
        return apiClient.get(`/admin/feedback${query}`);
    },

    updateStatus: async (postId, status) => {
        return apiClient.put(`/admin/feedback/${postId}/status`, { status });
    },

    reply: async (postId, reply) => {
        return apiClient.post(`/admin/feedback/${postId}/reply`, { reply });
    },
};

export default feedbackApi;
