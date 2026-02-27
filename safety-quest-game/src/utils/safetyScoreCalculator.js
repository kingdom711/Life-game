/**
 * 사업장 안전 점수 산출기 (Safety Score Calculator)
 *
 * 기획서 4-7: 사업장 전체의 안전 수준을 0~100점으로 시각화
 *
 * 5개 카테고리:
 * 1. 교육 이수율 (30점) - 최근 7일 교육 완료 비율
 * 2. 퀴즈 평균 점수 (20점) - 전체 퀴즈 평균
 * 3. 체크리스트 작성률 (20점) - 최근 7일 작성 비율
 * 4. 위험 발견·해결 건수 (20점) - 위험 발견 및 조치 기록
 * 5. 연속 참여율 (10점) - 출석 스트릭 및 월간 참여
 */

import { educationHistory, streak, hazardLogs, hazardIdentificationLogs, actionRecords } from './storage';

const SCORE_HISTORY_KEY = 'safety_quest_safety_score_history';
const CATEGORY_MAX_SCORES = {
    education: 30,
    quiz: 20,
    checklist: 20,
    hazard: 20,
    participation: 10
};

/**
 * localStorage에서 scoped 데이터 가져오기 (범용 헬퍼)
 */
const getStorageData = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            // scoped key 시도
            const keys = Object.keys(localStorage);
            const scopedKey = keys.find(k => k.endsWith(`:${key}`));
            if (scopedKey) {
                return JSON.parse(localStorage.getItem(scopedKey)) || defaultValue;
            }
            return defaultValue;
        }
        return JSON.parse(data) || defaultValue;
    } catch {
        return defaultValue;
    }
};

/**
 * 최근 N일간의 날짜 목록 생성 (YYYY-MM-DD)
 */
const getRecentDates = (days) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
};

/**
 * 1. 교육 이수율 (30점 만점)
 * 최근 7일간 교육 완료 비율
 */
const calculateEducationScore = () => {
    const history = educationHistory.get();
    const recentDates = getRecentDates(7);

    let completedDays = 0;
    recentDates.forEach(date => {
        const completed = history.some(record =>
            record.completedAt && record.completedAt.split('T')[0] === date
        );
        if (completed) completedDays++;
    });

    const rate = completedDays / 7;
    const score = Math.round(rate * CATEGORY_MAX_SCORES.education);

    return {
        score,
        maxScore: CATEGORY_MAX_SCORES.education,
        rate: Math.round(rate * 100),
        detail: `최근 7일 중 ${completedDays}일 이수`,
        label: '교육 이수율'
    };
};

/**
 * 2. 퀴즈 평균 점수 (20점 만점)
 * 최근 교육 기록의 퀴즈 평균 (80점 이상 시 만점)
 */
const calculateQuizScore = () => {
    const history = educationHistory.get();
    const recentHistory = history.slice(-20); // 최근 20건

    if (recentHistory.length === 0) {
        return {
            score: 0,
            maxScore: CATEGORY_MAX_SCORES.quiz,
            rate: 0,
            detail: '퀴즈 기록 없음',
            label: '퀴즈 평균 점수'
        };
    }

    const avgQuizScore = recentHistory.reduce((sum, r) => sum + (r.quizScore || 0), 0) / recentHistory.length;
    // 80점 이상이면 만점, 0~80점은 비례 배점
    const rate = Math.min(avgQuizScore / 80, 1);
    const score = Math.round(rate * CATEGORY_MAX_SCORES.quiz);

    return {
        score,
        maxScore: CATEGORY_MAX_SCORES.quiz,
        rate: Math.round(avgQuizScore),
        detail: `평균 ${Math.round(avgQuizScore)}점 (최근 ${recentHistory.length}건)`,
        label: '퀴즈 평균 점수'
    };
};

/**
 * 3. 체크리스트 작성률 (20점 만점)
 * 최근 7일간 체크리스트 작성 비율
 */
const calculateChecklistScore = () => {
    const checklists = getStorageData('safety_quest_checklists', []);
    const recentDates = getRecentDates(7);

    let completedDays = 0;
    recentDates.forEach(date => {
        const hasChecklist = checklists.some(cl =>
            cl.createdAt && cl.createdAt.split('T')[0] === date
        );
        if (hasChecklist) completedDays++;
    });

    const rate = completedDays / 7;
    const score = Math.round(rate * CATEGORY_MAX_SCORES.checklist);

    return {
        score,
        maxScore: CATEGORY_MAX_SCORES.checklist,
        rate: Math.round(rate * 100),
        detail: `최근 7일 중 ${completedDays}일 작성`,
        label: '체크리스트 작성률'
    };
};

/**
 * 4. 위험 발견·해결 건수 (20점 만점)
 * 최근 7일간 위험 발견 및 조치 기록
 */
const calculateHazardScore = () => {
    const logs = hazardLogs.get();
    const idLogs = hazardIdentificationLogs.get();
    const records = actionRecords.get();
    const recentDates = getRecentDates(7);

    // 최근 7일 위험 발견 건수
    const recentHazards = logs.filter(log =>
        log.questDate && recentDates.includes(log.questDate)
    ).length;

    const recentIdentifications = idLogs.filter(log =>
        log.timestamp && recentDates.includes(log.timestamp.split('T')[0])
    ).length;

    const recentActions = records.filter(record =>
        record.createdAt && recentDates.includes(record.createdAt.split('T')[0])
    ).length;

    const totalActivity = recentHazards + recentIdentifications + recentActions;

    // 주간 목표: 7건 (하루 1건) 이상이면 만점
    const targetCount = 7;
    const rate = Math.min(totalActivity / targetCount, 1);
    const score = Math.round(rate * CATEGORY_MAX_SCORES.hazard);

    return {
        score,
        maxScore: CATEGORY_MAX_SCORES.hazard,
        rate: Math.round(rate * 100),
        detail: `최근 7일간 ${totalActivity}건 (발견 ${recentHazards + recentIdentifications}, 조치 ${recentActions})`,
        label: '위험 발견·해결'
    };
};

