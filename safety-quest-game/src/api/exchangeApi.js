/**
 * 포인트-골드 교환 관련 API
 */

import apiClient from './apiClient';

const exchangeApi = {
    /**
     * 포인트를 골드로 교환
     * @param {number} pointsAmount - 교환할 포인트 금액 (1000P 단위)
     */
    exchangePointsToGold: async (pointsAmount) => {
        return apiClient.post('/exchange/points-to-gold', { pointsAmount });
    },

    /**
     * 교환 비율 조회
     */
    getExchangeRate: async () => {
        return apiClient.get('/exchange/rate');
    }
};

export default exchangeApi;
