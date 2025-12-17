/**
 * GEMS-Safety Advisor AI 서비스
 * 백엔드 API 연동 버전
 */

import { gemsAnalysisLogs, actionRecords } from './storage';

// 백엔드 API 기본 URL
const API_BASE_URL = 'http://localhost:8080';

// Mock 모드 설정 (백엔드 서버가 없을 때 true로 설정)
const USE_MOCK = false;

// 모의 응답 데이터 (백엔드 서버 미연결 시 폴백용)
const MOCK_RESPONSES = [
    {
        riskFactor: '고소 작업 중 안전대 미체결',
        remediation: [
            '즉시 작업을 중단하고 안전한 장소로 이동하십시오.',
            '안전대 및 부속품의 상태를 점검하십시오.',
            '안전대 체결 후 2인 1조로 작업을 재개하십시오.'
        ],
        referenceCode: 'KOSHA-G-2023-01'
    },
    {
        riskFactor: '가연성 물질 주변 화기 작업',
        remediation: [
            '반경 10m 이내 가연성 물질을 제거하거나 방염포로 덮으십시오.',
            '소화기를 작업 장소 바로 옆에 비치하십시오.',
            '화기 감시자를 배치하고 작업을 진행하십시오.'
        ],
        referenceCode: 'KOSHA-M-2023-05'
    },
    {
        riskFactor: '개인보호구(안전모) 미착용',
        remediation: [
            '작업자에게 즉시 안전모 착용을 지시하십시오.',
            '안전모의 턱끈 체결 상태를 확인하십시오.',
            '개인보호구 착용 교육을 실시하십시오.'
        ],
        referenceCode: 'KOSHA-P-2023-12'
    }
];

/**
 * Mock 응답 생성 (폴백용)
 */
const getMockResponse = () => {
    return new Promise((resolve) => {
        const delay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
            const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
            resolve({
                success: true,
                riskFactor: mockResponse.riskFactor,
                remediationSteps: mockResponse.remediation,
                referenceCode: mockResponse.referenceCode,
                riskLevel: 'HIGH',
                analysisId: `mock-${Date.now()}`
            });
        }, delay);
    });
};

export const geminiService = {
    /**
     * 위험 요인 분석 요청
     * @param {string} text - 위험 상황 설명
     * @param {string} photoId - (Optional) 사진 ID
     * @param {object} context - 현장 컨텍스트 (작업유형 등)
     * @returns {Promise<object>} 분석 결과
     */
    analyzeRisk: async (text, photoId = null, context = {}) => {
        // 1. 분석 시작 로그 기록
        const log = gemsAnalysisLogs.add({
            inputType: photoId ? 'PHOTO' : 'TEXT',
            inputData: text,
            status: 'PENDING'
        });

        // Mock 모드인 경우 Mock 응답 반환
        if (USE_MOCK) {
            console.log('[GEMS] Using Mock Response (USE_MOCK=true)');
            const mockResult = await getMockResponse();
            
            // 조치 기록 초안 생성
            const actionRecord = actionRecords.add({
                riskFactor: mockResult.riskFactor,
                remediationDraft: mockResult.remediationSteps.join('\n'),
                isAiAssisted: true,
                aiReferenceCode: mockResult.referenceCode,
                originalLogId: log.id,
                status: 'draft'
            });
            
            return {
                ...mockResult,
                actionRecordId: actionRecord.id
            };
        }

        // 실제 백엔드 API 호출
        try {
            console.log('[GEMS] Calling Backend API:', `${API_BASE_URL}/api/v1/business-plan/generate`);
            
            const response = await fetch(`${API_BASE_URL}/api/v1/business-plan/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 인증 토큰이 있는 경우 추가
                    // 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    inputType: photoId ? 'PHOTO' : 'TEXT',
                    inputText: text,
                    photoId: photoId,
                    context: context
                })
            });

            // 응답 상태 확인
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[GEMS] API Error Response:', response.status, errorText);
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
            }

            // 응답 데이터 파싱
            const data = await response.json();
            console.log('[GEMS] API Response:', data);

            // 백엔드 응답 형식에 따라 데이터 변환
            // 백엔드가 다른 형식으로 응답할 경우 여기서 매핑
            const result = {
                success: true,
                riskFactor: data.riskFactor || data.risk_factor || data.title || '위험 요인 분석 완료',
                remediationSteps: data.remediationSteps || data.remediation_steps || data.steps || data.actions || [],
                referenceCode: data.referenceCode || data.reference_code || data.code || 'KOSHA-AI-2024',
                riskLevel: data.riskLevel || data.risk_level || 'MEDIUM',
                analysisId: data.analysisId || data.analysis_id || data.id || `analysis-${Date.now()}`,
                // 원본 응답 데이터도 포함 (디버깅용)
                rawResponse: data
            };

            // 조치 기록 초안 생성
            const actionRecord = actionRecords.add({
                riskFactor: result.riskFactor,
                remediationDraft: Array.isArray(result.remediationSteps) 
                    ? result.remediationSteps.join('\n') 
                    : result.remediationSteps,
                isAiAssisted: true,
                aiReferenceCode: result.referenceCode,
                originalLogId: log.id,
                status: 'draft'
            });

            return {
                ...result,
                actionRecordId: actionRecord.id
            };

        } catch (error) {
            console.error('[GEMS] API Call Failed:', error);
            
            // 백엔드 연결 실패 시 Mock 응답으로 폴백
            console.warn('[GEMS] Falling back to Mock Response due to API error');
            
            const mockResult = await getMockResponse();
            
            // 조치 기록 초안 생성
            const actionRecord = actionRecords.add({
                riskFactor: mockResult.riskFactor,
                remediationDraft: mockResult.remediationSteps.join('\n'),
                isAiAssisted: true,
                aiReferenceCode: mockResult.referenceCode,
                originalLogId: log.id,
                status: 'draft'
            });
            
            return {
                ...mockResult,
                actionRecordId: actionRecord.id,
                fallback: true,
                error: error.message
            };
        }
    }
};
