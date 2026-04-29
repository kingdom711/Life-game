import apiClient from './apiClient';

const questApi = {
    getTeamQuests: async (period = 'all') => {
        return apiClient.get(`/quests/team/me?period=${period}`);
    },

    getTeamQuestSummary: async () => {
        return apiClient.get('/quests/team/me/summary');
    },

    claimTeamQuestReward: async (questId) => {
        return apiClient.post(`/quests/team/${questId}/claim`);
    }
};

export default questApi;
