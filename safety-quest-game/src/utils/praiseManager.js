/**
 * 칭찬하기(동료 인정) 매니저
 * localStorage 기반 + 백엔드 API 연동 준비
 */

import { storage, getKSTDateString, userProfile } from './storage';
import { addPoints } from './pointsCalculator';
import { addNotification, NOTIFICATION_TYPES } from './notificationManager';
import { trackPraiseReceived } from './achievementManager';

const PRAISE_LOG_KEY = 'safety_quest_praise_log';
const PRAISE_RECEIVED_KEY = 'safety_quest_praise_received';
const PRAISE_DAILY_KEY = 'safety_quest_praise_daily';

const MAX_DAILY_PRAISE = 5;
const PRAISE_REWARD_POINTS = 10;

export const PRAISE_TYPES = [
    { id: 'safety_model', label: '안전 모범', icon: '🛡️', description: '안전 수칙을 모범적으로 준수' },
    { id: 'quick_response', label: '빠른 대응', icon: '⚡', description: '위험 상황에 신속하게 대응' },
    { id: 'thorough_check', label: '꼼꼼한 점검', icon: '🔍', description: '체크리스트를 꼼꼼히 수행' },
    { id: 'teamwork', label: '팀워크', icon: '🤝', description: '동료와 훌륭한 협업' }
];

// 오늘 보낸 칭찬 수 조회
export const getTodayPraiseCount = () => {
    const daily = storage.get(PRAISE_DAILY_KEY, {});
    const today = getKSTDateString();
    const userId = userProfile.getName() || 'guest';
    return daily[`${userId}_${today}`] || 0;
};

// 칭찬 가능 여부 확인
export const canSendPraise = () => {
    return getTodayPraiseCount() < MAX_DAILY_PRAISE;
};

// 남은 칭찬 횟수
export const getRemainingPraises = () => {
    return MAX_DAILY_PRAISE - getTodayPraiseCount();
};

// 칭찬 보내기
export const sendPraise = (targetUserId, targetName, praiseTypeId, message = '') => {
    if (!canSendPraise()) {
        return { success: false, message: '오늘 칭찬 횟수를 모두 사용했습니다. (최대 5회/일)' };
    }

    const senderId = userProfile.getName() || 'guest';
    if (targetUserId === senderId) {
        return { success: false, message: '자기 자신에게는 칭찬을 보낼 수 없습니다.' };
    }

    const praiseType = PRAISE_TYPES.find(t => t.id === praiseTypeId);
    if (!praiseType) {
        return { success: false, message: '유효하지 않은 칭찬 유형입니다.' };
    }

    const today = getKSTDateString();
    const praiseEntry = {
        id: `praise_${Date.now()}`,
        senderId,
        targetUserId,
        targetName,
        praiseTypeId,
        praiseLabel: praiseType.label,
        praiseIcon: praiseType.icon,
        message,
        date: today,
        timestamp: new Date().toISOString()
    };

    // 보낸 칭찬 기록
    const logs = storage.get(PRAISE_LOG_KEY, []);
    logs.unshift(praiseEntry);
    if (logs.length > 100) logs.splice(100);
    storage.set(PRAISE_LOG_KEY, logs);

    // 일일 카운트 증가
    const daily = storage.get(PRAISE_DAILY_KEY, {});
    daily[`${senderId}_${today}`] = (daily[`${senderId}_${today}`] || 0) + 1;
    storage.set(PRAISE_DAILY_KEY, daily);

    // 받은 칭찬 기록 (수신자측)
    const received = storage.get(PRAISE_RECEIVED_KEY, []);
    received.unshift(praiseEntry);
    if (received.length > 100) received.splice(100);
    storage.set(PRAISE_RECEIVED_KEY, received);

    // 수신자에게 포인트 지급 (시스템 지급)
    addPoints(PRAISE_REWARD_POINTS, '칭찬 보상', `${senderId}님의 칭찬: ${praiseType.label}`);

    // 알림 생성
    addNotification(
        NOTIFICATION_TYPES.PRAISE,
        '칭찬을 받았습니다!',
        `${senderId}님이 "${praiseType.label}" 칭찬을 보냈습니다.${message ? ' - ' + message : ''}`,
        { from: senderId, praiseType: praiseTypeId, praiseId: praiseEntry.id }
    );

    // 업적 추적
    trackPraiseReceived();

    return {
        success: true,
        message: `${targetName}님에게 "${praiseType.label}" 칭찬을 보냈습니다!`,
        praise: praiseEntry
    };
};

// 보낸 칭찬 기록 조회
export const getSentPraises = (limit = 20) => {
    const logs = storage.get(PRAISE_LOG_KEY, []);
    const userId = userProfile.getName() || 'guest';
    return logs.filter(p => p.senderId === userId).slice(0, limit);
};

// 받은 칭찬 기록 조회
export const getReceivedPraises = (limit = 20) => {
    const received = storage.get(PRAISE_RECEIVED_KEY, []);
    return received.slice(0, limit);
};

// 총 받은 칭찬 수
export const getTotalReceivedCount = () => {
    return storage.get(PRAISE_RECEIVED_KEY, []).length;
};

// 총 보낸 칭찬 수
export const getTotalSentCount = () => {
    const logs = storage.get(PRAISE_LOG_KEY, []);
    const userId = userProfile.getName() || 'guest';
    return logs.filter(p => p.senderId === userId).length;
};

export default {
    PRAISE_TYPES,
    getTodayPraiseCount,
    canSendPraise,
    getRemainingPraises,
    sendPraise,
    getSentPraises,
    getReceivedPraises,
    getTotalReceivedCount,
    getTotalSentCount
};
