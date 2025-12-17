/**
 * 공통 API 클라이언트
 * 모든 API 호출의 기반이 되는 fetch 래퍼
 */

import config from '../config/environment';

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * 인증 토큰 관리
 */
const tokenManager = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: (accessToken, refreshToken) => {
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

/**
 * 기본 헤더 생성
 */
const getDefaultHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const token = tokenManager.getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

/**
 * 응답 처리
 */
const handleResponse = async (response) => {
    // 응답 본문이 없는 경우 (204 No Content 등)
    if (response.status === 204) {
        return { success: true };
    }
    
    // 응답 본문 파싱
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }
    
    // 에러 응답 처리
    if (!response.ok) {
        const errorMessage = data?.message || data?.error || `API Error: ${response.status}`;
        throw new ApiError(errorMessage, response.status, data);
    }
    
    return data;
};

/**
 * API 요청 함수
 */
const request = async (endpoint, options = {}) => {
    const url = config.getApiUrl(endpoint);
    
    const defaultOptions = {
        headers: getDefaultHeaders(),
        timeout: config.API_TIMEOUT,
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    // 요청 로깅 (개발 모드)
    if (config.DEV_MODE) {
        console.log(`[API] ${options.method || 'GET'} ${url}`, {
            headers: mergedOptions.headers,
            body: options.body ? JSON.parse(options.body) : undefined
        });
    }
    
    try {
        // AbortController를 사용한 타임아웃 처리
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);
        
        const response = await fetch(url, {
            ...mergedOptions,
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const data = await handleResponse(response);
        
        // 응답 로깅 (개발 모드)
        if (config.DEV_MODE) {
            console.log(`[API] Response:`, data);
        }
        
        return data;
        
    } catch (error) {
        // 타임아웃 에러
        if (error.name === 'AbortError') {
            throw new ApiError('요청 시간이 초과되었습니다.', 408);
        }
        
        // 네트워크 에러
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new ApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.', 0);
        }
        
        // 이미 ApiError인 경우 그대로 throw
        if (error instanceof ApiError) {
            throw error;
        }
        
        // 기타 에러
        throw new ApiError(error.message || '알 수 없는 오류가 발생했습니다.', 500);
    }
};

/**
 * API 클라이언트 객체
 */
const apiClient = {
    /**
     * GET 요청
     */
    get: (endpoint, options = {}) => {
        return request(endpoint, { ...options, method: 'GET' });
    },
    
    /**
     * POST 요청
     */
    post: (endpoint, data, options = {}) => {
        return request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    /**
     * PUT 요청
     */
    put: (endpoint, data, options = {}) => {
        return request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    
    /**
     * PATCH 요청
     */
    patch: (endpoint, data, options = {}) => {
        return request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
    
    /**
     * DELETE 요청
     */
    delete: (endpoint, options = {}) => {
        return request(endpoint, { ...options, method: 'DELETE' });
    },
    
    /**
     * 토큰 관리
     */
    token: tokenManager,
    
    /**
     * 설정
     */
    config,
};

export default apiClient;

