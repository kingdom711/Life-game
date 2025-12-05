/**
 * GEMS-Safety Advisor AI 시뮬레이션 서비스
 * 실제 Google Gemini API 연동 전, 프론트엔드 MVP를 위한 모의 서비스입니다.
 */

import { gemsAnalysisLogs, actionRecords } from './storage';

// 모의 응답 데이터
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

export const geminiService = {
    /**
     * 위험 요인 분석 요청 (Simulated)
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

        // 2. AI 처리 지연 시뮬레이션 (3~5초)
        const delay = Math.floor(Math.random() * 2000) + 3000;

        return new Promise((resolve) => {
            setTimeout(() => {
                // 3. 랜덤 응답 선택 (또는 입력 텍스트 기반 간단 매칭)
                const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

                // 4. 조치 기록 초안 생성
                const actionRecord = actionRecords.add({
                    riskFactor: mockResponse.riskFactor,
                    remediationDraft: mockResponse.remediation.join('\n'),
                    isAiAssisted: true,
                    aiReferenceCode: mockResponse.referenceCode,
                    originalLogId: log.id,
                    status: 'draft'
                });

                // 5. 로그 업데이트 (성공)
                // 실제 구현에서는 update 메서드가 필요하지만 MVP에서는 생략하거나 추가 구현

                resolve({
                    success: true,
                    riskFactor: mockResponse.riskFactor,
                    remediationSteps: mockResponse.remediation,
                    referenceCode: mockResponse.referenceCode,
                    actionRecordId: actionRecord.id
                });
            }, delay);
        });
    }
};
