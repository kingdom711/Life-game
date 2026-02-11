/**
 * 골드 관련 API
 */

import apiClient from './apiClient';

const goldApi = {
    /**
     * 골드 잔액 조회
     */
    getBalance: async () => {
        return apiClient.get('/gold/balance');
    },

    /**
     * 골드 거래 내역 조회
     * @param {number} page - 페이지 번호 (0부터 시작)
     * @param {number} size - 페이지 크기
     */
    getHistory: async (page = 0, size = 20) => {
        return apiClient.get(`/gold/history?page=${page}&size=${size}`);
    }
};

export default goldApi;
