/**
 * 보상센터 관련 API
 */

import apiClient from './apiClient';

const rewardApi = {
    /**
     * 활성화된 보상 목록 조회
     */
    getRewards: async () => {
        return apiClient.get('/rewards');
    },

    /**
     * 보상 교환 (골드 → 쿠폰)
     * @param {number} rewardId - 보상 ID
     */
    exchangeReward: async (rewardId) => {
        return apiClient.post(`/rewards/${rewardId}/exchange`);
    },

    /**
     * 내 보상 교환 내역 조회
     */
    getMyRewards: async () => {
        return apiClient.get('/rewards/my-rewards');
    },

    // [New] 본인 인증 관련 API
    checkVerificationStatus: async () => {
        return apiClient.get('/auth/verification-status');
    },

    requestVerification: async (phoneNumber) => {
        return apiClient.post('/auth/verify/request', { phoneNumber });
    },

    confirmVerification: async (phoneNumber, code) => {
        return apiClient.post('/auth/verify/confirm', { phoneNumber, code });
    }
};

export default rewardApi;
