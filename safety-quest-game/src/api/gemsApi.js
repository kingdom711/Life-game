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

// Mock 응답 데이터 (서버 미가동 시 폴백용)
// 고용노동부 고시 제2023-19호 위험성평가 양식 + 실제 KOSHA Guide 코드 준수.
const MOCK_RESPONSES = [
    {
        riskFactor: '[Mock] 2m 이상 개구부 안전난간 미설치',
        riskLevel: 'HIGH',
        hazardClassification: '작업특성',
        unsafeCondition: '2m 이상 개구부에 안전난간/덮개 미설치',
        unsafeAct: null,
        possibleAccident: '추락',
        severity: { score: 4, rationale: '2m 이상 추락은 사망 가능' },
        likelihood: { score: 3, rationale: '다수 작업자가 근접' },
        riskScore: 12,
        legalBasis: [
            { law: '산업안전보건기준에 관한 규칙', article: '제42조', content: '추락의 방지 — 2m 이상 작업장소 안전난간 등 설치' },
            { law: '산업안전보건기준에 관한 규칙', article: '제43조', content: '개구부 등의 방호 조치' }
        ],
        koshaGuide: 'G-99-2012',
        referenceCode: 'G-99-2012',
        controlMeasures: {
            immediate: ['해당 구역 출입 통제', '경고 표지 부착'],
            engineering: ['안전난간 1.0m 이상 설치', '개구부 덮개 설치'],
            administrative: ['작업허가서 발급', 'TBM에서 개구부 위치 공유'],
            ppe: ['안전대 생명줄 체결']
        },
        responsibleRole: '현장소장',
        dueDays: 1,
        confidence: 0.9,
        remediationSteps: ['출입 통제', '안전난간 설치', '안전대 체결 후 작업']
    },
    {
        riskFactor: '[Mock] 용접 작업 반경 내 가연물 방치 + 화재감시자 미배치',
        riskLevel: 'CRITICAL',
        hazardClassification: '화학적',
        unsafeCondition: '용접 반경 5m 내 가연물 존재',
        unsafeAct: '화재감시자 없이 용접 중',
        possibleAccident: '화재',
        severity: { score: 4, rationale: '화재 확산 시 인명/설비 피해 중대' },
        likelihood: { score: 4, rationale: '착화원 상시 존재' },
        riskScore: 16,
        legalBasis: [
            { law: '산업안전보건기준에 관한 규칙', article: '제241조', content: '화재위험작업 시의 준수사항' },
            { law: '산업안전보건기준에 관한 규칙', article: '제236조', content: '화재감시자 배치' }
        ],
        koshaGuide: 'M-58-2012',
        referenceCode: 'M-58-2012',
        controlMeasures: {
            immediate: ['용접 즉시 중단', '반경 10m 내 가연물 제거'],
            engineering: ['불꽃 비산 방지막', '소화기 2대 비치'],
            administrative: ['화기작업 허가서 발급', '화재감시자 배치'],
            ppe: ['용접면', '내열 장갑', '안전화']
        },
        responsibleRole: '안전관리자',
        dueDays: 1,
        confidence: 0.95,
        remediationSteps: ['용접 중단', '가연물 제거', '화재감시자 배치']
    },
    {
        riskFactor: '[Mock] 밀폐공간 산소농도 미확인 진입',
        riskLevel: 'CRITICAL',
        hazardClassification: '화학적',
        unsafeCondition: '환기설비 미가동, 농도 미측정',
        possibleAccident: '질식',
        severity: { score: 4, rationale: '질식은 수분 내 사망 가능' },
        likelihood: { score: 3, rationale: '보수적 추정' },
        riskScore: 12,
        legalBasis: [
            { law: '산업안전보건기준에 관한 규칙', article: '제619조', content: '밀폐공간 작업 프로그램의 수립·시행' },
            { law: '산업안전보건기준에 관한 규칙', article: '제622조', content: '산소·유해가스 농도 측정' }
        ],
        koshaGuide: 'H-80-2012',
        referenceCode: 'H-80-2012',
        controlMeasures: {
            immediate: ['밀폐공간 진입 즉시 금지'],
            engineering: ['환기설비 가동', '산소농도 측정 18% 이상 확인'],
            administrative: ['밀폐공간 작업허가서', '감시인 상주'],
            ppe: ['송기마스크 또는 공기호흡기']
        },
        responsibleRole: '안전관리자',
        dueDays: 1,
        confidence: 0.9,
        remediationSteps: ['진입 금지', '산소농도 측정', '환기 후 작업허가서 발급']
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
                ...mockResponse,
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
            const apiUrl = config.getApiUrl('/business-plan/generate');
            console.log('[GEMS API] Calling POST', apiUrl);
            console.log('[GEMS API] Config:', {
                API_BASE_URL: config.API_BASE_URL,
                USE_MOCK: config.USE_MOCK,
                API_VERSION: config.API_VERSION
            });
            
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
            // 백엔드에서 Gemini API를 호출하여 위험 분석 수행
            console.log('[GEMS API] Starting API call...');
            const response = await apiClient.post('/business-plan/generate', requestBody);
            
            console.log('[GEMS API] Raw Response:', response);
            console.log('[GEMS API] Response Type:', typeof response);
            console.log('[GEMS API] Response Keys:', response ? Object.keys(response) : 'null');
            
            // 백엔드 응답 형식 처리
            // 경우 1: { success: true, data: { riskFactor, ... } } -> apiClient가 data만 반환
            // 경우 2: { success: true, riskFactor, ... } -> apiClient가 전체 반환
            // 경우 3: { riskFactor, ... } -> 직접 반환
            
            let responseData = response;
            
            // response가 { success: true, data: {...} } 형식이면 data 추출
            if (response && typeof response === 'object') {
                // apiClient.post는 이미 data 필드를 추출했을 수 있음
                // 하지만 백엔드가 { success: true, data: {...} } 형식이면
                // apiClient는 data만 반환하므로 response가 이미 data임
                
                // 만약 response에 success 필드가 있고 data 필드도 있으면
                if (response.success !== undefined && response.data) {
                    responseData = response.data;
                }
                // response에 success 필드만 있고 data 필드가 없으면 (직접 응답 형식)
                else if (response.success !== undefined && !response.data) {
                    // response 자체가 데이터 (success 필드 제외)
                    const { success, ...data } = response;
                    responseData = data;
                }
                // response에 success 필드가 없으면 (이미 data만 추출된 경우)
                else {
                    responseData = response;
                }
            }
            
            console.log('[GEMS API] Extracted Response Data:', responseData);
            
            // 응답 데이터 정규화
            // 백엔드에서 반환하는 형식: { riskFactor, remediationSteps, referenceCode, riskLevel, ... }
            const normalizedResponse = {
                success: true,
                riskFactor: responseData.riskFactor || responseData.risk_factor || '위험 요인 분석 완료',
                remediationSteps: Array.isArray(responseData.remediationSteps)
                    ? responseData.remediationSteps
                    : Array.isArray(responseData.remediation_steps)
                        ? responseData.remediation_steps
                        : [],
                referenceCode: responseData.referenceCode || responseData.reference_code || null,
                riskLevel: responseData.riskLevel || responseData.risk_level || 'MEDIUM',
                actionRecordId: responseData.actionRecordId || responseData.action_record_id || null,
                analysisId: responseData.analysisId || responseData.analysis_id || `analysis-${Date.now()}`,
                analyzedAt: responseData.analyzedAt || responseData.analyzed_at || new Date().toISOString(),
                // 확장 위험성평가 필드 (고용노동부 고시 제2023-19호)
                hazardClassification: responseData.hazardClassification || null,
                unsafeCondition: responseData.unsafeCondition || null,
                unsafeAct: responseData.unsafeAct || null,
                possibleAccident: responseData.possibleAccident || null,
                severity: responseData.severity || null,
                likelihood: responseData.likelihood || null,
                riskScore: responseData.riskScore ?? null,
                legalBasis: Array.isArray(responseData.legalBasis) ? responseData.legalBasis : [],
                koshaGuide: responseData.koshaGuide || null,
                controlMeasures: responseData.controlMeasures || null,
                responsibleRole: responseData.responsibleRole || null,
                dueDays: responseData.dueDays ?? null,
                confidence: responseData.confidence ?? null,
                // Gemini API 사용량 정보 (백엔드에서 제공하는 경우)
                usage: responseData.usage || null,
                rawResponse: response // 원본 응답 보관 (디버깅용)
            };
            
            console.log('[GEMS API] Normalized Response:', normalizedResponse);
            console.log('[GEMS API] Input Text Used:', requestBody.inputText);
            
            return normalizedResponse;
            
        } catch (error) {
            console.error('[GEMS API] ⚠️ API 호출 실패:', error);
            console.error('[GEMS API] Error details:', {
                message: error.message,
                status: error.status,
                data: error.data,
                name: error.name,
                isApiError: error instanceof ApiError,
                errorType: error.constructor.name
            });
            
            // 백엔드 서버 연결 실패 감지
            const isConnectionError = 
                error.status === 0 || 
                error.message?.includes('서버에 연결할 수 없습니다') ||
                error.message?.includes('Failed to fetch') ||
                error.message?.includes('NetworkError') ||
                error.message?.includes('ERR_CONNECTION_REFUSED');
            
            if (isConnectionError) {
                console.warn('[GEMS API] 🔄 백엔드 서버 연결 실패 감지. Mock 응답으로 전환합니다.');
                console.warn('[GEMS API] 백엔드 서버가 실행 중인지 확인하세요: http://localhost:8080');
            }
            
            // 서버 연결 실패 시 Mock으로 폴백 (status 0 또는 500 이상)
            if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) {
                console.warn('[GEMS API] Falling back to Mock Response due to server error:', {
                    status: error.status,
                    message: error.message,
                    apiUrl: config.getApiUrl('/business-plan/generate')
                });
                const mockResult = await getMockResponse();
                return {
                    ...mockResult,
                    fallback: true,
                    fallbackReason: error.message || '서버 연결 실패'
                };
            }
            
            // 네트워크 에러도 폴백 처리 (ApiError로 변환된 경우도 포함)
            if (error instanceof ApiError && (
                error.status === 0 || 
                error.message?.includes('서버에 연결할 수 없습니다') ||
                error.message?.includes('Failed to fetch') ||
                error.message?.includes('NetworkError')
            )) {
                console.warn('[GEMS API] Falling back to Mock Response due to network/server error:', {
                    status: error.status,
                    message: error.message
                });
                const mockResult = await getMockResponse();
                return {
                    ...mockResult,
                    fallback: true,
                    fallbackReason: '네트워크/서버 연결 실패: ' + (error.message || '알 수 없는 오류')
                };
            }
            
            // 네트워크 에러 (ApiError가 아닌 경우)
            if (!(error instanceof ApiError) && (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError'))) {
                console.warn('[GEMS API] Falling back to Mock Response due to network error:', {
                    message: error.message
                });
                const mockResult = await getMockResponse();
                return {
                    ...mockResult,
                    fallback: true,
                    fallbackReason: '네트워크 연결 실패: ' + (error.message || '알 수 없는 오류')
                };
            }
            
            // 400, 401, 403 등 클라이언트 에러는 그대로 throw
            if (error instanceof ApiError) {
                console.error('[GEMS API] Client error (not falling back):', {
                    status: error.status,
                    message: error.message,
                    data: error.data
                });
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

