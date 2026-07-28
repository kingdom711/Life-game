/**
 * 상점 관련 API
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const shopApi = {
    /**
     * 상점 아이템 목록 조회
     */
    getItems: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('shop_items')
                .select('*')
                .order('category')
                .order('price');
            if (error) throw error;
            return data;
        }
        return apiClient.get('/shop/items');
    },
    
    /**
     * 카테고리별 상점 아이템 조회
     * @param {string} category
     */
    getItemsByCategory: async (category) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('shop_items')
                .select('*')
                .eq('category', category)
                .order('price');
            if (error) throw error;
            return data;
        }
        return apiClient.get(`/shop/items?category=${category}`);
    },
    
    /**
     * 아이템 상세 조회
     * @param {string} itemId
     */
    getItemDetail: async (itemId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('shop_items')
                .select('*')
                .eq('id', itemId)
                .single();
            if (error) throw error;
            return data;
        }
        return apiClient.get(`/shop/items/${itemId}`);
    },
    
    /**
     * 아이템 구매
     * @param {string} itemId
     */
    purchaseItem: async (itemId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .rpc('purchase_shop_item', { p_item_id: itemId });
            if (error) throw error;
            return Array.isArray(data) ? data[0] : data;
        }
        return apiClient.post(`/shop/items/${itemId}/purchase`);
    },
    
    /**
     * 구매 가능 여부 확인
     * @param {string} itemId
     */
    canPurchase: async (itemId) => {
        if (authApi.usesSupabase) {
            const client = requireSupabase();
            const [{ data: pointData, error: pointError }, { data: inventoryData, error: inventoryError }, { data: itemData, error: itemError }] = await Promise.all([
                client.from('user_points').select('balance').single(),
                client.from('user_inventory_items').select('item_id').eq('item_id', itemId).maybeSingle(),
                client.from('shop_items').select('price').eq('id', itemId).single(),
            ]);
            if (pointError || inventoryError || itemError) throw pointError || inventoryError || itemError;
            return { canPurchase: !inventoryData && pointData.balance >= itemData.price };
        }
        return apiClient.get(`/shop/items/${itemId}/can-purchase`);
    }
};

export default shopApi;

