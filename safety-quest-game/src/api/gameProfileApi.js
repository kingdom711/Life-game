/**
 * 게임 프로필 관련 API
 * 레벨, 경험치, 게임 역할, 전직, 크로스 디바이스 동기화
 */

import apiClient from './apiClient';

const gameProfileApi = {
    /**
     * ⭐ 전체 게임 데이터 일괄 조회 (크로스 디바이스 동기화용)
     * 로그인 시 호출하여 서버의 전체 게임 데이터를 가져옵니다.
     * @returns {Promise<{profile, specializations, points, streak} | null>}
     */
    fetchFullGameData: async () => {
        try {
            return await apiClient.get('/game-profile/me/full');
        } catch (err) {
            console.warn('[GameProfile] 전체 데이터 조회 실패 (신규 유저일 수 있음):', err.message);
            return null;
        }
    },

    /**
     * 게임 프로필 조회
     */
    getProfile: async () => {
        return apiClient.get('/game-profile/me');
    },

    /**
     * 게임 프로필 업데이트
     * @param {object} data - { gameRole, activeSpecialization }
     */
    updateProfile: async (data) => {
        return apiClient.put('/game-profile/me', data);
    },

    /**
     * 경험치 추가
     * @param {number} amount - 추가할 경험치
     * @param {string} source - 경험치 획득 출처
     */
    addExp: async (amount, source = '') => {
        return apiClient.post('/game-profile/me/exp', { amount, source });
    },

    /**
     * 게임 역할 설정
     * @param {string} role - technician, supervisor, safety_manager
     */
    setGameRole: async (role) => {
        return apiClient.put('/game-profile/me/role', { role });
    },

    /**
     * 해금된 전직 목록 조회
     */
    getSpecializations: async () => {
        return apiClient.get('/game-profile/me/specializations');
    },

    /**
     * 전직 해금
     * @param {string} specId - 전직 ID
     * @param {string} educationProgress - 교육 진행 데이터 (JSON string)
     */
    unlockSpecialization: async (specId, educationProgress = '') => {
        return apiClient.post('/game-profile/me/specializations', { specId, educationProgress });
    },

    /**
     * 활성 전직 변경
     * @param {string} specId - 전직 ID
     */
    setActiveSpecialization: async (specId) => {
        return apiClient.put('/game-profile/me/specializations/active', { specId });
    },

    /**
     * localStorage 데이터를 서버에 동기화 (마이그레이션)
     * @param {object} data - localStorage에서 수집한 전체 게임 데이터
     */
    syncLocalData: async (data) => {
        return apiClient.post('/game-profile/me/sync', data);
    }
};

export default gameProfileApi;
