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

/**
 * 샘플 알림 초기화 (알림이 비어있을 때만)
 * 다양한 타입의 8~10개 샘플 알림 생성
 */
export const initMockNotifications = () => {
    const existing = getAllNotifications();
    if (existing.length > 0) return;

    const now = Date.now();
    const kstOffset = 9 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;

    const mockNotifications = [
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.QUEST_COMPLETE,
            title: '일간 퀘스트 완료!',
            message: '안전 교육 시청 퀘스트를 완료하여 50P를 획득했습니다.',
            timestamp: new Date(now + kstOffset - 10 * minute).toISOString(),
            read: false,
            data: { questId: 'daily_education_1', points: 50 }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.TEAM_QUEST,
            title: '팀 퀘스트 참여 요청',
            message: '현장 A구역 팀 안전점검 퀘스트에 참여해주세요.',
            timestamp: new Date(now + kstOffset - 30 * minute).toISOString(),
            read: false,
            data: { teamQuestId: 'tq_001' }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.PRAISE,
            title: '칭찬을 받았습니다!',
            message: '김안전님이 "오늘 안전 점검 꼼꼼하게 해주셔서 감사합니다"라고 칭찬했습니다.',
            timestamp: new Date(now + kstOffset - 1 * hour).toISOString(),
            read: false,
            data: { from: '김안전', praiseId: 'pr_001' }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.EVENT_QUEST,
            title: '이벤트 퀘스트 오픈!',
            message: '안전의 달 특별 퀘스트가 시작되었습니다. 보너스 포인트 2배!',
            timestamp: new Date(now + kstOffset - 2 * hour).toISOString(),
            read: true,
            data: { eventId: 'ev_safety_month' }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.SEASON,
            title: '시즌 3 시작!',
            message: '새로운 시즌이 시작되었습니다. 시즌 랭킹에 도전하세요!',
            timestamp: new Date(now + kstOffset - 4 * hour).toISOString(),
            read: true,
            data: { seasonId: 'season_3' }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.WORK_STOP,
            title: '작업중지 알림',
            message: 'B구역 크레인 작업이 안전 문제로 일시 중지되었습니다.',
            timestamp: new Date(now + kstOffset - 6 * hour).toISOString(),
            read: false,
            data: { zone: 'B구역', hazardType: 'fall' }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.SYSTEM,
            title: '시스템 공지',
            message: '안전 퀘스트 앱이 v2.5로 업데이트되었습니다. 새로운 기능을 확인해보세요!',
            timestamp: new Date(now + kstOffset - 8 * hour).toISOString(),
            read: true,
            data: { version: '2.5' }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.QUEST_COMPLETE,
            title: '주간 퀘스트 완료!',
            message: '위험성 평가 참여 퀘스트를 완료하여 200P를 획득했습니다.',
            timestamp: new Date(now + kstOffset - 12 * hour).toISOString(),
            read: false,
            data: { questId: 'weekly_risk_assess', points: 200 }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.PRAISE,
            title: '팀 칭찬 달성!',
            message: '이번 주 팀원들로부터 5회 칭찬을 받아 보너스 100P를 획득했습니다.',
            timestamp: new Date(now + kstOffset - 20 * hour).toISOString(),
            read: true,
            data: { bonusPoints: 100 }
        },
        {
            id: generateNotificationId(),
            type: NOTIFICATION_TYPES.SYSTEM,
            title: '안전 점검 리마인더',
            message: '오늘 예정된 안전 점검 체크리스트를 아직 완료하지 않았습니다.',
            timestamp: new Date(now + kstOffset - 23 * hour).toISOString(),
            read: false,
            data: { checklistId: 'daily_check' }
        }
    ];

    saveNotifications(mockNotifications);
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearOldNotifications,
    initMockNotifications,
    NOTIFICATION_TYPES,
    NOTIFICATION_ICONS
};
