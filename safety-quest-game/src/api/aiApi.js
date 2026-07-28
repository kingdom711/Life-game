/**
 * AI 분석 관련 API
 */

import apiClient from './apiClient';
import { requireSupabase } from '../lib/supabase';

const useSupabase = true;

const aiApi = {
    /**
     * 위험 분석 요청 (GEMS AI)
     * @param {object} request - { inputType: 'TEXT' | 'PHOTO', content?: string, photo?: File }
     */
    generateBusinessPlan: async (request) => {
        if (useSupabase) {
            const supabase = requireSupabase();
            const body = request.photo
                ? (() => {
                    const formData = new FormData();
                    formData.append('inputType', request.inputType || 'PHOTO');
                    formData.append('inputText', request.inputText || request.content || '');
                    if (request.context) formData.append('context', JSON.stringify(request.context));
                    formData.append('photo', request.photo);
                    return formData;
                })()
                : {
                    inputType: request.inputType || 'TEXT',
                    inputText: request.inputText || request.content || '',
                    context: request.context,
                };
            const { data, error } = await supabase.functions.invoke('ai-analyze', { body });
            if (error) throw error;
            if (data?.error?.message) throw new Error(data.error.message);
            return data;
        }
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
            
            await apiClient.config.resolveApiBaseUrl();
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
        if (useSupabase) {
            const { data, error } = await requireSupabase()
                .from('ai_analysis_history')
                .select('id,analysis_id,input_text,input_type,context,result,action_taken,action_status,created_at,updated_at')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map((row) => ({
                id: row.analysis_id || row.id,
                inputText: row.input_text,
                inputType: row.input_type,
                context: row.context,
                result: row.result,
                actionTaken: row.action_taken,
                actionStatus: row.action_status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            }));
        }
        return apiClient.get('/business-plan/history');
    },
    
    /**
     * 서비스 상태 확인
     */
    getHealth: async () => {
        if (useSupabase) {
            return { status: 'UP', provider: 'Gemini', function: 'ai-analyze' };
        }
        return apiClient.get('/business-plan/health');
    },
};

export default aiApi;
