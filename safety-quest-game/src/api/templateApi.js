/**
 * 템플릿 관련 API
 */

import apiClient from './apiClient';

const templateApi = {
    /**
     * 템플릿 목록 조회
     * @param {number} workTypeId - 작업 유형 ID (선택)
     */
    getTemplates: async (workTypeId = null) => {
        const endpoint = workTypeId 
            ? `/templates?workTypeId=${workTypeId}`
            : '/templates';
        return apiClient.get(endpoint);
    },
    
    /**
     * 템플릿 상세 조회
     * @param {number} templateId
     */
    getTemplateDetail: async (templateId) => {
        return apiClient.get(`/templates/${templateId}`);
    },
};

export default templateApi;

