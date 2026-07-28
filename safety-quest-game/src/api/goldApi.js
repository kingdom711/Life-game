/**
 * 골드 관련 API
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const goldApi = {
    /**
     * 골드 잔액 조회
     */
    getBalance: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('user_gold').select('balance, total_earned, total_spent').single();
            if (error) throw error;
            return data;
        }
        return apiClient.get('/gold/balance');
    },

    /**
     * 골드 거래 내역 조회
     * @param {number} page - 페이지 번호 (0부터 시작)
     * @param {number} size - 페이지 크기
     */
    getHistory: async (page = 0, size = 20) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('gold_transactions').select('*').order('created_at', { ascending: false }).range(page * size, page * size + size - 1);
            if (error) throw error;
            return data;
        }
        return apiClient.get(`/gold/history?page=${page}&size=${size}`);
    }
};

export default goldApi;
