/**
 * 실시간 위험 알림 API
 * 로컬 스토리지를 사용하여 알림 데이터 관리
 * (백엔드 Alert API가 없으므로 로컬 스토리지 사용)
 */

const STORAGE_KEY = 'safety_road_alerts';

/**
 * 로컬 스토리지에서 알림 목록 가져오기
 */
const getStoredAlerts = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('[AlertApi] Failed to parse stored alerts:', error);
        return [];
    }
};

/**
 * 로컬 스토리지에 알림 목록 저장
 */
const saveAlerts = (alerts) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
        console.error('[AlertApi] Failed to save alerts:', error);
    }
};

/**
 * 시간 표시 포맷팅
 */
const formatTimeAgo = (dateString) => {
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
 * 전체 알림 목록 조회
 * @returns {Promise<Array>} 알림 목록
 */
export const getAlerts = async () => {
    const alerts = getStoredAlerts();
    
    // 시간 표시 업데이트
    return alerts.map(alert => ({
        ...alert,
        time: formatTimeAgo(alert.createdAt)
    }));
};

/**
 * 새 알림 생성
 * @param {Object} data - 알림 데이터
 * @param {string} data.type - 알림 유형 (danger/warning/info)
 * @param {string} data.zone - 구역
 * @param {string} data.message - 알림 제목/메시지
 * @param {string} data.detail - 상세 내용
 * @returns {Promise<Object>} 생성된 알림
 */
export const createAlert = async (data) => {
    const alerts = getStoredAlerts();
    
    const newAlert = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        time: '방금 전'
    };
    
    // 새 알림을 맨 앞에 추가
    const updatedAlerts = [newAlert, ...alerts];
    saveAlerts(updatedAlerts);
    
    console.log('[AlertApi] Alert created:', newAlert);
    return newAlert;
};

/**
 * 알림 수정
 * @param {string|number} id - 알림 ID
 * @param {Object} data - 수정할 데이터
 * @returns {Promise<Object>} 수정된 알림
 */
export const updateAlert = async (id, data) => {
    const alerts = getStoredAlerts();
    
    const index = alerts.findIndex(a => a.id === id || a.id === Number(id));
    if (index === -1) {
        throw new Error('알림을 찾을 수 없습니다.');
    }
    
    const updatedAlert = {
        ...alerts[index],
        ...data,
        updatedAt: new Date().toISOString()
    };
    
    alerts[index] = updatedAlert;
    saveAlerts(alerts);
    
    console.log('[AlertApi] Alert updated:', updatedAlert);
    return updatedAlert;
};

/**
 * 알림 삭제
 * @param {string|number} id - 알림 ID
 * @returns {Promise<void>}
 */
export const deleteAlert = async (id) => {
    const alerts = getStoredAlerts();
    
    const filteredAlerts = alerts.filter(a => a.id !== id && a.id !== Number(id));
    saveAlerts(filteredAlerts);
    
    console.log('[AlertApi] Alert deleted:', id);
};

/**
 * 알림 API 객체
 */
const alertApi = {
    getAlerts,
    createAlert,
    updateAlert,
    deleteAlert
};

export default alertApi;
