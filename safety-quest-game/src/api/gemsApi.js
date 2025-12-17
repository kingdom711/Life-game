/**
 * GEMS (안전 지능 시스템) AI 분석 API
 * 
 * 백엔드 연동 가이드: @Docs/BACKEND_INTEGRATION_GUIDE.md
 * 
 * API 엔드포인트:
 * - POST /api/v1/business-plan/generate  - 위험 분석 요청
 * - GET  /api/v1/business-plan/history   - 분석 기록 조회
 * - GET  /api/v1/business-plan/health    - 서비스 상태
 */

import apiClient, { ApiError } from './apiClient';
import config from '../config/environment';

// Mock 응답 데이터 (폴백용) - KOSHA 코드 기반
const MOCK_RESPONSES = [
    {
        riskFactor: '고소 작업 중 안전대 미체결',
        remediationSteps: [
            '즉시 작업을 중단하고 안전한 장소로 이동하십시오.',
            '안전대 및 부속품의 상태를 점검하십시오.',
            '안전대 체결 후 2인 1조로 작업을 재개하십시오.'
        ],
        referenceCode: 'KOSHA-G-2023-01',
        riskLevel: 'HIGH'
    },
    {
        riskFactor: '가연성 물질 주변 화기 작업',
        remediationSteps: [
            '반경 10m 이내 가연성 물질을 제거하거나 방염포로 덮으십시오.',
            '소화기를 작업 장소 바로 옆에 비치하십시오.',
            '화기 감시자를 배치하고 작업을 진행하십시오.'
        ],
        referenceCode: 'KOSHA-M-2023-05',
        riskLevel: 'CRITICAL'
    },
    {
        riskFactor: '개인보호구(안전모) 미착용',
        remediationSteps: [
            '작업자에게 즉시 안전모 착용을 지시하십시오.',
            '안전모의 턱끈 체결 상태를 확인하십시오.',
            '개인보호구 착용 교육을 실시하십시오.'
        ],
        referenceCode: 'KOSHA-P-2023-12',
        riskLevel: 'MEDIUM'
    },
    {
        riskFactor: '밀폐공간 산소 농도 미확인',
        remediationSteps: [
            '밀폐공간 진입을 즉시 금지하십시오.',
            '산소 농도 측정기로 농도를 확인하십시오 (18% 이상 필요).',
            '환기 장치를 가동하고 충분히 환기하십시오.',
            '밀폐공간 작업 허가서를 발급받은 후 진입하십시오.'
        ],
        referenceCode: 'KOSHA-S-2023-03',
        riskLevel: 'CRITICAL'
    },
    {
        riskFactor: '비계 안전난간 불량',
        remediationSteps: [
            '해당 구역 작업을 즉시 중단하십시오.',
            '안전난간 고정 상태를 점검하고 보수하십시오.',
            '비계 구조물 전체 안전 점검을 실시하십시오.',
            '작업 재개 전 관리감독자의 확인을 받으십시오.'
        ],
        referenceCode: 'KOSHA-C-2023-08',
        riskLevel: 'HIGH'
    }
];

/**
 * Mock 응답 생성
 */
const getMockResponse = () => {
    return new Promise((resolve) => {
        const delay = Math.floor(Math.random() * 1500) + 1000;
        setTimeout(() => {
            const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
            resolve({
                success: true,
                riskFactor: mockResponse.riskFactor,
                remediationSteps: mockResponse.remediationSteps,
                referenceCode: mockResponse.referenceCode,
                riskLevel: mockResponse.riskLevel,
                actionRecordId: `action-${Date.now()}`,
                analysisId: `mock-${Date.now()}`,
                analyzedAt: new Date().toISOString(),
                isMock: true
            });
        }, delay);
    });
};

