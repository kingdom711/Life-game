import apiClient from './apiClient';

const adminApi = {
    getDashboardSummary: async () => {
        return apiClient.get('/admin/dashboard/summary');
    },

    getParticipantEngagement: async (params = {}) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                search.set(key, value);
            }
        });

        const query = search.toString();
        return apiClient.get(`/admin/dashboard/participants${query ? `?${query}` : ''}`);
    },

    getPointRewardDashboard: async (params = {}) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                search.set(key, value);
            }
        });

        const query = search.toString();
        return apiClient.get(`/admin/dashboard/points${query ? `?${query}` : ''}`);
    },
};

export default adminApi;
