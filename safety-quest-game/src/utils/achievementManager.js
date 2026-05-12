/**
 * 업적(Achievement) 관리 매니저
 * 업적 달성 추적, 체크, 보상 지급
 */

import { storage, streak, inventory, points, getKSTDateString } from './storage';
import { achievements, getAchievementById } from '../data/achievementData';
import { getInventoryItems } from './inventoryManager';

const ACHIEVEMENT_KEY = 'safety_quest_achievements';
const ACHIEVEMENT_STATS_KEY = 'safety_quest_achievement_stats';

// ===== 업적 진행 상태 관리 =====

const getAchievementState = () => {
    return storage.get(ACHIEVEMENT_KEY, {});
};

const setAchievementState = (state) => {
    storage.set(ACHIEVEMENT_KEY, state);
};

const getStats = () => {
    return storage.get(ACHIEVEMENT_STATS_KEY, {
        questTotal: 0,
        dailyPerfectDays: 0,
        hazardReports: 0,
        educationComplete: 0,
        quizPerfectStreak: 0,
        equipCount: 0,
        calibrationSuccess: 0,
        praiseSent: 0,
        praiseReceived: 0,
        earlyBirdCount: 0,
        nightOwlCount: 0,
        firstDayReport: false,
        speedRunDone: false
    });
};

const setStats = (stats) => {
    storage.set(ACHIEVEMENT_STATS_KEY, stats);
};

// ===== 업적 달성 여부 확인 =====

export const isAchievementUnlocked = (achievementId) => {
    const state = getAchievementState();
    return !!state[achievementId]?.unlocked;
};

export const getAchievementProgress = (achievementId) => {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return { current: 0, target: 0, percent: 0 };

    const stats = getStats();
    const current = getProgressValue(achievement.condition, stats);
    const target = achievement.condition.target;

    return {
        current: Math.min(current, target),
        target,
        percent: Math.min(100, Math.round((current / target) * 100))
    };
};

const getProgressValue = (condition, stats) => {
    switch (condition.type) {
        case 'streak': return streak.get().longest || streak.get().current || 0;
        case 'daily_perfect': return stats.dailyPerfectDays || 0;
        case 'quest_total': return stats.questTotal || 0;
        case 'hazard_report': return stats.hazardReports || 0;
        case 'education_complete': return stats.educationComplete || 0;
        case 'quiz_perfect_streak': return stats.quizPerfectStreak || 0;
        case 'equip_count': return stats.equipCount || 0;
        case 'calibration_success': return stats.calibrationSuccess || 0;
        case 'praise_sent': return stats.praiseSent || 0;
        case 'praise_received': return stats.praiseReceived || 0;
        case 'early_bird': return stats.earlyBirdCount || 0;
        case 'night_owl': return stats.nightOwlCount || 0;
        case 'first_day_report': return stats.firstDayReport ? 1 : 0;
        case 'speed_run': return stats.speedRunDone ? 1 : 0;
        case 'rare_items': {
            const items = getInventoryItems();
            return items.filter(i => ['rare', 'epic', 'legendary'].includes(i.rarity)).length;
        }
        case 'epic_full_set': {
            const items = getInventoryItems();
            return items.filter(i => ['epic', 'legendary'].includes(i.rarity)).length;
        }
        case 'legendary_items': {
            const items = getInventoryItems();
            return items.filter(i => i.rarity === 'legendary').length;
        }
        default: return 0;
    }
};

// ===== 업적 체크 및 잠금 해제 =====

/**
 * 모든 업적을 체크하고 새로 달성된 업적 목록을 반환
 * @returns {Array} 새로 달성된 업적 목록
 */
export const checkAllAchievements = () => {
    const state = getAchievementState();
    const stats = getStats();
    const newlyUnlocked = [];

    achievements.forEach(achievement => {
        if (state[achievement.id]?.unlocked) return;

        const current = getProgressValue(achievement.condition, stats);
        if (current >= achievement.condition.target) {
            state[achievement.id] = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                rewardClaimed: false
            };

            newlyUnlocked.push(achievement);
        }
    });

    if (newlyUnlocked.length > 0) {
        setAchievementState(state);
    }

    return newlyUnlocked;
};

// ===== 업적 보상 수령 =====

export const claimAchievementReward = (achievementId) => {
    const state = getAchievementState();
    const achievement = getAchievementById(achievementId);

    if (!achievement || !state[achievementId]?.unlocked || state[achievementId]?.rewardClaimed) {
        return { success: false, message: '보상을 수령할 수 없습니다.' };
    }

    // 보상 지급
    if (achievement.reward.points) {
        points.add(achievement.reward.points, '업적 보상', achievement.name);
    }

    state[achievementId].rewardClaimed = true;
    setAchievementState(state);

    return {
        success: true,
        reward: achievement.reward,
        message: `${achievement.name} 업적 보상을 수령했습니다!`
    };
};

