/**
 * 위험성 평가 관련 API
 */

import apiClient from './apiClient';

const riskApi = {
    /**
     * 평가 대상 위험 항목 조회
     */
    getPendingRisks: async () => {
        return apiClient.get('/risks/pending');
    },
    
    /**
     * 위험성 평가 등록
     * @param {number} checklistItemId
     * @param {object} request - { frequency: number, severity: number, comment?: string }
     */
    assessRisk: async (checklistItemId, request) => {
        return apiClient.post(`/risks/${checklistItemId}/assess`, request);
    },
    
    /**
     * 위험성 평가 상세 조회
     * @param {number} assessmentId
     */
    getAssessmentDetail: async (assessmentId) => {
        return apiClient.get(`/risks/${assessmentId}`);
    },
    
    /**
     * 고위험 항목 조회
     */
    getHighRiskItems: async () => {
        return apiClient.get('/risks/high-risk');
    },
    
    /**
     * 위험 레벨별 조회
     * @param {string} level - LOW, MEDIUM, HIGH, CRITICAL
     */
    getAssessmentsByLevel: async (level) => {
        return apiClient.get(`/risks/level/${level}`);
    },
    
    /**
     * 미완료 대책 목록 조회
     */
    getIncompleteCountermeasures: async () => {
        return apiClient.get('/risks/countermeasures/incomplete');
    },
    
    /**
     * 기한 초과 대책 조회
     */
    getOverdueCountermeasures: async () => {
        return apiClient.get('/risks/countermeasures/overdue');
    },
    
    /**
     * 대책 완료 처리
     * @param {number} countermeasureId
     */
    completeCountermeasure: async (countermeasureId) => {
        return apiClient.patch(`/risks/countermeasures/${countermeasureId}/complete`, {});
    },
};

export default riskApi;

