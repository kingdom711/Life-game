/**
 * educationApi.js - 교육 수료 증거 기록 API
 *
 * 목적: 고용노동부 사후 점검 대비 교육 이수 증거를 서버에 저장
 *
 * 엔드포인트:
 *   POST /api/v1/education/checkpoint  - 영상 시청 체크포인트 (30초 간격)
 *   POST /api/v1/education/quiz-submit - 퀴즈 개별 답안 저장
 *   POST /api/v1/education/complete    - 교육 완료 최종 기록
 */

import apiClient from './apiClient';

const educationApi = {
    /**
     * 영상 시청 체크포인트 저장
     * 프론트엔드가 영상 재생 중 30초 간격으로 호출
     *
     * @param {Object} data
     * @param {string} data.educationId   - 교육 콘텐츠 ID (educationData.js 기준)
     * @param {number} data.checkpointSec - 현재 재생 위치(초)
     * @param {number} data.totalSec      - 영상 전체 길이(초)
     * @param {boolean} data.isPlaying    - 재생 중 여부
     * @param {boolean} data.tabVisible   - 탭 포커스(활성) 여부
     * @returns {{ logId, serverTime, checkpointSec }}
     */
    saveCheckpoint: async (data) => {
        return apiClient.post('/education/checkpoint', data);
    },

    /**
     * 퀴즈 개별 답안 저장
     * 퀴즈 완료 시 전체 답안 목록을 한 번에 전송
     *
     * @param {Object} data
     * @param {string} data.educationId    - 교육 콘텐츠 ID
     * @param {number} data.attemptNumber  - 시도 번호 (1, 2, 3...)
     * @param {Array}  data.answers        - 문항별 답안 배열
     * @param {string} data.answers[].questionId      - 문항 ID
     * @param {number} data.answers[].selectedOption  - 선택 보기 번호 (0-based)
     * @param {number} data.answers[].timeSpentSec    - 해당 문항 소요 시간(초)
     * @returns {{ savedCount, attemptNumber, savedAt }}
     */
    submitQuizAnswers: async (data) => {
        return apiClient.post('/education/quiz-submit', data);
    },

    /**
     * 교육 완료 최종 기록
     * 영상 시청 + 퀴즈를 모두 마친 후 호출
     * 서버에서 SHA-256 해시 체인을 생성하고 수료증 번호를 발급
     *
     * @param {Object} data
     * @param {string} data.educationId       - 교육 콘텐츠 ID
     * @param {string} data.educationTitle    - 교육 제목
     * @param {string} data.educationType     - 'GENERAL' | 'SPECIALIZATION'
     * @param {string} data.startedAt         - 교육 시작 시각 (ISO-8601)
     * @param {number} data.videoWatchSeconds - 실제 시청 시간(초)
     * @param {number} data.videoTotalSeconds - 영상 전체 길이(초)
     * @param {number} data.videoWatchRatio   - 시청 비율 (0.0 ~ 1.0)
     * @param {number} data.quizScore         - 퀴즈 점수 (0~100)
     * @param {boolean} data.quizPassed       - 퀴즈 합격 여부
     * @param {number} data.attemptCount      - 총 시도 횟수
     * @param {string} [data.deviceHash]      - 디바이스 핑거프린트 (선택)
     * @returns {{ completionId, certNumber, educationId, educationTitle,
     *             completedAt, quizScore, quizPassed, videoWatchRatio, integrityHash }}
     */
    complete: async (data) => {
        return apiClient.post('/education/complete', data);
    },
};

export default educationApi;
