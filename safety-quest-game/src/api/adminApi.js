import apiClient from './apiClient';

const adminApi = {
    getDashboardSummary: async () => {
        return apiClient.get('/admin/dashboard/summary');
    },
};

export default adminApi;
