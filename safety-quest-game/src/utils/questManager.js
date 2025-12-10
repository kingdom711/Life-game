import { questProgress, points, level, attendanceLogs, weeklyQuestProgress, streak } from './storage';
import { getQuestById, dailyQuests, weeklyQuests, monthlyQuests, allQuests } from '../data/questsData';

// KST 날짜 헬퍼
const getKSTDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstOffset = 9 * 60 * 60 * 1000;
    return new Date(utc + kstOffset);
};

const getKSTDateString = () => {
    return getKSTDate().toISOString().split('T')[0];
};

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return parseInt(`${d.getUTCFullYear()}${weekNo.toString().padStart(2, '0')}`);
};

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
    const completedQuests = [];

    // 모든 퀘스트를 순회하며 해당 액션과 관련된 퀘스트 찾기
    allQuests.forEach(quest => {
        // 역할 체크
        if (quest.role !== 'all' && quest.role !== role) return;

        // 액션 체크
        if (quest.requirement.action === action) {
            const result = updateQuestProgress(quest.id, amount);
            if (result.completed) {
                completedQuests.push({
                    quest,
                    reward: result.reward
                });
            }
        }
    });

    // 주간 퀘스트 누적 로직 (SRS 연동)
    // action을 quest_type으로 매핑
    let questType = null;
    if (action === 'submit_checklist') questType = 'SAFETY_CHECKLIST';
    if (action === 'report_risk') questType = 'REPORT_RISK';
    if (action === 'attend_tbm') questType = 'TBM_ATTENDANCE';

    if (questType) {
        const kstNow = getKSTDate();
        const weekNum = getWeekNumber(kstNow);
        weeklyQuestProgress.update(weekNum, questType, amount, 5); // 목표 5회 가정
    }

    return completedQuests;
};

// 출석 체크 로직 (KST 기준, Streak 계산)
export const checkAttendance = (userId) => {
    const kstNow = getKSTDate();
    const todayStr = kstNow.toISOString().split('T')[0];

    // 어제 날짜 계산
    const yesterday = new Date(kstNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastLog = attendanceLogs.getLastLog();

    // 이미 오늘 출석했는지 확인
    if (lastLog && lastLog.attendance_date === todayStr) {
        return { success: false, message: '이미 출석했습니다.', consecutiveDays: lastLog.consecutive_days };
    }

    let consecutiveDays = 1;

    if (lastLog) {
        if (lastLog.attendance_date === yesterdayStr) {
            // 연속 출석
            consecutiveDays = lastLog.consecutive_days + 1;
        } else {
            // 결석으로 인한 초기화
            consecutiveDays = 1;
        }
    }

    // 로그 저장
    attendanceLogs.add({
        user_id: userId,
        attendance_date: todayStr,
        consecutive_days: consecutiveDays,
        reward_status: 'PENDING'
    });

    // 기존 streak 스토리지 업데이트 (UI 호환성 유지)
    streak.set({
        current: consecutiveDays,
        longest: Math.max(streak.get().longest, consecutiveDays),
        lastLoginDate: kstNow.toISOString()
    });

    // 보상 지급 (기본 20P + 연속 출석 보너스)
    let bonus = 0;
    if (consecutiveDays % 7 === 0) bonus = 100; // 7일마다 보너스
    points.add(20 + bonus);

    return { success: true, message: '출석 완료!', consecutiveDays, bonus };
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

// 리셋 시간 체크 및 자동 리셋 (KST 적용)
export const checkAndResetQuests = () => {
    const lastReset = localStorage.getItem('safety_quest_last_reset');
    const now = getKSTDate(); // KST 사용

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
    getQuestProgress,
    checkAttendance // Export added
};
