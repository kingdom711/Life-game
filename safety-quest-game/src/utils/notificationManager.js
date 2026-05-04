/**
 * 실시간 알림 관리 매니저
 *
 * 기능:
 * - 알림 저장/조회 (localStorage)
 * - 읽음 처리 (단건/전체)
 * - 오래된 알림 정리
 * - 샘플 알림 초기화
 *
 * 알림 타입: quest_complete, team_quest, praise, event_quest, season, work_stop, system
 */

import { getKSTDateString } from './storage';

const NOTIFICATIONS_KEY = 'safety_quest_notifications';
const NOTIFICATIONS_MIGRATION_KEY = 'safety_quest_notifications_migration';
const READ_ALERTS_KEY = 'safety_quest_read_alerts';
const NOTIFICATIONS_VERSION = '2026-05-mock-purge';

(() => {
    try {
        if (typeof localStorage === 'undefined') return;
        if (localStorage.getItem(NOTIFICATIONS_MIGRATION_KEY) !== NOTIFICATIONS_VERSION) {
            localStorage.removeItem(NOTIFICATIONS_KEY);
            localStorage.setItem(NOTIFICATIONS_MIGRATION_KEY, NOTIFICATIONS_VERSION);
        }
    } catch (_) { /* silent */ }
})();

const parseReadAlerts = () => {
    try {
        const raw = localStorage.getItem(READ_ALERTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
};

export const isAlertRead = (alertKey) => parseReadAlerts().includes(String(alertKey));

export const markAlertRead = (alertKey) => {
    const list = parseReadAlerts();
    const k = String(alertKey);
    if (!list.includes(k)) {
        list.push(k);
        localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(list.slice(-200)));
    }
};

export const markAllAlertsRead = (alertKeys) => {
    const list = parseReadAlerts();
    const set = new Set(list);
    alertKeys.forEach((k) => set.add(String(k)));
    localStorage.setItem(READ_ALERTS_KEY, JSON.stringify([...set].slice(-200)));
};

// 알림 타입 정의
export const NOTIFICATION_TYPES = {
    QUEST_COMPLETE: 'quest_complete',
    TEAM_QUEST: 'team_quest',
    PRAISE: 'praise',
    EVENT_QUEST: 'event_quest',
    SEASON: 'season',
    WORK_STOP: 'work_stop',
    SYSTEM: 'system'
};

// 타입별 아이콘
export const NOTIFICATION_ICONS = {
    [NOTIFICATION_TYPES.QUEST_COMPLETE]: '✅',
    [NOTIFICATION_TYPES.TEAM_QUEST]: '👥',
    [NOTIFICATION_TYPES.PRAISE]: '👏',
    [NOTIFICATION_TYPES.EVENT_QUEST]: '🎉',
    [NOTIFICATION_TYPES.SEASON]: '🏆',
    [NOTIFICATION_TYPES.WORK_STOP]: '🛑',
    [NOTIFICATION_TYPES.SYSTEM]: '🔔'
};

const parseJSON = (value, defaultValue = []) => {
    if (value === null || value === undefined) return defaultValue;
    try { return JSON.parse(value); } catch { return defaultValue; }
};

/**
 * 알림 ID 생성
 */
const generateNotificationId = () => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

/**
 * KST 기준 현재 타임스탬프 (ISO 문자열)
 */
const getKSTTimestamp = () => {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    return kstDate.toISOString();
};

/**
 * 전체 알림 목록 가져오기 (내부용)
 */
const getAllNotifications = () => {
    return parseJSON(localStorage.getItem(NOTIFICATIONS_KEY), []);
};

/**
 * 전체 알림 목록 저장 (내부용)
 */
const saveNotifications = (notifications) => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

/**
 * 최근 알림 조회
 * @param {number} limit - 가져올 알림 수 (기본 20)
 * @returns {Array} 최신순 정렬된 알림 목록
 */
export const getNotifications = (limit = 20) => {
    const notifications = getAllNotifications();
    return notifications
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
};

/**
 * 읽지 않은 알림 개수
 * @returns {number} 읽지 않은 알림 수
 */
export const getUnreadCount = () => {
    const notifications = getAllNotifications();
    return notifications.filter(n => !n.read).length;
};

/**
 * 단건 알림 읽음 처리
 * @param {string} notificationId - 알림 ID
 */
export const markAsRead = (notificationId) => {
    const notifications = getAllNotifications();
    const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
};

/**
 * 전체 알림 읽음 처리
 */
export const markAllAsRead = () => {
    const notifications = getAllNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
};

/**
 * 새 알림 추가
 * @param {string} type - 알림 타입 (NOTIFICATION_TYPES 참조)
 * @param {string} title - 알림 제목
 * @param {string} message - 알림 메시지
 * @param {Object} data - 추가 데이터 (선택)
 * @returns {Object} 생성된 알림 객체
 */
export const addNotification = (type, title, message, data = {}) => {
    const notifications = getAllNotifications();
    const notification = {
        id: generateNotificationId(),
        type,
        title,
        message,
        timestamp: getKSTTimestamp(),
        read: false,
        data
    };
    notifications.push(notification);
    saveNotifications(notifications);
    return notification;
};

/**
 * 오래된 알림 정리
 * @param {number} daysOld - 기준 일수 (기본 30일)
 * @returns {number} 삭제된 알림 수
 */
export const clearOldNotifications = (daysOld = 30) => {
    const notifications = getAllNotifications();
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const filtered = notifications.filter(n => new Date(n.timestamp).getTime() > cutoff);
    const removedCount = notifications.length - filtered.length;
    saveNotifications(filtered);
    return removedCount;
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearOldNotifications,
    NOTIFICATION_TYPES,
    NOTIFICATION_ICONS
};
