/**
 * 인벤토리 관련 API
 */

import apiClient from './apiClient';

const inventoryApi = {
    /**
     * 인벤토리 전체 조회
     */
    getInventory: async () => {
        return apiClient.get('/inventory');
    },
    
    /**
     * 카테고리별 인벤토리 조회
     * @param {string} category - helmet, vest, shoes, etc.
     */
    getByCategory: async (category) => {
        return apiClient.get(`/inventory?category=${category}`);
    },
    
    /**
     * 아이템 획득
     * @param {string} itemId
     */
    addItem: async (itemId) => {
        return apiClient.post('/inventory/add', { itemId });
    },
    
    /**
     * 아이템 장착
     * @param {string} itemId
     */
    equipItem: async (itemId) => {
        return apiClient.post(`/inventory/${itemId}/equip`);
    },
    
    /**
     * 아이템 해제
     * @param {string} itemId
     */
    unequipItem: async (itemId) => {
        return apiClient.post(`/inventory/${itemId}/unequip`);
    },
    
    /**
     * 장착된 아이템 목록 조회
     */
    getEquippedItems: async () => {
        return apiClient.get('/inventory/equipped');
    },
    
    /**
     * 아이템 강화
     * @param {string} itemId
     */
    enhanceItem: async (itemId) => {
        return apiClient.post(`/inventory/${itemId}/enhance`);
    },
    
    /**
     * 아이템 판매
     * @param {string} itemId
     */
    sellItem: async (itemId) => {
        return apiClient.post(`/inventory/${itemId}/sell`);
    }
};

export default inventoryApi;

