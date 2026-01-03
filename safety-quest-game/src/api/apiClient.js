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
 * 백엔드 ApiResponse 형식에 맞게 처리: { success: boolean, data: T, error: { code, message, details } }
 */
const handleResponse = async (response) => {
    // 응답 본문이 없는 경우 (204 No Content 등)
    if (response.status === 204) {
        return { success: true };
    }
    
    // 응답 본문 파싱
    let apiResponse;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        apiResponse = await response.json();
    } else {
        const text = await response.text();
        throw new ApiError(`서버 응답 형식 오류: ${text}`, response.status);
    }
    
    // 응답 형식 로깅 (개발 모드)
    if (config.DEV_MODE) {
        console.log('[API] Parsed Response:', apiResponse);
        console.log('[API] Response has success:', apiResponse.success !== undefined);
        console.log('[API] Response has data:', apiResponse.data !== undefined);
        console.log('[API] Response keys:', Object.keys(apiResponse));
    }
    
    // 백엔드 ApiResponse 형식 확인
    if (apiResponse.success === false) {
        // 백엔드 에러 응답 형식: { success: false, error: { code, message, details } }
        const error = apiResponse.error || {};
        const errorMessage = error.message || `API Error: ${response.status}`;
        throw new ApiError(errorMessage, response.status, {
            code: error.code,
            message: error.message,
            details: error.details
        });
    }
    
    // 성공 응답: { success: true, data: T }
    // data 필드가 있으면 data를 반환, 없으면 전체 응답 반환
    const result = apiResponse.data !== undefined ? apiResponse.data : apiResponse;
    
    if (config.DEV_MODE) {
        console.log('[API] Extracted Result:', result);
        console.log('[API] Result Type:', typeof result);
        console.log('[API] Result Keys:', result && typeof result === 'object' ? Object.keys(result) : 'N/A');
    }
    
    return result;
};

/**
 * 토큰 갱신 시도
 */
let isRefreshing = false;
let refreshPromise = null;

const attemptTokenRefresh = async () => {
    if (isRefreshing) {
        return refreshPromise;
    }
    
    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const refreshToken = tokenManager.getRefreshToken();
            if (!refreshToken) {
                throw new Error('Refresh token not found');
            }
            
            const url = config.getApiUrl('/auth/refresh');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });
            
            const apiResponse = await response.json();
            
            if (apiResponse.success && apiResponse.data) {
                const { accessToken, refreshToken: newRefreshToken } = apiResponse.data;
                tokenManager.setTokens(accessToken, newRefreshToken);
                return { accessToken, refreshToken: newRefreshToken };
            } else {
                throw new Error(apiResponse.error?.message || 'Token refresh failed');
            }
        } catch (error) {
            tokenManager.clearTokens();
            throw error;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();
    
    return refreshPromise;
};

/**
 * API 요청 함수
 * 401 에러 시 자동 토큰 갱신 시도
 */
const request = async (endpoint, options = {}, retryCount = 0) => {
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
            body: options.body ? JSON.parse(options.body) : undefined,
            baseUrl: config.API_BASE_URL,
            endpoint: endpoint
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
        
        // 401 에러 처리 (토큰 만료 또는 유효하지 않음)
        if (response.status === 401 && retryCount === 0) {
            // 인증 엔드포인트는 재시도하지 않음
            if (endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh')) {
                const data = await handleResponse(response);
                return data;
            }
            
            // 토큰 갱신 시도
            try {
                await attemptTokenRefresh();
                
                // 토큰 갱신 성공 시 원래 요청 재시도
                const newHeaders = getDefaultHeaders();
                mergedOptions.headers = {
                    ...mergedOptions.headers,
                    ...newHeaders,
                };
                
                return request(endpoint, mergedOptions, retryCount + 1);
            } catch (refreshError) {
                // 토큰 갱신 실패 시 에러 throw
                throw new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 401);
            }
        }
        
        const data = await handleResponse(response);
        
        // 응답 로깅 (개발 모드)
        if (config.DEV_MODE) {
            console.log(`[API] Response Status: ${response.status}`);
            console.log(`[API] Response Headers:`, Object.fromEntries(response.headers.entries()));
            console.log(`[API] Response Data:`, data);
            console.log(`[API] Response Data Type:`, typeof data);
            console.log(`[API] Response Data Keys:`, data && typeof data === 'object' ? Object.keys(data) : 'N/A');
        }
        
        return data;
        
    } catch (error) {
        // 타임아웃 에러
        if (error.name === 'AbortError') {
            throw new ApiError('요청 시간이 초과되었습니다.', 408);
        }
        
        // 네트워크 에러 (다양한 케이스 처리)
        const isNetworkError = 
            (error instanceof TypeError && error.message === 'Failed to fetch') ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('ERR_CONNECTION_REFUSED') ||
            error.message?.includes('ERR_NETWORK') ||
            error.message?.includes('ERR_INTERNET_DISCONNECTED');
        
        if (isNetworkError) {
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

