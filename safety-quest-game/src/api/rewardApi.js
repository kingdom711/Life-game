/**
 * 보상센터 관련 API
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const toReward = (row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    goldPrice: row.gold_price,
    cashValue: row.cash_value,
    imageUrl: row.image_url,
    type: row.reward_type,
    totalQuantity: row.total_quantity,
    remainingQuantity: row.remaining_quantity,
    active: row.is_active,
});

const toRedemption = (row) => {
    const reward = row.reward_items || {};
    const user = row.profiles || {};
    return {
        id: row.id,
        rewardId: row.reward_id,
        rewardName: row.rewardName || reward.name,
        rewardDescription: reward.description,
        rewardType: reward.reward_type,
        goldPaid: row.gold_paid,
        status: row.status,
        couponCode: row.coupon_code,
        rejectReason: row.reject_reason,
        processedAt: row.processed_at,
        deliveredAt: row.delivered_at,
        createdAt: row.created_at,
        requestedBy: user.username,
        requestedByName: user.name,
        userName: user.name,
        userEmail: user.contact_email,
    };
};

// --- Mock 교환 (default reward용 localStorage 영속화) ---
const MOCK_REWARDS_KEY = 'safety_quest_mock_rewards';
const MOCK_GOLD_SPENT_KEY = 'safety_quest_mock_gold_spent';

const mockRewardStore = {
    getAll: () => JSON.parse(localStorage.getItem(MOCK_REWARDS_KEY) || '[]'),
    add: (entry) => {
        const list = mockRewardStore.getAll();
        list.unshift(entry);
        localStorage.setItem(MOCK_REWARDS_KEY, JSON.stringify(list));
    },
    update: (id, fields) => {
        const list = mockRewardStore.getAll();
        const idx = list.findIndex(item => item.id === id);
        if (idx === -1) return false;
        list[idx] = { ...list[idx], ...fields };
        localStorage.setItem(MOCK_REWARDS_KEY, JSON.stringify(list));
        return true;
    },
    getTotalGoldSpent: () => parseInt(localStorage.getItem(MOCK_GOLD_SPENT_KEY) || '0', 10),
    addGoldSpent: (amount) => {
        const total = mockRewardStore.getTotalGoldSpent() + amount;
        localStorage.setItem(MOCK_GOLD_SPENT_KEY, String(total));
    },
    refundGold: (amount) => {
        const total = Math.max(0, mockRewardStore.getTotalGoldSpent() - amount);
        localStorage.setItem(MOCK_GOLD_SPENT_KEY, String(total));
    }
};

// --- 본인인증 Mock (localStorage 기반) ---
const VERIFICATION_STORAGE_KEY = 'safety_quest_identity_verified';
const VERIFICATION_CODE_KEY = 'safety_quest_verify_code';

const mockVerification = {
    isVerified: () => localStorage.getItem(VERIFICATION_STORAGE_KEY) === 'true',

    generateCode: (phoneNumber) => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        localStorage.setItem(VERIFICATION_CODE_KEY, JSON.stringify({ phoneNumber, code, expires: Date.now() + 3 * 60 * 1000 }));
        console.log(`[모의 본인인증] 인증번호: ${code} (${phoneNumber})`);
        return code;
    },

    verifyCode: (phoneNumber, inputCode) => {
        const stored = JSON.parse(localStorage.getItem(VERIFICATION_CODE_KEY) || 'null');
        if (!stored) return { success: false, message: '인증번호를 먼저 요청해주세요.' };
        if (stored.expires < Date.now()) return { success: false, message: '인증번호가 만료되었습니다. 다시 요청해주세요.' };
        if (stored.phoneNumber !== phoneNumber) return { success: false, message: '전화번호가 일치하지 않습니다.' };
        if (stored.code !== inputCode) return { success: false, message: '인증번호가 올바르지 않습니다.' };
        localStorage.setItem(VERIFICATION_STORAGE_KEY, 'true');
        localStorage.removeItem(VERIFICATION_CODE_KEY);
        return { success: true };
    }
};

const rewardApi = {
    /**
     * 활성화된 보상 목록 조회
     */
    getRewards: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('reward_items')
                .select('id,name,description,gold_price,cash_value,image_url,reward_type,total_quantity,remaining_quantity,is_active')
                .eq('is_active', true)
                .order('gold_price');
            if (error) throw error;
            return (data || []).map(toReward);
        }
        return apiClient.get('/rewards');
    },

    /**
     * 보상 교환 (골드 → 쿠폰)
     * @param {number} rewardId - 보상 ID
     */
    exchangeReward: async (rewardId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('redeem_reward', { p_reward_id: rewardId });
            if (error) throw error;
            return toRedemption(data);
        }
        return apiClient.post(`/rewards/${rewardId}/exchange`);
    },

    /**
     * 내 보상 교환 내역 조회 (백엔드 내역 + mock 내역 병합)
     */
    getMyRewards: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('reward_redemptions')
                .select('id,reward_id,gold_paid,status,coupon_code,reject_reason,processed_at,delivered_at,created_at,reward_items(name,description,reward_type)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(toRedemption);
        }
        let serverRewards = [];
        try {
            const data = await apiClient.get('/rewards/my-rewards');
            serverRewards = Array.isArray(data) ? data : [];
        } catch { /* 백엔드 실패 시 무시 */ }
        const mockRewards = mockRewardStore.getAll();
        return [...mockRewards, ...serverRewards];
    },

    /**
     * mock 교환 내역 저장 + 골드 차감 기록 (default reward 교환 시 사용)
     * @param {object} reward - 보상 정보
     * @param {object} userInfo - 요청자 정보 { username, name }
     */
    addMockExchange: (reward, userInfo = {}) => {
        mockRewardStore.add({
            id: `mock-${Date.now()}`,
            rewardName: reward.name,
            goldPaid: reward.goldPrice,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            requestedBy: userInfo.username || '알 수 없음',
            requestedByName: userInfo.name || userInfo.username || '알 수 없음'
        });
        mockRewardStore.addGoldSpent(reward.goldPrice);
    },

    /**
     * mock 교환으로 사용한 총 골드량 조회
     */
    getMockGoldSpent: () => mockRewardStore.getTotalGoldSpent(),

    // 본인 인증 (localStorage mock — 백엔드 구현 완료 시 API 호출로 교체)
    checkVerificationStatus: async () => {
        if (authApi.usesSupabase) return { isVerified: false, unavailable: true };
        return { isVerified: mockVerification.isVerified() };
    },

    requestVerification: async (phoneNumber) => {
        if (authApi.usesSupabase) throw new Error('본인 인증 SMS 연동은 아직 구성되지 않았습니다. 관리자에게 문의해 주세요.');
        mockVerification.generateCode(phoneNumber);
        return { success: true };
    },

    confirmVerification: async (phoneNumber, code) => {
        if (authApi.usesSupabase) throw new Error('본인 인증 SMS 연동은 아직 구성되지 않았습니다. 관리자에게 문의해 주세요.');
        const result = mockVerification.verifyCode(phoneNumber, code);
        if (!result.success) throw new Error(result.message);
        return { success: true };
    },

    // ── 관리자 전용 (admin 계정) ──

    /** 전체 교환 요청 목록 조회 */
    getAllExchanges: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('reward_redemptions')
                .select('id,reward_id,gold_paid,status,coupon_code,reject_reason,processed_at,delivered_at,created_at,reward_items(name,description,reward_type),profiles!reward_redemptions_user_id_fkey(name,username,contact_email)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(toRedemption);
        }
        try {
            return await apiClient.get('/admin/rewards/exchanges');
        } catch {
            return mockRewardStore.getAll();
        }
    },

    /** 교환 요청 승인 (쿠폰번호 입력) */
    approveExchange: async (id, couponCode) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('approve_reward_redemption', {
                p_redemption_id: id,
                p_coupon_code: couponCode,
            });
            if (error) throw error;
            return data;
        }
        try {
            return await apiClient.post(`/admin/rewards/${id}/approve`, { couponCode });
        } catch {
            const ok = mockRewardStore.update(id, {
                status: 'DELIVERED',
                couponCode,
                processedAt: new Date().toISOString()
            });
            if (!ok) throw new Error('해당 교환 요청을 찾을 수 없습니다.');
            return { success: true };
        }
    },

    /** 교환 요청 거절 (골드 환불) */
    rejectExchange: async (id, reason) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('reject_reward_redemption', {
                p_redemption_id: id,
                p_reason: reason,
            });
            if (error) throw error;
            return data;
        }
        try {
            return await apiClient.post(`/admin/rewards/${id}/reject`, { reason });
        } catch {
            const list = mockRewardStore.getAll();
            const item = list.find(r => r.id === id);
            if (!item) throw new Error('해당 교환 요청을 찾을 수 없습니다.');
            mockRewardStore.update(id, {
                status: 'CANCELLED',
                rejectReason: reason,
                processedAt: new Date().toISOString()
            });
            // 골드 환불
            if (item.goldPaid) mockRewardStore.refundGold(item.goldPaid);
            return { success: true };
        }
    }
};

export default rewardApi;
