/**
 * 검토 관련 API
 */

import apiClient from './apiClient';

const reviewApi = {
    /**
     * 체크리스트 검토 (승인/반려)
     * @param {number} checklistId
     * @param {object} request - { action: 'APPROVE' | 'REJECT', comment: string }
     */
    reviewChecklist: async (checklistId, request) => {
        return apiClient.post(`/reviews/${checklistId}`, request);
    },
    
    /**
     * 체크리스트 검토 이력 조회
     * @param {number} checklistId
     */
    getChecklistReviewHistory: async (checklistId) => {
        return apiClient.get(`/reviews/${checklistId}/history`);
    },
    
    /**
     * 최근 검토 이력 조회
     */
    getRecentReviews: async () => {
        return apiClient.get('/reviews/recent');
    },
};

export default reviewApi;

