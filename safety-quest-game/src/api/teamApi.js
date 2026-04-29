import apiClient from './apiClient';

const encode = (value) => encodeURIComponent(value ?? '');

const teamApi = {
    searchTeams: ({ siteName, q = '' }) => {
        const params = `siteName=${encode(siteName)}&q=${encode(q)}`;
        return apiClient.get(`/teams?${params}`);
    },

    createTeam: ({ name, siteName }) => {
        return apiClient.post('/teams', { name, siteName });
    },

    getMyMembership: () => {
        return apiClient.get('/teams/me/membership');
    },

    joinTeam: (teamId) => {
        return apiClient.post(`/teams/${teamId}/join`, {});
    },

    listPendingMembers: (teamId) => {
        return apiClient.get(`/teams/${teamId}/pending`);
    },

    listTeamMembers: (teamId) => {
        return apiClient.get(`/teams/${teamId}/members`);
    },

    approveMember: (teamId, userId) => {
        return apiClient.post(`/teams/${teamId}/members/${userId}/approve`, {});
    },

    rejectMember: (teamId, userId) => {
        return apiClient.post(`/teams/${teamId}/members/${userId}/reject`, {});
    },

    leaveTeam: (teamId) => {
        return apiClient.post(`/teams/${teamId}/leave`, {});
    },

    kickMember: (teamId, userId) => {
        return apiClient.delete(`/teams/${teamId}/members/${userId}`);
    }
};

export default teamApi;
