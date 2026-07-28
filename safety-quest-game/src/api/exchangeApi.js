/**
 * 포인트-골드 교환 관련 API
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const exchangeApi = {
    /**
     * 포인트를 골드로 교환
     * @param {number} pointsAmount - 교환할 포인트 금액 (1000P 단위)
     */
    exchangePointsToGold: async (pointsAmount) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('exchange_points_to_gold', { p_points_amount: pointsAmount });
            if (error) throw error;
            return data;
        }
        return apiClient.post('/exchange/points-to-gold', { pointsAmount });
    },

    /**
     * 교환 비율 조회
     */
    getExchangeRate: async () => {
        if (authApi.usesSupabase) return { pointsPerGold: 1000, minimumPoints: 1000 };
        return apiClient.get('/exchange/rate');
    }
};

export default exchangeApi;
