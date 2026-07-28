/**
 * 게임 프로필 관련 API
 * 레벨, 경험치, 게임 역할, 전직, 크로스 디바이스 동기화
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const toGameProfile = (row) => ({
    level: row.level,
    exp: row.exp,
    expToNext: row.exp_to_next,
    gameRole: row.game_role,
    activeSpecialization: row.active_specialization,
    totalQuestsCompleted: row.total_quests_completed,
});

const gameProfileApi = {
    /**
     * ⭐ 전체 게임 데이터 일괄 조회 (크로스 디바이스 동기화용)
     * 로그인 시 호출하여 서버의 전체 게임 데이터를 가져옵니다.
     * @returns {Promise<{profile, specializations, points, streak} | null>}
     */
    fetchFullGameData: async () => {
        if (authApi.usesSupabase) {
            const supabase = requireSupabase();
            const [profileResult, pointsResult, streakResult] = await Promise.all([
                supabase.from('user_game_profiles').select('*').single(),
                supabase.from('user_points').select('*').single(),
                supabase.from('user_streaks').select('*').single(),
            ]);
            const error = profileResult.error || pointsResult.error || streakResult.error;
            if (error) throw error;
            return {
                profile: toGameProfile(profileResult.data),
                points: pointsResult.data,
                streak: streakResult.data,
                specializations: [],
            };
        }
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
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('user_game_profiles')
                .select('*')
                .single();
            if (error) throw error;
            return toGameProfile(data);
        }
        return apiClient.get('/game-profile/me');
    },

    /**
     * 게임 프로필 업데이트
     * @param {object} data - { gameRole, activeSpecialization }
     */
    updateProfile: async (data) => {
        if (authApi.usesSupabase) {
            if (Object.prototype.hasOwnProperty.call(data, 'activeSpecialization')) {
                throw new Error('전직 선택은 전직 데이터 이관 후에 사용할 수 있습니다.');
            }
            if (!Object.prototype.hasOwnProperty.call(data, 'gameRole')) {
                return gameProfileApi.getProfile();
            }
            const { data: result, error } = await requireSupabase()
                .rpc('set_my_game_role', { p_game_role: data.gameRole ?? null });
            if (error) throw error;
            return toGameProfile(result);
        }
        return apiClient.put('/game-profile/me', data);
    },

    /**
     * 경험치 추가
     * @param {number} amount - 추가할 경험치
     * @param {string} source - 경험치 획득 출처
     */
    addExp: async (amount, source = '') => {
        if (authApi.usesSupabase) {
            throw new Error('경험치 적립은 서버 검증 퀘스트 이관 후에만 가능합니다.');
        }
        return apiClient.post('/game-profile/me/exp', { amount, source });
    },

    /**
     * 게임 역할 설정
     * @param {string} role - technician, supervisor, safety_manager
     */
    setGameRole: async (role) => {
        if (authApi.usesSupabase) {
            return gameProfileApi.updateProfile({ gameRole: role });
        }
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
    },

    /**
     * ⭐ 게임 상태 스냅샷 조회 (정규화 안 된 durable 데이터 복원용)
     * @returns {Promise<{payload, clientUpdatedAt, version, applied} | null>}
     */
    fetchStateSnapshot: async () => {
        try {
            return await apiClient.get('/game-profile/me/state-snapshot');
        } catch (err) {
            console.warn('[GameProfile] 스냅샷 조회 실패:', err.message);
            return null;
        }
    },

    /**
     * ⭐ 게임 상태 스냅샷 저장 (durable 데이터 백업)
     * @param {{payload: string, clientUpdatedAt: number}} data
     */
    pushStateSnapshot: async (data) => {
        return apiClient.put('/game-profile/me/state-snapshot', data);
    }
};

export default gameProfileApi;
