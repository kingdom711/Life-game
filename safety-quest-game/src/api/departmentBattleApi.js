import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const departmentBattleApi = {
    getBattle: async () => {
        if (!authApi.usesSupabase) return apiClient.get('/teams/battle');

        const client = requireSupabase();
        const [{ data: rankings, error: rankingsError }, { data: membership, error: membershipError }] = await Promise.all([
            client.rpc('get_team_rankings', { p_limit: 100 }),
            client.from('team_memberships').select('team_id').eq('status', 'APPROVED').limit(1).maybeSingle(),
        ]);
        if (rankingsError) throw rankingsError;
        if (membershipError) throw membershipError;
        const maxScore = Math.max(...(rankings || []).map((row) => Number(row.total_points) || 0), 1);
        const now = new Date();
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        return {
            myDeptId: membership?.team_id || null,
            remainingDays: daysUntilSunday,
            categories: { points: { label: 'Points', maxScore } },
            rewards: [],
            departments: (rankings || []).map((row) => ({
                id: row.team_id,
                rank: row.rank,
                name: row.team_name,
                memberCount: row.member_count,
                totalScore: row.total_points,
                rankChange: 0,
                scores: { points: row.total_points },
            })),
        };
    },
};

export default departmentBattleApi;
