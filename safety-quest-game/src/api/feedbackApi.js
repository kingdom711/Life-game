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

    // 공지 (관리자 작성, 전체 사용자 노출)
    getNotices: async () => {
        return apiClient.get('/feedback/notices');
    },

    createNotice: async (data) => {
        return apiClient.post('/admin/feedback/notice', data);
    },

    deleteNotice: async (postId) => {
        return apiClient.delete(`/admin/feedback/notice/${postId}`);
    },

    // 공지 댓글
    addNoticeComment: async (postId, content) => {
        return apiClient.post(`/feedback/notices/${postId}/comments`, { content });
    },

    deleteNoticeComment: async (postId, commentId) => {
        return apiClient.delete(`/feedback/notices/${postId}/comments/${commentId}`);
    },
};

export default feedbackApi;
