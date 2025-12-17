/**
 * 퀘스트 관련 API
 */

import apiClient from './apiClient';

const questApi = {
    /**
     * 일일 퀘스트 목록 조회
     * @param {string} role - 역할 필터
     */
    getDailyQuests: async (role = null) => {
        const params = role ? `?role=${role}` : '';
        return apiClient.get(`/quests/daily${params}`);
    },
    
    /**
     * 주간 퀘스트 목록 조회
     * @param {string} role - 역할 필터
     */
    getWeeklyQuests: async (role = null) => {
        const params = role ? `?role=${role}` : '';
        return apiClient.get(`/quests/weekly${params}`);
    },
    
    /**
     * 월간 퀘스트 목록 조회
     * @param {string} role - 역할 필터
     */
    getMonthlyQuests: async (role = null) => {
        const params = role ? `?role=${role}` : '';
        return apiClient.get(`/quests/monthly${params}`);
    },
    
    /**
     * 퀘스트 진행도 조회
     */
    getProgress: async () => {
        return apiClient.get('/quests/progress');
    },
    
    /**
     * 특정 퀘스트 진행도 조회
     * @param {string} questId
     */
    getQuestProgress: async (questId) => {
        return apiClient.get(`/quests/${questId}/progress`);
    },
    
    /**
     * 퀘스트 진행도 업데이트
     * @param {string} questId
     * @param {object} data - { currentCount, targetCount, ... }
     */
    updateProgress: async (questId, data) => {
        return apiClient.put(`/quests/${questId}/progress`, data);
    },
    
    /**
     * 퀘스트 완료 처리
     * @param {string} questId
     */
    completeQuest: async (questId) => {
        return apiClient.post(`/quests/${questId}/complete`);
    },
    
    /**
     * 출석 체크
     */
    checkIn: async () => {
        return apiClient.post('/quests/attendance/check-in');
    },
    
    /**
     * 출석 기록 조회
     * @param {number} days - 조회할 일수 (기본 30일)
     */
    getAttendanceHistory: async (days = 30) => {
        return apiClient.get(`/quests/attendance/history?days=${days}`);
    },
    
    /**
     * 위험 발굴 퀘스트 제출
     * @param {object} data - { photoUrl, identifiedHazards, ... }
     */
    submitHazardQuest: async (data) => {
        return apiClient.post('/quests/hazard/submit', data);
    },
    
    /**
     * 오늘의 위험 발굴 퀘스트 조회
     */
    getTodayHazardQuest: async () => {
        return apiClient.get('/quests/hazard/today');
    }
};

export default questApi;

