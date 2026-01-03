/**
 * 체크리스트 관련 API
 */

import apiClient from './apiClient';

const checklistApi = {
    /**
     * 체크리스트 제출
     * @param {object} request - { templateId, siteName, items: [{ templateItemId, answer, comment, riskFlag }] }
     * @param {File[]} files - 업로드할 파일 목록 (선택)
     */
    submitChecklist: async (request, files = []) => {
        const formData = new FormData();
        
        // 요청 데이터를 JSON 문자열로 변환하여 추가
        formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
        
        // 파일 추가
        files.forEach((file) => {
            formData.append('files', file);
        });
        
        // Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 multipart/form-data로 설정)
        const token = apiClient.token.getAccessToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = apiClient.config.getApiUrl('/checklists');
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });
        
        const apiResponse = await response.json();
        
        if (!response.ok || apiResponse.success === false) {
            const error = apiResponse.error || {};
            throw new Error(error.message || `API Error: ${response.status}`);
        }
        
        return apiResponse.data;
    },
    
    /**
     * 내 체크리스트 목록 조회 (페이징)
     * @param {object} params - { page, size, sort }
     */
    getMyChecklists: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);
        if (params.sort) queryParams.append('sort', params.sort);
        
        const endpoint = `/checklists/my${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return apiClient.get(endpoint);
    },
    
    /**
     * 체크리스트 상세 조회
     * @param {number} checklistId
     */
    getChecklistDetail: async (checklistId) => {
        return apiClient.get(`/checklists/${checklistId}`);
    },
    
    /**
     * 상태별 체크리스트 조회
     * @param {string} status - SUBMITTED, APPROVED, REJECTED
     */
    getChecklistsByStatus: async (status) => {
        return apiClient.get(`/checklists/status/${status}`);
    },
    
    /**
     * 위험 항목이 있는 체크리스트 조회
     * @param {string} status - SUBMITTED (기본값)
     */
    getChecklistsWithRisk: async (status = 'SUBMITTED') => {
        return apiClient.get(`/checklists/with-risk?status=${status}`);
    },
};

export default checklistApi;