/**
 * 5. 연속 참여율 (10점 만점)
 * 현재 스트릭 기반 + 월간 출석
 */
const calculateParticipationScore = () => {
    const streakData = streak.get();
    const currentStreak = streakData.current || 0;

    // 스트릭 28일 이상이면 만점
    const targetStreak = 28;
    const rate = Math.min(currentStreak / targetStreak, 1);
    const score = Math.round(rate * CATEGORY_MAX_SCORES.participation);

    return {
        score,
        maxScore: CATEGORY_MAX_SCORES.participation,
        rate: Math.round(rate * 100),
        detail: `연속 ${currentStreak}일 참여`,
        label: '연속 참여율'
    };
};

/**
 * 전체 안전 점수 계산
 */
export const calculateSafetyScore = () => {
    const categories = {
        education: calculateEducationScore(),
        quiz: calculateQuizScore(),
        checklist: calculateChecklistScore(),
        hazard: calculateHazardScore(),
        participation: calculateParticipationScore()
    };

    const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);

    return {
        totalScore,
        maxScore: 100,
        categories,
        calculatedAt: new Date().toISOString()
    };
};

/**
 * 안전 점수 히스토리 저장 (매일 1회 스냅샷)
 */
export const saveSafetyScoreSnapshot = (scoreData) => {
    try {
        const history = getStorageData(SCORE_HISTORY_KEY, []);
        const today = new Date().toISOString().split('T')[0];

        // 오늘 이미 저장된 스냅샷이 있으면 업데이트
        const existingIndex = history.findIndex(h => h.date === today);
        const snapshot = {
            date: today,
            totalScore: scoreData.totalScore,
            categories: Object.fromEntries(
                Object.entries(scoreData.categories).map(([key, val]) => [key, val.score])
            )
        };

        if (existingIndex >= 0) {
            history[existingIndex] = snapshot;
        } else {
            history.push(snapshot);
        }

        // 최근 30일만 유지
        const trimmed = history.slice(-30);
        localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(trimmed));

        return trimmed;
    } catch {
        return [];
    }
};

/**
 * 안전 점수 히스토리 가져오기
 */
export const getSafetyScoreHistory = () => {
    return getStorageData(SCORE_HISTORY_KEY, []);
};

/**
 * 주간 점수 추이 (최근 4주)
 */
export const getWeeklyTrend = () => {
    const history = getSafetyScoreHistory();
    if (history.length === 0) return [];

    const weeks = [];
    for (let w = 3; w >= 0; w--) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];

        const weekScores = history.filter(h =>
            h.date >= weekStartStr && h.date <= weekEndStr
        );

        const avgScore = weekScores.length > 0
            ? Math.round(weekScores.reduce((sum, h) => sum + h.totalScore, 0) / weekScores.length)
            : null;

        weeks.push({
            label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}~${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`,
            avgScore
        });
    }

    return weeks;
};

/**
 * 개선 제안 생성 (가장 낮은 카테고리 기반)
 */
export const getImprovementSuggestion = (categories) => {
    const suggestions = {
        education: '매일 안전 교육을 빠짐없이 이수하면 점수가 크게 올라갑니다.',
        quiz: '퀴즈에서 더 높은 점수를 받으면 안전 지식이 향상됩니다. 오답 해설을 꼼꼼히 확인하세요.',
        checklist: '매일 안전 체크리스트를 작성하면 점수가 올라갑니다. 작업 시작 전 점검을 습관화하세요.',
        hazard: '위험요인을 적극적으로 발견하고 조치 기록을 남기면 점수가 향상됩니다.',
        participation: '매일 꾸준히 접속하여 스트릭을 이어가면 참여율 점수가 올라갑니다.'
    };

    // 가장 낮은 비율의 카테고리 찾기
    let lowestKey = 'education';
    let lowestRate = Infinity;

    Object.entries(categories).forEach(([key, cat]) => {
        const rate = cat.score / cat.maxScore;
        if (rate < lowestRate) {
            lowestRate = rate;
            lowestKey = key;
        }
    });

    return {
        category: lowestKey,
        categoryLabel: categories[lowestKey].label,
        suggestion: suggestions[lowestKey],
        currentScore: categories[lowestKey].score,
        maxScore: categories[lowestKey].maxScore
    };
};

/**
 * 지난주 대비 점수 변화량 계산
 */
export const getScoreChange = () => {
    const history = getSafetyScoreHistory();
    if (history.length < 2) return null;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const todayScore = history.find(h => h.date === today)?.totalScore;
    const weekAgoScore = history.find(h => h.date === weekAgoStr)?.totalScore;

    if (todayScore == null || weekAgoScore == null) {
        // 가장 최근 두 기록 비교
        const recent = history.slice(-2);
        if (recent.length < 2) return null;
        return recent[1].totalScore - recent[0].totalScore;
    }

    return todayScore - weekAgoScore;
};
