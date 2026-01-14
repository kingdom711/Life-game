/**
 * 실시간 위험 알림 API
 * 백엔드 Alert API와 연동
 */

import apiClient from './apiClient';

/**
 * 시간 표시 포맷팅
 */
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
};

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 */
const transformAlert = (alert) => ({
    id: alert.id,
    type: alert.type?.toLowerCase() || 'info', // DANGER -> danger
    zone: alert.title?.split(' - ')[0] || '전체', // 제목에서 구역 추출 또는 기본값
    message: alert.title,
    detail: alert.message,
    time: formatTimeAgo(alert.createdAt),
    createdAt: alert.createdAt,
    priority: alert.priority,
    active: alert.active
});

/**
 * 프론트엔드 데이터를 백엔드 형식으로 변환
 */
const transformToBackend = (data) => ({
    title: data.zone ? `${data.zone} - ${data.message}` : data.message,
    message: data.detail,
    type: data.type?.toUpperCase() || 'INFO', // danger -> DANGER
    priority: data.priority || 0,
    active: data.active !== false,
    startDate: data.startDate || null,
    endDate: data.endDate || null
});

/**
 * 활성 알림 목록 조회 (인증 불필요)
 * @returns {Promise<Array>} 알림 목록
 */
export const getAlerts = async () => {
    try {
        // apiClient는 이미 data 필드를 추출해서 반환함
        const alerts = await apiClient.get('/alerts/active');
        // alerts가 배열인지 확인 (배열이 아니면 빈 배열 반환)
        const alertList = Array.isArray(alerts) ? alerts : [];
        return alertList.map(transformAlert);
    } catch (error) {
        console.error('[AlertApi] Failed to fetch alerts:', error);
        throw error;
    }
};

/**
 * 모든 알림 목록 조회 (관리자용)
 * @returns {Promise<Array>} 알림 목록
 */
export const getAllAlerts = async () => {
    try {
        const alerts = await apiClient.get('/alerts');
        const alertList = Array.isArray(alerts) ? alerts : [];
        return alertList.map(transformAlert);
    } catch (error) {
        console.error('[AlertApi] Failed to fetch all alerts:', error);
        throw error;
    }
};

/**
 * 새 알림 생성 (SAFETY_MANAGER 권한 필요)
 * @param {Object} data - 알림 데이터
 * @returns {Promise<Object>} 생성된 알림
 */
export const createAlert = async (data) => {
    try {
        const backendData = transformToBackend(data);
        const alert = await apiClient.post('/alerts', backendData);
        return transformAlert(alert);
    } catch (error) {
        console.error('[AlertApi] Failed to create alert:', error);
        throw error;
    }
};

/**
 * 알림 수정 (SAFETY_MANAGER 권한 필요)
 * @param {string|number} id - 알림 ID
 * @param {Object} data - 수정할 데이터
 * @returns {Promise<Object>} 수정된 알림
 */
export const updateAlert = async (id, data) => {
    try {
        const backendData = transformToBackend(data);
        const alert = await apiClient.put(`/alerts/${id}`, backendData);
        return transformAlert(alert);
    } catch (error) {
        console.error('[AlertApi] Failed to update alert:', error);
        throw error;
    }
};

/**
 * 알림 삭제 (SAFETY_MANAGER 권한 필요)
 * @param {string|number} id - 알림 ID
 * @returns {Promise<void>}
 */
export const deleteAlert = async (id) => {
    try {
        await apiClient.delete(`/alerts/${id}`);
        console.log('[AlertApi] Alert deleted:', id);
    } catch (error) {
        console.error('[AlertApi] Failed to delete alert:', error);
        throw error;
    }
};

/**
 * 알림 API 객체
 */
const alertApi = {
    getAlerts,
    getAllAlerts,
    createAlert,
    updateAlert,
    deleteAlert
};

export default alertApi;