// ===== 이벤트 트리거 함수들 =====

/**
 * 퀘스트 완료 시 호출
 */
export const trackQuestComplete = () => {
    const stats = getStats();
    stats.questTotal = (stats.questTotal || 0) + 1;

    // 시간 기반 히든 업적
    const now = new Date();
    const kstHour = (now.getUTCHours() + 9) % 24;
    if (kstHour < 6) stats.earlyBirdCount = (stats.earlyBirdCount || 0) + 1;
    if (kstHour >= 22) stats.nightOwlCount = (stats.nightOwlCount || 0) + 1;

    setStats(stats);
    return checkAllAchievements();
};

/**
 * 일일 퀘스트 퍼펙트 달성 시 호출
 */
export const trackDailyPerfect = () => {
    const stats = getStats();
    stats.dailyPerfectDays = (stats.dailyPerfectDays || 0) + 1;
    setStats(stats);
    return checkAllAchievements();
};

/**
 * 위험 신고 시 호출
 */
export const trackHazardReport = () => {
    const stats = getStats();
    stats.hazardReports = (stats.hazardReports || 0) + 1;

    // 첫날 신고 히든 업적 체크
    const joinDate = storage.get('safety_quest_join_date', null);
    const today = getKSTDateString();
    if (!joinDate) {
        storage.set('safety_quest_join_date', today);
        stats.firstDayReport = true;
    } else if (joinDate === today) {
        stats.firstDayReport = true;
    }

    setStats(stats);
    return checkAllAchievements();
};

/**
 * 교육 완료 시 호출
 */
export const trackEducationComplete = () => {
    const stats = getStats();
    stats.educationComplete = (stats.educationComplete || 0) + 1;
    setStats(stats);
    return checkAllAchievements();
};

/**
 * 퀴즈 결과 추적
 */
export const trackQuizResult = (isPerfect) => {
    const stats = getStats();
    if (isPerfect) {
        stats.quizPerfectStreak = (stats.quizPerfectStreak || 0) + 1;
    } else {
        stats.quizPerfectStreak = 0;
    }
    setStats(stats);
    return checkAllAchievements();
};

/**
 * 장비 착용 시 호출
 */
export const trackEquip = () => {
    const stats = getStats();
    stats.equipCount = (stats.equipCount || 0) + 1;
    setStats(stats);
    return checkAllAchievements();
};

/**
 * 검교정 성공 시 호출
 */
export const trackCalibrationSuccess = () => {
    const stats = getStats();
    stats.calibrationSuccess = (stats.calibrationSuccess || 0) + 1;
    setStats(stats);
    return checkAllAchievements();
};

/**
 * 칭찬 보내기 시 호출
 */
export const trackPraiseSent = () => {
    const stats = getStats();
    stats.praiseSent = (stats.praiseSent || 0) + 1;
    setStats(stats);
    return checkAllAchievements();
};

/**
 * 칭찬 받기 시 호출
 */
export const trackPraiseReceived = () => {
    const stats = getStats();
    stats.praiseReceived = (stats.praiseReceived || 0) + 1;
    setStats(stats);
    return checkAllAchievements();
};

// ===== 통계 조회 =====

export const getAchievementSummary = () => {
    const state = getAchievementState();
    const total = achievements.length;
    const unlocked = Object.values(state).filter(s => s.unlocked).length;
    const unclaimed = Object.entries(state).filter(([, s]) => s.unlocked && !s.rewardClaimed).length;

    return { total, unlocked, unclaimed, percent: Math.round((unlocked / total) * 100) };
};

export const getAllAchievementsWithStatus = () => {
    const state = getAchievementState();
    const stats = getStats();

    return achievements.map(a => {
        const current = getProgressValue(a.condition, stats);
        const unlocked = !!state[a.id]?.unlocked;
        const rewardClaimed = !!state[a.id]?.rewardClaimed;

        return {
            ...a,
            unlocked,
            rewardClaimed,
            unlockedAt: state[a.id]?.unlockedAt || null,
            progress: {
                current: Math.min(current, a.condition.target),
                target: a.condition.target,
                percent: Math.min(100, Math.round((current / a.condition.target) * 100))
            }
        };
    });
};

export default {
    isAchievementUnlocked,
    getAchievementProgress,
    checkAllAchievements,
    claimAchievementReward,
    trackQuestComplete,
    trackDailyPerfect,
    trackHazardReport,
    trackEducationComplete,
    trackQuizResult,
    trackEquip,
    trackCalibrationSuccess,
    trackPraiseSent,
    trackPraiseReceived,
    getAchievementSummary,
    getAllAchievementsWithStatus
};
