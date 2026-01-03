/**
 * 인증 관련 API
 */

import apiClient from './apiClient';

const authApi = {
    /**
     * 회원가입
     * @param {object} data - { email, password, name, companyName, planType }
     */
    signup: async (data) => {
        return apiClient.post('/auth/signup', data);
    },
    
    /**
     * 로그인
     * @param {object} credentials - { username, password }
     */
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        
        // 백엔드 응답 형식: { accessToken, refreshToken, tokenType, user }
        // 토큰 저장
        if (response.accessToken) {
            apiClient.token.setTokens(response.accessToken, response.refreshToken);
        }
        
        return response;
    },
    
    /**
     * 로그아웃
     */
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            // 토큰 삭제
            apiClient.token.clearTokens();
        }
    },
    
    /**
     * 토큰 갱신
     */
    refreshToken: async () => {
        const refreshToken = apiClient.token.getRefreshToken();
        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }
        
        // 백엔드 요청 형식: { refreshToken }
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        
        // 백엔드 응답 형식: { accessToken, refreshToken, tokenType, user }
        if (response.accessToken) {
            apiClient.token.setTokens(response.accessToken, response.refreshToken);
        }
        
        return response;
    },
    
    /**
     * 내 정보 조회
     */
    getMe: async () => {
        return apiClient.get('/auth/me');
    },
    
    /**
     * 현재 로그인 상태 확인
     */
    isAuthenticated: () => {
        return !!apiClient.token.getAccessToken();
    },
    
    /**
     * 비밀번호 재설정 요청
     * @param {string} email
     */
    requestPasswordReset: async (email) => {
        return apiClient.post('/auth/password-reset/request', { email });
    },
    
    /**
     * 비밀번호 재설정
     * @param {object} data - { token, newPassword }
     */
    resetPassword: async (data) => {
        return apiClient.post('/auth/password-reset/confirm', data);
    }
};

export default authApi;

