/**
 * 팀 데이터 관리 매니저
 * - 내 팀 정보 및 팀원 데이터
 * - 팀원별 칭찬 통계
 */

import { storage, userProfile } from './storage';
import { getReceivedPraises, getSentPraises, getTotalSentCount, getTotalReceivedCount, getRemainingPraises } from './praiseManager';

// 내 팀 정보
const MY_TEAM = {
    id: 'team_b',
    name: '철근팀 B조',
    rank: 2,
    score: 92,
    icon: '🥈',
    weeklyProgress: 78
};

// 팀원 데이터
const TEAM_MEMBERS = [
    { id: 'member1', name: '김안전', role: 'technician', roleLabel: '기술자', avatar: '👷' },
    { id: 'member2', name: '이보호', role: 'technician', roleLabel: '기술자', avatar: '👷‍♂️' },
    { id: 'member3', name: '박점검', role: 'technician', roleLabel: '기술자', avatar: '🧑‍🔧' },
    { id: 'member4', name: '최수칙', role: 'supervisor', roleLabel: '관리감독자', avatar: '👨‍💼' },
    { id: 'member5', name: '정예방', role: 'technician', roleLabel: '기술자', avatar: '👷‍♀️' },
];

/**
 * 내 팀 정보 반환
 */
export const getMyTeam = () => {
    return { ...MY_TEAM };
};

/**
 * 특정 멤버가 받은 칭찬 횟수
 */
export const getMemberPraiseCount = (memberId) => {
    const received = getReceivedPraises(100);
    return received.filter(p => p.targetUserId === memberId || p.targetName === memberId).length;
};

/**
 * 팀원 목록 반환 (본인 제외, 칭찬 횟수 포함)
 */
export const getTeamMembers = () => {
    const myName = userProfile.getName() || 'guest';
    return TEAM_MEMBERS
        .filter(m => m.name !== myName)
        .map(m => ({
            ...m,
            praiseCount: getMemberPraiseCount(m.id)
        }));
};

/**
 * 칭찬 요약 통계
 */
export const getTeamPraiseSummary = () => {
    return {
        totalSent: getTotalSentCount(),
        totalReceived: getTotalReceivedCount(),
        todayRemaining: getRemainingPraises()
    };
};

/**
 * 최근 칭찬 내역 (보낸 + 받은, 시간순 정렬)
 */
export const getRecentPraiseHistory = (limit = 10) => {
    const sent = getSentPraises(limit).map(p => ({ ...p, direction: 'sent' }));
    const received = getReceivedPraises(limit).map(p => ({ ...p, direction: 'received' }));
    return [...sent, ...received]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
};
