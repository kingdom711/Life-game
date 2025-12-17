/**
 * 상점 관련 API
 */

import apiClient from './apiClient';

const shopApi = {
    /**
     * 상점 아이템 목록 조회
     */
    getItems: async () => {
        return apiClient.get('/shop/items');
    },
    
    /**
     * 카테고리별 상점 아이템 조회
     * @param {string} category
     */
    getItemsByCategory: async (category) => {
        return apiClient.get(`/shop/items?category=${category}`);
    },
    
    /**
     * 아이템 상세 조회
     * @param {string} itemId
     */
    getItemDetail: async (itemId) => {
        return apiClient.get(`/shop/items/${itemId}`);
    },
    
    /**
     * 아이템 구매
     * @param {string} itemId
     */
    purchaseItem: async (itemId) => {
        return apiClient.post(`/shop/items/${itemId}/purchase`);
    },
    
    /**
     * 구매 가능 여부 확인
     * @param {string} itemId
     */
    canPurchase: async (itemId) => {
        return apiClient.get(`/shop/items/${itemId}/can-purchase`);
    }
};

export default shopApi;

