/**
 * 환경변수 설정
 * .env 파일이 있으면 해당 값을 사용하고, 없으면 기본값 사용
 */

const normalizePrimaryBaseUrl = (url) =>
    (url || 'http://localhost:8080').replace(/^http:\/\/(?!localhost|127\.0\.0\.1)/, 'https://');

const normalizeLocalBaseUrl = (url) =>
    (url || 'http://localhost:8080').replace(/\/$/, '');

const localPreferenceRaw = import.meta.env.VITE_USE_LOCAL_IF_AVAILABLE;
const defaultUseLocalInDev = localPreferenceRaw === undefined && (import.meta.env.DEV || false);

const config = {
    // 배포 API 기본 URL (기존 동작 유지)
    PRIMARY_API_BASE_URL: normalizePrimaryBaseUrl(import.meta.env.VITE_API_BASE_URL),

    // 로컬 API 후보 URL (로컬 백엔드 실행 시 자동 전환)
    LOCAL_API_BASE_URL: normalizeLocalBaseUrl(import.meta.env.VITE_API_BASE_URL_LOCAL),

    // 로컬 백엔드 헬스체크 성공 시 자동 전환 여부
    USE_LOCAL_IF_AVAILABLE:
        localPreferenceRaw === 'true' || defaultUseLocalInDev,

    // 로컬 헬스체크 타임아웃 (밀리초)
    LOCAL_HEALTH_TIMEOUT_MS: parseInt(import.meta.env.VITE_LOCAL_HEALTH_TIMEOUT_MS, 10) || 1200,

    // Mock 모드 (백엔드 서버 없을 때 true)
    USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',

    // API 타임아웃 (밀리초)
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000,

    // 개발 모드
    DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV || false,

    // Google Analytics 설정
    GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
    GA_DEBUG_MODE: import.meta.env.VITE_GA_DEBUG_MODE === 'true',

    // API 버전
    API_VERSION: 'v1',

    // 내부 상태: 현재 선택된 API 베이스 URL
    _resolvedBaseUrl: normalizePrimaryBaseUrl(import.meta.env.VITE_API_BASE_URL),
    _resolvePromise: null,

    // 현재 API 서버 결정 (로컬 헬스체크 성공 시 로컬로 전환)
    resolveApiBaseUrl: async () => {
        if (config._resolvePromise) {
            return config._resolvePromise;
        }

        config._resolvePromise = (async () => {
            // 자동 전환 비활성화 시 배포 URL 유지
            if (!config.USE_LOCAL_IF_AVAILABLE) {
                config._resolvedBaseUrl = config.PRIMARY_API_BASE_URL;
                return config._resolvedBaseUrl;
            }

            // 로컬/배포 URL이 동일하면 그대로 사용
            if (config.LOCAL_API_BASE_URL === config.PRIMARY_API_BASE_URL) {
                config._resolvedBaseUrl = config.PRIMARY_API_BASE_URL;
                return config._resolvedBaseUrl;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.LOCAL_HEALTH_TIMEOUT_MS);

            try {
                const healthUrl = `${config.LOCAL_API_BASE_URL}/api/v1/health`;
                const response = await fetch(healthUrl, {
                    method: 'GET',
                    signal: controller.signal,
                });

                if (response.ok) {
                    config._resolvedBaseUrl = config.LOCAL_API_BASE_URL;
                } else {
                    config._resolvedBaseUrl = config.PRIMARY_API_BASE_URL;
                }
            } catch (error) {
                config._resolvedBaseUrl = config.PRIMARY_API_BASE_URL;
            } finally {
                clearTimeout(timeoutId);
            }

            return config._resolvedBaseUrl;
        })();

        return config._resolvePromise;
    },

    get API_BASE_URL() {
        return config._resolvedBaseUrl;
    },

    // 전체 API URL 생성 헬퍼
    getApiUrl: (endpoint) => {
        const baseUrl = config._resolvedBaseUrl;
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
        PRIMARY_API_BASE_URL: config.PRIMARY_API_BASE_URL,
        LOCAL_API_BASE_URL: config.LOCAL_API_BASE_URL,
        USE_LOCAL_IF_AVAILABLE: config.USE_LOCAL_IF_AVAILABLE,
        USE_MOCK: config.USE_MOCK,
        API_TIMEOUT: config.API_TIMEOUT,
        DEV_MODE: config.DEV_MODE
    });
}

console.log('[Environment] Initial API_BASE_URL:', config.API_BASE_URL);

export default config;
