/**
 * AI 분석 관련 API
 */

import apiClient from './apiClient';

const aiApi = {
    /**
     * 위험 분석 요청 (GEMS AI)
     * @param {object} request - { inputType: 'TEXT' | 'PHOTO', content?: string, photo?: File }
     */
    generateBusinessPlan: async (request) => {
        // 사진 업로드가 포함된 경우 FormData 사용
        if (request.photo) {
            const formData = new FormData();
            formData.append('inputType', request.inputType);
            if (request.content) {
                formData.append('content', request.content);
            }
            formData.append('photo', request.photo);
            
            const token = apiClient.token.getAccessToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const url = apiClient.config.getApiUrl('/business-plan/generate');
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
        } else {
            // 텍스트만 있는 경우 JSON
            return apiClient.post('/business-plan/generate', request);
        }
    },
    
    /**
     * 분석 기록 조회
     */
    getHistory: async () => {
        return apiClient.get('/business-plan/history');
    },
    
    /**
     * 서비스 상태 확인
     */
    getHealth: async () => {
        return apiClient.get('/business-plan/health');
    },
};

export default aiApi;

