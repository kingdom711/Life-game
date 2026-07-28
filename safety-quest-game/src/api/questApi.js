import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const questApi = {
    getPersonalQuests: async (period = 'all') => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('get_my_personal_quests', { p_period: period });
            if (error) throw error;
            return data || [];
        }
        return [];
    },

    claimPersonalQuestReward: async (questId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('claim_personal_quest_reward', { p_quest_id: questId });
            if (error) throw error;
            return data;
        }
        throw new Error('Personal quest rewards require the server ledger.');
    },

    getTeamQuests: async (period = 'all') => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('get_my_team_quests', { p_period: period });
            if (error) throw error;
            return data || [];
        }
        return apiClient.get(`/quests/team/me?period=${period}`);
    },

    getTeamQuestSummary: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('get_my_team_quest_summary');
            if (error) throw error;
            return data || { weeklyProgress: 0, completedQuests: 0, totalQuests: 0 };
        }
        return apiClient.get('/quests/team/me/summary');
    },

    claimTeamQuestReward: async (questId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('claim_team_quest_reward', { p_quest_id: questId });
            if (error) throw error;
            return data;
        }
        return apiClient.post(`/quests/team/${questId}/claim`);
    },

    checkIn: async () => {
        if (!authApi.usesSupabase) {
            return apiClient.post('/quests/attendance/check-in', {});
        }

        const { data, error } = await requireSupabase().rpc('attendance_check_in');
        if (error) throw error;
        return data?.[0];
    }
};

export default questApi;
