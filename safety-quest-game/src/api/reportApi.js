import apiClient from './apiClient';

const reportApi = {
    getMyReport: async (type = 'weekly') => {
        return apiClient.get(`/users/me/reports?type=${encodeURIComponent(type)}`);
    }
};

export default reportApi;
