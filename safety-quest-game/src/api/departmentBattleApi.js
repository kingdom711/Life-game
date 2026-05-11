import apiClient from './apiClient';

/**
 * 부서 대항전 API
 * GET /api/v1/teams/battle → 이번 달 부서 점수/순위
 */
const departmentBattleApi = {
    getBattle: () => apiClient.get('/teams/battle')
};

export default departmentBattleApi;
