import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const encode = (value) => encodeURIComponent(value ?? '');

const teamApi = {
    searchTeams: ({ siteName, q = '' }) => {
        if (authApi.usesSupabase) {
            let query = requireSupabase().from('teams').select('*').eq('site_name', siteName).order('name');
            if (q) query = query.ilike('name', `%${q}%`);
            return query.then(({ data, error }) => { if (error) throw error; return data; });
        }
        const params = `siteName=${encode(siteName)}&q=${encode(q)}`;
        return apiClient.get(`/teams?${params}`);
    },

    createTeam: async ({ name, siteName }) => {
        if (!authApi.usesSupabase) return apiClient.post('/teams', { name, siteName });
        const { data, error } = await requireSupabase().rpc('create_team', {
            p_name: name.trim(), p_site_name: siteName.trim()
        });
        if (error) throw error;
        return { id: data, name: name.trim(), siteName: siteName.trim(), leader: true };
    },

    getMyMembership: async () => {
        if (!authApi.usesSupabase) return apiClient.get('/teams/me/membership');
        const client = requireSupabase();
        const { data: { user }, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        if (!user) return null;
        const { data, error } = await client
            .from('team_memberships')
            .select('*, teams(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    joinTeam: (teamId) => {
        if (authApi.usesSupabase) return requireSupabase().rpc('join_team', { p_team_id: teamId }).then(({ error }) => { if (error) throw error; return { success: true }; });
        return apiClient.post(`/teams/${teamId}/join`, {});
    },

    listPendingMembers: (teamId) => {
        if (authApi.usesSupabase) return requireSupabase().from('team_memberships').select('*').eq('team_id', teamId).eq('status', 'PENDING').then(({ data, error }) => { if (error) throw error; return data; });
        return apiClient.get(`/teams/${teamId}/pending`);
    },

    listTeamMembers: (teamId) => {
        if (authApi.usesSupabase) return requireSupabase().from('team_memberships').select('*').eq('team_id', teamId).eq('status', 'APPROVED').then(({ data, error }) => { if (error) throw error; return data; });
        return apiClient.get(`/teams/${teamId}/members`);
    },

    approveMember: (teamId, userId) => {
        if (authApi.usesSupabase) return requireSupabase().rpc('review_team_member', { p_team_id: teamId, p_user_id: userId, p_approve: true }).then(({ error }) => { if (error) throw error; return { success: true }; });
        return apiClient.post(`/teams/${teamId}/members/${userId}/approve`, {});
    },

    rejectMember: (teamId, userId) => {
        if (authApi.usesSupabase) return requireSupabase().rpc('review_team_member', { p_team_id: teamId, p_user_id: userId, p_approve: false }).then(({ error }) => { if (error) throw error; return { success: true }; });
        return apiClient.post(`/teams/${teamId}/members/${userId}/reject`, {});
    },

    leaveTeam: (teamId) => {
        if (authApi.usesSupabase) return requireSupabase().rpc('leave_team', { p_team_id: teamId }).then(({ error }) => { if (error) throw error; return { success: true }; });
        return apiClient.post(`/teams/${teamId}/leave`, {});
    },

    kickMember: (teamId, userId) => {
        if (authApi.usesSupabase) return requireSupabase().rpc('kick_team_member', { p_team_id: teamId, p_user_id: userId }).then(({ error }) => { if (error) throw error; return { success: true }; });
        return apiClient.delete(`/teams/${teamId}/members/${userId}`);
    }
};

export default teamApi;
