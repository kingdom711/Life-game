/**
 * 사용자 관련 API
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const userApi = {
    /**
     * 현재 사용자 정보 조회
     */
    getMe: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('profiles')
                .select('id,username,name,contact_email,phone_number,role,status,created_at,updated_at')
                .single();
            if (error) throw error;
            return { ...data, email: data.contact_email };
        }
        return apiClient.get('/users/me');
    },
    
    /**
     * 사용자 정보 업데이트
     * @param {object} data - { name, role, ... }
     */
    updateMe: async (data) => {
        if (authApi.usesSupabase) {
            const allowed = ['username', 'name', 'contact_email', 'phone_number'];
            const update = Object.fromEntries(Object.entries(data || {}).filter(([key]) => allowed.includes(key)));
            if (!Object.keys(update).length) throw new Error('수정 가능한 프로필 정보가 없습니다.');
            const { data: updated, error } = await requireSupabase()
                .from('profiles')
                .update(update)
                .select('id,username,name,contact_email,phone_number,role,status,created_at,updated_at')
                .single();
            if (error) throw error;
            return { ...updated, email: updated.contact_email };
        }
        return apiClient.put('/users/me', data);
    },
    
    /**
     * 사용자 프로필 조회 (by ID)
     * @param {string} userId
     */
    getUser: async (userId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('profiles')
                .select('id,username,name,role,status,created_at')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data;
        }
        return apiClient.get(`/users/${userId}`);
    },
    
    /**
     * 포인트 조회
     */
    getPoints: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('user_points')
                .select('balance,total_earned,total_spent,updated_at')
                .single();
            if (error) throw error;
            return data;
        }
        return apiClient.get('/users/me/points');
    },
    
    /**
     * 포인트 추가
     * @param {number} amount
     * @param {string} reason
     * @param {string} description
     */
    addPoints: async (amount, reason = '', description = '') => {
        if (authApi.usesSupabase) {
            throw new Error('포인트 적립은 출석·교육·위험요소 조치 등 서버 검증된 활동을 통해서만 처리됩니다.');
        }
        return apiClient.post('/users/me/points/add', { amount, reason, description });
    },

    /**
     * 포인트 차감
     * @param {number} amount
     * @param {string} reason
     * @param {string} description
     */
    spendPoints: async (amount, reason = '', description = '') => {
        if (authApi.usesSupabase) {
            throw new Error('포인트 사용은 상점 구매와 환전 기능을 통해서만 처리됩니다.');
        }
        return apiClient.post('/users/me/points/spend', { amount, reason, description });
    },

    /**
     * 포인트 거래 내역 조회 (페이징)
     * @param {number} page
     * @param {number} size
     */
    getPointsHistory: async (page = 0, size = 20) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('point_transactions')
                .select('id,amount,transaction_type,reason,description,balance_after,created_at')
                .order('created_at', { ascending: false })
                .range(page * size, page * size + size - 1);
            if (error) throw error;
            return {
                content: (data || []).map((row) => ({
                    id: row.id,
                    amount: Math.abs(row.amount),
                    type: row.transaction_type,
                    reason: row.reason,
                    description: row.description,
                    balanceAfter: row.balance_after,
                    createdAt: row.created_at,
                })),
            };
        }
        return apiClient.get(`/users/me/points/history?page=${page}&size=${size}`);
    },

    /**
     * 활동 기록 조회 (페이징)
     * @param {number} page
     * @param {number} size
     */
    getActivities: async (page = 0, size = 20) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('point_transactions')
                .select('id,amount,transaction_type,reason,description,created_at')
                .order('created_at', { ascending: false })
                .range(page * size, page * size + size - 1);
            if (error) throw error;
            return (data || []).map((row) => ({
                id: row.id,
                type: row.transaction_type,
                title: row.reason,
                description: row.description,
                amount: Math.abs(row.amount),
                createdAt: row.created_at,
            }));
        }
        return apiClient.get(`/users/me/activities?page=${page}&size=${size}`);
    },
    
    /**
     * 레벨 정보 조회
     */
    getLevel: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('user_game_profiles')
                .select('level,exp,exp_to_next,game_role,active_specialization,total_quests_completed,updated_at')
                .single();
            if (error) throw error;
            return data;
        }
        return apiClient.get('/users/me/level');
    },
    
    /**
     * 스트릭(연속 로그인) 정보 조회
     */
    getStreak: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('user_streaks')
                .select('current_streak, longest_streak, last_check_in_date')
                .single();
            if (error) throw error;
            return {
                currentStreak: data.current_streak,
                longestStreak: data.longest_streak,
                lastCheckInDate: data.last_check_in_date,
            };
        }
        return apiClient.get('/users/me/streak');
    },
    
    /**
     * 역할 설정
     * @param {string} role - technician, supervisor, safety_manager
     */
    setRole: async (role) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('set_my_game_role', { p_game_role: role });
            if (error) throw error;
            return data;
        }
        return apiClient.put('/users/me/role', { role });
    },
    
    /**
     * 랭킹 조회
     * @param {string} type - points, level, streak
     * @param {number} limit
     * @param {object} options
     */
    getRankings: async (type = 'points', limit = 10, { period = 'all', role = '' } = {}) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('get_user_rankings', {
                p_type: type,
                p_limit: limit,
                p_period: period,
                p_role: role || null,
            });
            if (error) throw error;
            return (data || []).map((row) => ({
                rank: row.rank,
                userId: row.user_id,
                name: row.name,
                username: row.username,
                role: row.role,
                points: row.points,
                level: row.level,
                streak: row.streak,
            }));
        }
        let url = `/users/rankings?type=${type}&limit=${limit}&period=${period}`;
        if (role) url += `&role=${role}`;
        return apiClient.get(url);
    },

    /**
     * 내 랭킹 조회
     * @param {string} type - points, level, streak
     */
    getMyRank: async (type = 'points') => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('get_my_user_rank', {
                p_type: type,
                p_period: 'all',
            });
            if (error) throw error;
            return data;
        }
        return apiClient.get(`/users/me/rank?type=${type}`);
    },

    /**
     * 팀 랭킹 조회
     * @param {string} type - points, level, streak
     * @param {number} limit
     */
    getTeamRankings: async (type = 'points', limit = 10) => {
        if (authApi.usesSupabase) {
            if (type !== 'points') throw new Error('현재 팀 순위는 포인트 기준만 지원합니다.');
            const { data, error } = await requireSupabase().rpc('get_team_rankings', { p_limit: limit });
            if (error) throw error;
            return (data || []).map((row) => ({
                rank: row.rank,
                teamId: row.team_id,
                teamName: row.team_name,
                memberCount: row.member_count,
                totalPoints: row.total_points,
                avgPoints: row.avg_points,
                topMember: row.top_member,
                score: row.avg_points,
            }));
        }
        return apiClient.get(`/teams/rankings?type=${type}&limit=${limit}`);
    }
};

export default userApi;

