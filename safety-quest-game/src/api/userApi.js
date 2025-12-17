/**
 * 사용자 관련 API
 */

import apiClient from './apiClient';

const userApi = {
    /**
     * 현재 사용자 정보 조회
     */
    getMe: async () => {
        return apiClient.get('/users/me');
    },
    
    /**
     * 사용자 정보 업데이트
     * @param {object} data - { name, role, ... }
     */
    updateMe: async (data) => {
        return apiClient.put('/users/me', data);
    },
    
    /**
     * 사용자 프로필 조회 (by ID)
     * @param {string} userId
     */
    getUser: async (userId) => {
        return apiClient.get(`/users/${userId}`);
    },
    
    /**
     * 포인트 조회
     */
    getPoints: async () => {
        return apiClient.get('/users/me/points');
    },
    
    /**
     * 포인트 추가
     * @param {number} amount
     * @param {string} reason
     */
    addPoints: async (amount, reason = '') => {
        return apiClient.post('/users/me/points/add', { amount, reason });
    },
    
    /**
     * 레벨 정보 조회
     */
    getLevel: async () => {
        return apiClient.get('/users/me/level');
    },
    
    /**
     * 스트릭(연속 로그인) 정보 조회
     */
    getStreak: async () => {
        return apiClient.get('/users/me/streak');
    },
    
    /**
     * 역할 설정
     * @param {string} role - technician, supervisor, safety_manager
     */
    setRole: async (role) => {
        return apiClient.put('/users/me/role', { role });
    },
    
    /**
     * 랭킹 조회
     * @param {string} type - points, level, streak
     * @param {number} limit
     */
    getRankings: async (type = 'points', limit = 10) => {
        return apiClient.get(`/users/rankings?type=${type}&limit=${limit}`);
    }
};

export default userApi;

