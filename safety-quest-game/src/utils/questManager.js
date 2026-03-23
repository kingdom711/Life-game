import { questProgress, points, level, attendanceLogs, weeklyQuestProgress, dailyQuestSnapshots, streak, userProfile, storage, getKSTDateString, getKSTYesterdayString, getKSTDayOfWeek, getKSTDay, getKSTMonth } from './storage';
import { getQuestById, dailyQuests, weeklyQuests, monthlyQuests, allQuests, QUEST_TYPE } from '../data/questsData';
import { addPoints, addExperience } from './pointsCalculator';
import { trackQuestComplete } from './achievementManager';
import { addSeasonPoints } from './seasonManager';

const WEEKLY_COMPLETE_DAILY_TRACK_KEY = 'safety_quest_weekly_complete_daily_track';

const getWeekNumber = () => {
    const dateStr = getKSTDateString();
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return parseInt(`${d.getUTCFullYear()}${weekNo.toString().padStart(2, '0')}`);
};

// 퀘스트 진행도 업데이트
const getWeeklyCompleteDailyTrack = () => {
    return storage.get(WEEKLY_COMPLETE_DAILY_TRACK_KEY, {});
};

const setWeeklyCompleteDailyTrack = (track) => {
    storage.set(WEEKLY_COMPLETE_DAILY_TRACK_KEY, track);
};

// 일간 퀘스트를 새로 완료하면 주간 "7일의 기적" 진행도를 하루 1회 반영
export const applyDailyQuestCompletionToWeekly = () => {
    const todayStr = getKSTDateString();
    const userId = userProfile.getName() || 'guest';
    const track = getWeeklyCompleteDailyTrack();

    if (track[userId] === todayStr) {
        return false;
    }

    updateQuestProgress('weekly_complete_daily', 1);
    track[userId] = todayStr;
    setWeeklyCompleteDailyTrack(track);
    return true;
};

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
        if (quest.type === QUEST_TYPE.DAILY) {
            applyDailyQuestCompletionToWeekly();
        }
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

    // 업적 추적
    try { trackQuestComplete(); } catch (e) { /* silent */ }

    // 시즌 포인트 추가
    try { addSeasonPoints(quest.reward?.points || 10, 'quest'); } catch (e) { /* silent */ }

    return true;
};

// 퀘스트 보상 지급
const grantQuestReward = (quest) => {
    if (quest.reward.points) {
        addPoints(quest.reward.points, '퀘스트 완료', quest.title || quest.name || '퀘스트');
    }
    if (quest.reward.exp) {
        addExperience(quest.reward.exp);
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
        const weekNum = getWeekNumber();
        weeklyQuestProgress.update(weekNum, questType, amount, 5); // 목표 5회 가정
    }

    return completedQuests;
};

// 출석 체크 로직 (KST 기준, Streak 계산)
export const checkAttendance = (userId) => {
    const todayStr = getKSTDateString();
    const yesterdayStr = getKSTYesterdayString();

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
        lastLoginDate: todayStr
    });

    // 보상 지급 (기본 20P + 연속 출석 보너스)
    let bonus = 0;
    if (consecutiveDays % 7 === 0) bonus = 100; // 7일마다 보너스

    if (bonus > 0) {
        addPoints(20, '출석 체크', `${consecutiveDays}일 연속 출석`);
        addPoints(bonus, '출석 보너스', `${consecutiveDays}일 연속 출석 보너스`);
    } else {
        addPoints(20 + bonus, '출석 체크', `${consecutiveDays}일 연속 출석`);
    }

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

// 리셋 시간 체크 및 자동 리셋 (KST 자정 기준)
export const checkAndResetQuests = () => {
    const resetDates = storage.get('safety_quest_last_reset', null);
    const todayStr = getKSTDateString();       // "YYYY-MM-DD"
    const todayMonth = getKSTMonth();          // "YYYY-MM"
    const todayDayOfWeek = getKSTDayOfWeek();  // 0=일 ~ 6=토
    const todayDay = getKSTDay();              // 1~31

    if (!resetDates) {
        storage.set('safety_quest_last_reset', {
            daily: todayStr,
            weekly: todayStr,
            monthly: todayMonth
        });
        return;
    }

    // 일간 리셋 체크 (KST 자정 — 날짜 문자열이 다르면 리셋)
    if (todayStr !== resetDates.daily) {
        // 리셋 전 이전 날짜 스냅샷 저장 (안전장치)
        const prevDateStr = resetDates.daily;
        if (!dailyQuestSnapshots.getByDate(prevDateStr)) {
            const currentProgress = questProgress.get();
            const snapshotQuests = dailyQuests.map(q => ({
                id: q.id,
                title: q.title || '',
                isCompleted: currentProgress[q.id]?.completed || false
            }));
            dailyQuestSnapshots.save(prevDateStr, snapshotQuests);
        }
        dailyQuestSnapshots.cleanOldEntries(14);

        resetDailyQuests();
        resetDates.daily = todayStr;
    }

    // 주간 리셋 체크 (KST 기준 월요일이고, 저장된 날짜와 다르면)
    if (todayDayOfWeek === 1 && todayStr !== resetDates.weekly) {
        resetWeeklyQuests();
        resetDates.weekly = todayStr;
    }

    // 월간 리셋 체크 (KST 기준 매월 1일이고, 저장된 월과 다르면)
    const lastMonthStr = resetDates.monthly ? resetDates.monthly.substring(0, 7) : '';
    if (todayDay === 1 && todayMonth !== lastMonthStr) {
        resetMonthlyQuests();
        resetDates.monthly = todayMonth;
    }

    storage.set('safety_quest_last_reset', resetDates);
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
    applyDailyQuestCompletionToWeekly,
    resetDailyQuests,
    resetWeeklyQuests,
    resetMonthlyQuests,
    checkAndResetQuests,
    isQuestCompleted,
    getQuestProgress,
    checkAttendance // Export added
};
