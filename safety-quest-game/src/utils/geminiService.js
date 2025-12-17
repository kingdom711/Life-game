/**
 * GEMS-Safety Advisor AI 서비스
 * 새로운 API 구조를 사용하는 래퍼
 * 
 * 기존 코드와의 호환성을 위해 유지됩니다.
 * 새 코드에서는 src/api/gemsApi.js를 직접 사용하세요.
 */

import { gemsApi } from '../api';
import { gemsAnalysisLogs, actionRecords } from './storage';

export const geminiService = {
    /**
     * 위험 요인 분석 요청
     * @param {string} text - 위험 상황 설명
     * @param {string} photoId - (Optional) 사진 ID
     * @param {object} context - 현장 컨텍스트 (작업유형 등)
     * @returns {Promise<object>} 분석 결과
     */
    analyzeRisk: async (text, photoId = null, context = {}) => {
        // 1. 로컬 분석 시작 로그 기록
        const log = gemsAnalysisLogs.add({
            inputType: photoId ? 'PHOTO' : 'TEXT',
            inputData: text,
            status: 'PENDING'
        });

        try {
            // 2. 새로운 API 호출
            const result = await gemsApi.analyzeRisk({
                inputText: text,
                photoId: photoId,
                context: context
            });

            // 3. 로컬 조치 기록 초안 생성
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
            console.error('[GeminiService] Error:', error);
            throw error;
        }
    }
};

// 기본 export
export default geminiService;
