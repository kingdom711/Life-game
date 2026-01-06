/**
 * Request ID 관리자
 * 
 * 브라우저 세션 동안 하나의 ULID를 유지하여 
 * 프론트엔드-백엔드 전구간 로그 추적에 활용합니다.
 * 
 * ULID(Universally Unique Lexicographically Sortable Identifier)는 
 * 시간 정보를 포함하므로 정렬에 유리합니다.
 */

import { ulid } from 'ulid';

const SESSION_REQUEST_ID_KEY = 'session_request_id';

/**
 * 세션 Request ID 조회 또는 생성
 * - sessionStorage에 저장된 ULID가 있으면 반환
 * - 없으면 새로 생성하여 저장 후 반환
 * @returns {string} 세션 ULID
 */
export const getSessionRequestId = () => {
    let requestId = sessionStorage.getItem(SESSION_REQUEST_ID_KEY);

    if (!requestId) {
        // ULID는 시간 정보를 포함하므로 정렬에 유리함
        requestId = ulid();
        sessionStorage.setItem(SESSION_REQUEST_ID_KEY, requestId);

        if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
            console.log(`[RequestIdManager] 새 세션 Request ID 생성: ${requestId}`);
        }
    }

    return requestId;
};

/**
 * 세션 Request ID 갱신
 * 명시적으로 새 ULID를 생성해야 할 때 사용
 * @returns {string} 새로 생성된 ULID
 */
export const refreshSessionRequestId = () => {
    const requestId = ulid();
    sessionStorage.setItem(SESSION_REQUEST_ID_KEY, requestId);

    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.log(`[RequestIdManager] 세션 Request ID 갱신: ${requestId}`);
    }

    return requestId;
};

/**
 * 세션 Request ID 삭제
 * 로그아웃 등의 상황에서 세션 컨텍스트를 초기화할 때 사용
 */
export const clearSessionRequestId = () => {
    sessionStorage.removeItem(SESSION_REQUEST_ID_KEY);

    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.log('[RequestIdManager] 세션 Request ID 삭제됨');
    }
};

export default {
    getSessionRequestId,
    refreshSessionRequestId,
    clearSessionRequestId
};
