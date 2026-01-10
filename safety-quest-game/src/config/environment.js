/**
 * 환경변수 설정
 * .env 파일이 있으면 해당 값을 사용하고, 없으면 기본값 사용
 */

const config = {
    // API 서버 URL (로컬호스트가 아니면 강제로 HTTPS 적용)
    API_BASE_URL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/^http:\/\/(?!localhost)/, 'https://'),

    // Mock 모드 (백엔드 서버 없을 때 true)
    USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',

    // API 타임아웃 (밀리초)
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,

    // 개발 모드
    DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV || false,

    // Google Analytics 설정
    GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
    GA_DEBUG_MODE: import.meta.env.VITE_GA_DEBUG_MODE === 'true',

    // API 버전
    API_VERSION: 'v1',

    // 전체 API URL 생성 헬퍼
    getApiUrl: (endpoint) => {
        const baseUrl = config.API_BASE_URL;
        const version = config.API_VERSION;
        // endpoint가 /로 시작하면 그대로, 아니면 /api/v1/ 붙임
        if (endpoint.startsWith('/api')) {
            return `${baseUrl}${endpoint}`;
        }
        return `${baseUrl}/api/${version}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
};

// 개발 모드에서 설정 로그 출력
if (config.DEV_MODE) {
    console.log('[Config] Environment loaded:', {
        API_BASE_URL: config.API_BASE_URL,
        USE_MOCK: config.USE_MOCK,
        API_TIMEOUT: config.API_TIMEOUT,
        DEV_MODE: config.DEV_MODE
    });
}

// [DEBUG] HTTPS 강제 변환 확인용 로그 (배포 후 확인 필수)
console.log('🚀 [Environment] Final API_BASE_URL:', config.API_BASE_URL);

export default config;

