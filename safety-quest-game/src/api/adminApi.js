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

    getPasswordResetRequests: async (pendingOnly = true) => {
        return apiClient.get(`/admin/password-reset-requests?pendingOnly=${pendingOnly}`);
    },

    approvePasswordResetRequest: async (requestId) => {
        return apiClient.post(`/admin/password-reset-requests/${requestId}/approve`, {});
    },

    rejectPasswordResetRequest: async (requestId, reason) => {
        return apiClient.post(`/admin/password-reset-requests/${requestId}/reject`, { reason });
    },
};

export default adminApi;
