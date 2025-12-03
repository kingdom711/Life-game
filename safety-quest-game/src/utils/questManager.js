import { questProgress, points, level } from './storage';
import { getQuestById, dailyQuests, weeklyQuests, monthlyQuests } from '../data/questsData';

// 퀘스트 진행도 업데이트
export const updateQuestProgress = (questId, increment = 1) => {
    const quest = getQuestById(questId);
    if (!quest) return false;

    const progress = questProgress.getQuestProgress(questId);
    const target = quest.requirement.target || 1;
    const newCurrent = Math.min(progress.current + increment, target);
    const completed = newCurrent >= target;

    questProgress.updateQuestProgress(questId, newCurrent, completed);

    // 퀘스트 완료 시 보상 지급
    if (completed && !progress.completed) {
        grantQuestReward(quest);
        return { completed: true, reward: quest.reward };
    }

    return { completed: false, progress: newCurrent, target };
};

// 퀘스트 완료 처리
export const completeQuest = (questId) => {
    const quest = getQuestById(questId);
    if (!quest) return false;

    const progress = questProgress.getQuestProgress(questId);
    if (progress.completed) {
        return false; // 이미 완료됨
    }

    questProgress.completeQuest(questId);
    grantQuestReward(quest);

    return true;
};

// 퀘스트 보상 지급
const grantQuestReward = (quest) => {
    if (quest.reward.points) {
        points.add(quest.reward.points);
    }
    if (quest.reward.exp) {
        level.addExp(quest.reward.exp);
    }
};

// 특정 액션으로 관련 퀘스트 진행도 업데이트
export const triggerQuestAction = (action, role, amount = 1) => {
    const allProgress = questProgress.get();
    const completedQuests = [];

    // 해당 액션과 관련된 모든 퀘스트 찾기
    Object.keys(allProgress).forEach(questId => {
        const quest = getQuestById(questId);
        if (!quest) return;

        // 역할 체크
        if (quest.role !== 'all' && quest.role !== role) return;

        // 액션 체크
        if (quest.requirement.action === action) {
            const result = updateQuestProgress(questId, amount);
            if (result.completed) {
                completedQuests.push({
                    quest,
                    reward: result.reward
                });
            }
        }
    });

    return completedQuests;
};

// 일간 퀘스트 리셋
export const resetDailyQuests = () => {
    const questIds = dailyQuests.map(q => q.id);
    questProgress.resetQuests(questIds);
};

// 주간 퀘스트 리셋
export const resetWeeklyQuests = () => {
    const questIds = weeklyQuests.map(q => q.id);
    questProgress.resetQuests(questIds);
};

// 월간 퀘스트 리셋
export const resetMonthlyQuests = () => {
    const questIds = monthlyQuests.map(q => q.id);
    questProgress.resetQuests(questIds);
};

// 리셋 시간 체크 및 자동 리셋
export const checkAndResetQuests = () => {
    const lastReset = localStorage.getItem('safety_quest_last_reset');
    const now = new Date();

    if (!lastReset) {
        localStorage.setItem('safety_quest_last_reset', JSON.stringify({
            daily: now.toISOString(),
            weekly: now.toISOString(),
            monthly: now.toISOString()
        }));
        return;
    }

    const resetDates = JSON.parse(lastReset);
    const lastDaily = new Date(resetDates.daily);
    const lastWeekly = new Date(resetDates.weekly);
    const lastMonthly = new Date(resetDates.monthly);

    // 일간 리셋 체크 (자정)
    if (now.getDate() !== lastDaily.getDate() ||
        now.getMonth() !== lastDaily.getMonth() ||
        now.getFullYear() !== lastDaily.getFullYear()) {
        resetDailyQuests();
        resetDates.daily = now.toISOString();
    }

    // 주간 리셋 체크 (월요일)
    if (now.getDay() === 1 && now.getTime() - lastWeekly.getTime() > 24 * 60 * 60 * 1000) {
        resetWeeklyQuests();
        resetDates.weekly = now.toISOString();
    }

    // 월간 리셋 체크 (매월 1일)
    if (now.getDate() === 1 && now.getMonth() !== lastMonthly.getMonth()) {
        resetMonthlyQuests();
        resetDates.monthly = now.toISOString();
    }

    localStorage.setItem('safety_quest_last_reset', JSON.stringify(resetDates));
};

// 퀘스트 완료 상태 확인
export const isQuestCompleted = (questId) => {
    const progress = questProgress.getQuestProgress(questId);
    return progress.completed;
};

// 퀘스트 진행률 가져오기
export const getQuestProgress = (questId) => {
    const quest = getQuestById(questId);
    if (!quest) return 0;

    const progress = questProgress.getQuestProgress(questId);
    const target = quest.requirement.target || 1;

    return Math.min(100, Math.round((progress.current / target) * 100));
};

export default {
    updateQuestProgress,
    completeQuest,
    triggerQuestAction,
    resetDailyQuests,
    resetWeeklyQuests,
    resetMonthlyQuests,
    checkAndResetQuests,
    isQuestCompleted,
    getQuestProgress
};