const gemsApi = {
    /**
     * 위험 상황 분석 요청
     * 
     * @param {object} data - 요청 데이터
     * @param {string} data.inputText - 위험 상황 설명 텍스트 (필수)
     * @param {string} [data.photoId] - 업로드된 사진 ID
     * @param {object} [data.context] - 현장 컨텍스트 정보
     * @param {string} [data.context.workType] - 작업 유형 (construction, manufacturing 등)
     * @param {string} [data.context.location] - 작업 위치
     * @param {number} [data.context.workerCount] - 작업자 수
     * @param {string} [data.context.currentTask] - 현재 수행 중인 작업
     * 
     * @returns {Promise<object>} 분석 결과
     */
    analyzeRisk: async (data) => {
        // Mock 모드인 경우
        if (config.USE_MOCK) {
            console.log('[GEMS API] Using Mock Response (USE_MOCK=true)');
            return getMockResponse();
        }
        
        try {
            console.log('[GEMS API] Calling POST /api/v1/business-plan/generate');
            
            // 요청 데이터 구성
            const requestBody = {
                inputType: data.photoId ? 'PHOTO' : 'TEXT',
                inputText: data.inputText,
                photoId: data.photoId || null,
                context: data.context || {}
            };
            
            console.log('[GEMS API] Request Body:', requestBody);
            
            // 실제 API 호출
            // 엔드포인트: POST /api/v1/business-plan/generate
            const response = await apiClient.post('/business-plan/generate', requestBody);
            
            console.log('[GEMS API] Raw Response:', response);
            
            // 백엔드 응답 형식: { success: true, data: { riskFactor, remediationSteps, ... } }
            // 응답 데이터 추출 (data 필드가 있으면 사용, 없으면 직접 접근)
            const responseData = response.data || response;
            
            // 응답 데이터 정규화
            const normalizedResponse = {
                success: response.success !== undefined ? response.success : true,
                riskFactor: responseData.riskFactor || responseData.risk_factor || '위험 요인 분석 완료',
                remediationSteps: responseData.remediationSteps || responseData.remediation_steps || [],
                referenceCode: responseData.referenceCode || responseData.reference_code || 'KOSHA-AI-2024',
                riskLevel: responseData.riskLevel || responseData.risk_level || 'MEDIUM',
                actionRecordId: responseData.actionRecordId || responseData.action_record_id || null,
                analysisId: responseData.analysisId || responseData.analysis_id || `analysis-${Date.now()}`,
                analyzedAt: responseData.analyzedAt || responseData.analyzed_at || new Date().toISOString(),
                rawResponse: response
            };
            
            console.log('[GEMS API] Normalized Response:', normalizedResponse);
            
            return normalizedResponse;
            
        } catch (error) {
            console.error('[GEMS API] Error:', error);
            
            // 서버 연결 실패 시 Mock으로 폴백
            if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) {
                console.warn('[GEMS API] Falling back to Mock Response due to server error');
                const mockResult = await getMockResponse();
                return {
                    ...mockResult,
                    fallback: true,
                    fallbackReason: error.message
                };
            }
            
            throw error;
        }
    },
    
    /**
     * 분석 기록 조회
     * 엔드포인트: GET /api/v1/business-plan/history
     */
    getAnalysisHistory: async () => {
        if (config.USE_MOCK) {
            return { success: true, data: [], total: 0 };
        }
        
        try {
            const response = await apiClient.get('/business-plan/history');
            return {
                success: true,
                data: response.data || response || [],
                total: response.total || (response.data || response || []).length
            };
        } catch (error) {
            console.error('[GEMS API] History Error:', error);
            return { success: false, data: [], total: 0, error: error.message };
        }
    },
    
    /**
     * 서비스 상태 확인
     * 엔드포인트: GET /api/v1/business-plan/health
     */
    checkHealth: async () => {
        if (config.USE_MOCK) {
            return { success: true, status: 'mock', message: 'Mock mode active' };
        }
        
        try {
            const response = await apiClient.get('/business-plan/health');
            return {
                success: true,
                status: response.status || 'healthy',
                ...response
            };
        } catch (error) {
            return {
                success: false,
                status: 'unavailable',
                error: error.message
            };
        }
    },
    
    /**
     * 특정 분석 결과 조회
     * @param {string} analysisId
     */
    getAnalysisById: async (analysisId) => {
        if (config.USE_MOCK) {
            return getMockResponse();
        }
        return apiClient.get(`/business-plan/${analysisId}`);
    },
    
    /**
     * 조치 기록 저장
     * @param {object} data - { analysisId, actionTaken, status }
     */
    saveActionRecord: async (data) => {
        if (config.USE_MOCK) {
            return { success: true, id: `action-${Date.now()}` };
        }
        return apiClient.post('/business-plan/action-records', data);
    }
};

export default gemsApi;

