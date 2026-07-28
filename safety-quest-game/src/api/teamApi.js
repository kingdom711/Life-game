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

    createTeam: ({ name, siteName }) => {
        if (authApi.usesSupabase) return requireSupabase().rpc('create_team', { p_name: name, p_site_name: siteName }).then(({ data, error }) => { if (error) throw error; return { id: data }; });
        return apiClient.post('/teams', { name, siteName });
    },

    getMyMembership: () => {
        if (authApi.usesSupabase) return requireSupabase().from('team_memberships').select('*, teams(*)').maybeSingle().then(({ data, error }) => { if (error) throw error; return data; });
        return apiClient.get('/teams/me/membership');
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
