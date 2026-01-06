/**
 * API 로깅 유틸리티
 * 
 * 환경 변수 설정:
 * - VITE_ENABLE_API_LOGGING=true  → 로그 활성화
 * - VITE_ENABLE_API_LOGGING=false → 로그 비활성화 (운영 환경)
 */

// 환경 변수에서 로깅 활성화 여부 확인
const isLoggingEnabled = () => {
    // Vite 환경
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.VITE_ENABLE_API_LOGGING === 'true' ||
            import.meta.env.DEV === true;
    }
    // Node 환경 (테스트 등)
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV !== 'production';
    }
    return false;
};

// 타임스탬프 포맷
const formatTimestamp = (date) => {
    return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
};

// 소요 시간 포맷
const formatDuration = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

// HTTP 메서드별 색상
const getMethodColor = (method) => {
    const colors = {
        GET: '#61affe',
        POST: '#49cc90',
        PUT: '#fca130',
        PATCH: '#50e3c2',
        DELETE: '#f93e3e'
    };
    return colors[method.toUpperCase()] || '#9e9e9e';
};

// 상태 코드별 색상
const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#49cc90';
    if (status >= 300 && status < 400) return '#fca130';
    if (status >= 400 && status < 500) return '#f93e3e';
    if (status >= 500) return '#9c27b0';
    return '#9e9e9e';
};

/**
 * API 요청 로깅
 * @param {string} method - HTTP 메서드
 * @param {string} url - 요청 URL
 * @param {*} body - 요청 본문
 * @param {Object} headers - 요청 헤더
 * @returns {number} startTime - 응답 소요 시간 계산용
 */
export const logRequest = (method, url, body, headers) => {
    const startTime = performance.now();

    if (!isLoggingEnabled()) return startTime;

    const timestamp = formatTimestamp(new Date());
    const methodColor = getMethodColor(method);

    const requestId = headers?.['X-Request-ID'] || 'N/A';

    console.group(
        `%c🚀 API Request %c${method.toUpperCase()} %c${url}`,
        'color: #888; font-weight: normal;',
        `color: ${methodColor}; font-weight: bold;`,
        'color: #ccc; font-weight: normal;'
    );
    console.log(`🔗 Request ID: %c${requestId}`, 'color: #ff9800; font-weight: bold;');
    console.log(`📅 Time: ${timestamp}`);

    if (headers && Object.keys(headers).length > 0) {
        console.log('📋 Headers:', headers);
    }

    if (body !== undefined && body !== null) {
        console.log('📦 Body:', body);
    }

    console.groupEnd();

    return startTime;
};

/**
 * API 응답 로깅
 * @param {string} method - HTTP 메서드
 * @param {string} url - 요청 URL
 * @param {number} status - HTTP 상태 코드
 * @param {*} data - 응답 데이터
 * @param {number} startTime - 요청 시작 시간
 * @param {string} statusText - 상태 텍스트
 */
export const logResponse = (method, url, status, data, startTime, statusText) => {
    if (!isLoggingEnabled()) return;

    const endTime = performance.now();
    const duration = endTime - startTime;
    const timestamp = formatTimestamp(new Date());
    const statusColor = getStatusColor(status);
    const methodColor = getMethodColor(method);

    const statusIcon = status >= 200 && status < 300 ? '✅' : '⚠️';

    console.group(
        `%c${statusIcon} API Response %c${method.toUpperCase()} %c${url} %c${status} ${statusText || ''}`,
        'color: #888; font-weight: normal;',
        `color: ${methodColor}; font-weight: bold;`,
        'color: #ccc; font-weight: normal;',
        `color: ${statusColor}; font-weight: bold;`
    );
    console.log(`🔗 Request ID: 세션 스토리지 참조`);
    console.log(`📅 Time: ${timestamp}`);
    console.log(`⏱️ Duration: %c${formatDuration(duration)}`,
        `color: ${duration > 1000 ? '#f93e3e' : '#49cc90'}; font-weight: bold;`
    );

    if (data !== undefined && data !== null) {
        console.log('📦 Data:', data);
    }

    console.groupEnd();
};

/**
 * API 에러 로깅
 * @param {string} method - HTTP 메서드
 * @param {string} url - 요청 URL
 * @param {Error|*} error - 에러 객체
 * @param {number} startTime - 요청 시작 시간
 * @param {number} status - HTTP 상태 코드
 * @param {string} code - 에러 코드
 */
export const logError = (method, url, error, startTime, status, code) => {
    if (!isLoggingEnabled()) return;

    const endTime = performance.now();
    const duration = endTime - startTime;
    const timestamp = formatTimestamp(new Date());
    const methodColor = getMethodColor(method);

    const errorMessage = error instanceof Error ? error.message : String(error);

    console.group(
        `%c❌ API Error %c${method.toUpperCase()} %c${url}`,
        'color: #f93e3e; font-weight: bold;',
        `color: ${methodColor}; font-weight: bold;`,
        'color: #ccc; font-weight: normal;'
    );
    console.log(`🔗 Request ID: 세션 스토리지 참조`);
    console.log(`📅 Time: ${timestamp}`);
    console.log(`⏱️ Duration: ${formatDuration(duration)}`);

    if (status !== undefined) {
        console.log(`🔢 Status: %c${status}`, 'color: #f93e3e; font-weight: bold;');
    }

    if (code) {
        console.log(`🏷️ Code: ${code}`);
    }

    console.error('💬 Message:', errorMessage);

    if (error instanceof Error && error.stack) {
        console.log('📚 Stack:', error.stack);
    }

    console.groupEnd();
};

/**
 * 요청 시작 시간 생성 헬퍼
 * @returns {number}
 */
export const createRequestTimer = () => {
    return performance.now();
};

/**
 * 소요 시간 계산 헬퍼
 * @param {number} startTime
 * @returns {number}
 */
export const calculateDuration = (startTime) => {
    return performance.now() - startTime;
};

// 기본 export
export default {
    logRequest,
    logResponse,
    logError,
    createRequestTimer,
    calculateDuration,
    isLoggingEnabled
};
