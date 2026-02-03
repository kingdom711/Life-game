/**
 * 교육 관리자 (Education Manager)
 * 마이크로 러닝 기반 스마트 안전 교육 시스템의 핵심 로직
 * 
 * 기능:
 * - 오늘의 교육 콘텐츠 제공
 * - 시청 시간 추적 및 검증
 * - 퀴즈 채점 및 합격 판정
 * - 작업 권한 체크 (교육 완료 여부)
 * - 법정 교육 시간 누적 관리
 * - 이수 증명서 생성
 */

import {
    educationProgress,
    educationHistory,
    legalHours,
    quizAttempts,
    points,
    level,
    questProgress,
    LEGAL_EDUCATION_REQUIREMENTS
} from './storage';

import {
    getTodayEducation,
    getEducationById,
    getAllEducations,
    CATEGORY_INFO
} from '../data/educationData';

/**
 * 오늘의 교육 콘텐츠 가져오기
 * @returns {Object} 오늘의 교육 콘텐츠
 */
export const getTodayEducationContent = () => {
    return getTodayEducation();
};

/**
 * 교육 시작하기
 * @param {string} educationId - 교육 ID
 * @returns {Object} 교육 진행 상태
 */
export const startEducation = (educationId) => {
    const education = getEducationById(educationId);
    if (!education) {
        throw new Error('교육 콘텐츠를 찾을 수 없습니다.');
    }

    // 이미 오늘 완료한 교육인지 확인
    if (educationHistory.hasCompletedToday(educationId)) {
        return {
            success: false,
            message: '이미 오늘 완료한 교육입니다.',
            alreadyCompleted: true
        };
    }

    const progress = educationProgress.startEducation(educationId);

    return {
        success: true,
        message: '교육을 시작합니다.',
        education: education,
        progress: progress
    };
};

/**
 * 시청 시간 업데이트
 * @param {number} currentTime - 현재 시청 시간 (초)
 * @param {number} maxAllowedJump - 허용 최대 점프 시간 (초, 빨리감기 방지)
 * @returns {Object} 업데이트 결과
 */
export const updateWatchTime = (currentTime, maxAllowedJump = 5) => {
    const progress = educationProgress.get();

    if (!progress.currentEducationId) {
        return { success: false, message: '진행 중인 교육이 없습니다.' };
    }

    // 빨리감기 감지 (이전 최대 시청 위치보다 5초 이상 큰 점프)
    if (currentTime > progress.maxWatchedTime + maxAllowedJump) {
        // 빨리감기 시도 - 이전 최대 위치로 제한
        return {
            success: false,
            message: '빨리감기가 감지되었습니다.',
            seekBack: true,
            allowedTime: progress.maxWatchedTime + maxAllowedJump
        };
    }

    const updatedProgress = educationProgress.updateWatchTime(currentTime);

    return {
        success: true,
        progress: updatedProgress
    };
};

/**
 * 영상 시청 완료 검증
 * @param {number} watchedTime - 현재 세션 시청 시간 (초)
 * @returns {Object} 검증 결과
 */
export const completeVideo = (watchedTime) => {
    const progress = educationProgress.get();

    if (!progress.currentEducationId) {
        return { success: false, message: '진행 중인 교육이 없습니다.' };
    }

    const education = getEducationById(progress.currentEducationId);
    if (!education) {
        return { success: false, message: '교육 콘텐츠를 찾을 수 없습니다.' };
    }

    // 누적 시청 시간 사용 (여러 번 시청해도 합산)
    const cumulativeTime = progress.cumulativeWatchedTime || watchedTime;

    // 90% 이상 시청했는지 확인 (누적 기준)
    if (cumulativeTime < education.requiredWatchTime) {
        const remainingTime = education.requiredWatchTime - cumulativeTime;
        const remainingMinutes = Math.ceil(remainingTime / 60);
        return {
            success: false,
            message: `영상을 ${remainingMinutes}분 더 시청해야 합니다. (누적 ${Math.floor(cumulativeTime / 60)}분 / 필요 ${Math.floor(education.requiredWatchTime / 60)}분)`,
            requiredTime: education.requiredWatchTime,
            currentTime: cumulativeTime,
            isCumulative: true
        };
    }

    educationProgress.completeVideo();

    return {
        success: true,
        message: '영상 시청을 완료했습니다. 퀴즈를 풀어주세요.',
        canStartQuiz: true
    };
};

/**
 * 퀴즈 제출 및 채점
 * @param {string} educationId - 교육 ID
 * @param {Object} answers - 답안 { questionId: selectedIndex }
 * @returns {Object} 채점 결과
 */
export const submitQuiz = (educationId, answers) => {
    const education = getEducationById(educationId);
    if (!education) {
        return { success: false, message: '교육 콘텐츠를 찾을 수 없습니다.' };
    }

    const progress = educationProgress.get();

    // 영상 시청 완료 확인
    if (!progress.videoCompleted) {
        return { success: false, message: '영상을 먼저 시청해주세요.' };
    }

    // 시도 횟수 확인
    if (!quizAttempts.canAttempt(educationId)) {
        return {
            success: false,
            message: '오늘 퀴즈 시도 횟수(3회)를 모두 사용했습니다. 내일 다시 도전해주세요.',
            noMoreAttempts: true
        };
    }

    // 시도 횟수 증가
    quizAttempts.increment(educationId);

    // 채점
    let correctCount = 0;
    const results = education.quiz.map((question) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;

        return {
            questionId: question.id,
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            explanation: question.explanation
        };
    });

    const totalQuestions = education.quiz.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= education.requiredScore;

    // 진행 상태 업데이트
    educationProgress.completeQuiz(score, passed);

    const remainingAttempts = quizAttempts.getRemainingAttempts(educationId);

    if (passed) {
        // 교육 완료 처리
        const completionResult = completeEducation(educationId, score);

        return {
            success: true,
            passed: true,
            score: score,
            correctCount: correctCount,
            totalQuestions: totalQuestions,
            results: results,
            message: `축하합니다! ${score}점으로 합격했습니다.`,
            rewards: completionResult.rewards
        };
    } else {
        return {
            success: true,
            passed: false,
            score: score,
            correctCount: correctCount,
            totalQuestions: totalQuestions,
            results: results,
            remainingAttempts: remainingAttempts,
            message: `${score}점으로 불합격입니다. ${education.requiredScore}점 이상이 필요합니다. (남은 시도: ${remainingAttempts}회)`
        };
    }
};

/**
 * 교육 완료 처리 (보상 지급)
 * @param {string} educationId - 교육 ID
 * @param {number} quizScore - 퀴즈 점수
 * @returns {Object} 완료 결과 및 보상
 */
const completeEducation = (educationId, quizScore) => {
    const education = getEducationById(educationId);
    const progress = educationProgress.get();

    // 기본 보상
    let pointsReward = education.points;
    let expReward = education.exp;

    // 퀴즈 점수 보너스 (100점 시 20% 추가)
    if (quizScore === 100) {
        pointsReward = Math.floor(pointsReward * 1.2);
        expReward = Math.floor(expReward * 1.2);
    }

    // 포인트 지급
    points.add(pointsReward, '교육 완료', `${education.title} 완료`);

    // 경험치 지급
    level.addExp(expReward);

    // 교육 이력에 추가
    educationHistory.addCompleted({
        educationId: educationId,
        title: education.title,
        category: education.category,
        watchedTime: progress.maxWatchedTime,
        legalHours: education.legalHours,
        quizScore: quizScore,
        pointsEarned: pointsReward,
        expEarned: expReward
    });

    // 일일 교육 퀘스트 완료 처리
    questProgress.updateQuestProgress('daily_education_1', 1, true);

    // 진행 상태 초기화
    educationProgress.reset();

    return {
        success: true,
        rewards: {
            points: pointsReward,
            exp: expReward,
            legalHours: education.legalHours
        }
    };
};

/**
 * 오늘 교육 완료 여부 확인
 * @returns {boolean} 오늘 교육 완료 여부
 */
export const hasCompletedTodayEducation = () => {
    const todayCompleted = educationHistory.getTodayCompleted();
    return todayCompleted.length > 0;
};

/**
 * 작업 권한 체크 (교육 완료 여부)
 * 주요 기능 접근 시 호출
 * @returns {Object} 권한 상태
 */
export const checkWorkPermission = () => {
    const completed = hasCompletedTodayEducation();

    if (completed) {
        return {
            hasPermission: true,
            message: '오늘의 안전 교육을 완료했습니다.'
        };
    }

    const todayEducation = getTodayEducation();

    return {
        hasPermission: false,
        message: '오늘의 안전 교육을 먼저 완료해주세요.',
        educationRequired: true,
        education: {
            id: todayEducation.id,
            title: todayEducation.title,
            duration: Math.ceil(todayEducation.duration / 60) // 분
        }
    };
};

/**
 * 법정 교육 시간 진행 상황 조회
 * @returns {Object} 법정 교육 시간 정보
 */
export const getLegalHoursProgress = () => {
    const currentYearHours = legalHours.getCurrentYearHours();
    const currentQuarterHours = legalHours.getCurrentQuarterHours();
    const completionRate = legalHours.getCompletionRate();
    const hasMetRequirement = legalHours.hasMetRequirement();

    return {
        currentYearHours: currentYearHours.toFixed(2),
        requiredHours: LEGAL_EDUCATION_REQUIREMENTS.ANNUAL_HOURS,
        currentQuarterHours: currentQuarterHours.toFixed(2),
        completionRate: completionRate.toFixed(1),
        hasMetRequirement: hasMetRequirement,
        remainingHours: Math.max(0, LEGAL_EDUCATION_REQUIREMENTS.ANNUAL_HOURS - currentYearHours).toFixed(2)
    };
};

/**
 * 교육 통계 조회
 * @returns {Object} 교육 통계
 */
export const getEducationStats = () => {
    const history = educationHistory.get();
    const categoryStats = educationHistory.getStatsByCategory();
    const legalProgress = getLegalHoursProgress();

    // 총 완료 교육 수
    const totalCompleted = history.length;

    // 이번 달 완료 교육 수
    const thisMonthCompleted = educationHistory.getThisMonthCompleted().length;

    // 평균 퀴즈 점수
    const avgScore = history.length > 0
        ? Math.round(history.reduce((sum, r) => sum + r.quizScore, 0) / history.length)
        : 0;

    // 총 획득 포인트
    const totalPoints = history.reduce((sum, r) => sum + r.pointsEarned, 0);

    // 연속 교육 일수 계산
    let educationStreak = 0;
    const today = new Date();
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.completedAt) - new Date(a.completedAt)
    );

    for (let i = 0; i < sortedHistory.length; i++) {
        const recordDate = new Date(sortedHistory[i].completedAt);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (recordDate.toDateString() === expectedDate.toDateString()) {
            educationStreak++;
        } else {
            break;
        }
    }

    return {
        totalCompleted,
        thisMonthCompleted,
        avgScore,
        totalPoints,
        educationStreak,
        categoryStats,
        legalProgress
    };
};

/**
 * 이수 증명서 데이터 생성
 * @returns {Object|null} 증명서 데이터 (법정 시간 미달 시 null)
 */
export const generateCertificate = () => {
    const legalProgress = getLegalHoursProgress();

    if (!legalProgress.hasMetRequirement) {
        return {
            success: false,
            message: `법정 교육 시간이 부족합니다. (${legalProgress.remainingHours}시간 추가 필요)`,
            certificate: null
        };
    }

    const stats = getEducationStats();
    const now = new Date();

    // 증명서 데이터
    const certificate = {
        certificateId: `CERT-${now.getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        issueDate: now.toISOString(),
        validYear: now.getFullYear(),
        userName: localStorage.getItem('safety_quest_user_profile')
            ? JSON.parse(localStorage.getItem('safety_quest_user_profile')).name || '사용자'
            : '사용자',
        companyName: localStorage.getItem('companyName') || '',
        totalEducationHours: legalProgress.currentYearHours,
        completedCourses: stats.totalCompleted,
        averageScore: stats.avgScore,
        categories: Object.keys(stats.categoryStats).map(cat => ({
            name: CATEGORY_INFO[cat]?.name || cat,
            hours: stats.categoryStats[cat].totalHours.toFixed(2)
        })),
        legalRequirement: {
            required: LEGAL_EDUCATION_REQUIREMENTS.ANNUAL_HOURS,
            completed: legalProgress.currentYearHours,
            status: 'COMPLETED'
        }
    };

    return {
        success: true,
        message: '이수 증명서가 생성되었습니다.',
        certificate
    };
};

/**
 * 교육 진행 상태 조회
 * @returns {Object} 현재 진행 상태
 */
export const getCurrentProgress = () => {
    const progress = educationProgress.get();

    if (!progress.currentEducationId) {
        return {
            inProgress: false,
            education: null,
            progress: null
        };
    }

    const education = getEducationById(progress.currentEducationId);

    return {
        inProgress: true,
        education: education,
        progress: {
            watchedTime: progress.watchedTime,
            maxWatchedTime: progress.maxWatchedTime,
            watchProgress: education
                ? Math.round((progress.maxWatchedTime / education.duration) * 100)
                : 0,
            videoCompleted: progress.videoCompleted,
            quizCompleted: progress.quizCompleted,
            quizScore: progress.quizScore
        }
    };
};

/**
 * 모든 교육 목록 조회 (완료 상태 포함)
 * @returns {Array} 교육 목록
 */
export const getAllEducationsWithStatus = () => {
    const allEducations = getAllEducations();
    const history = educationHistory.get();

    return allEducations.map(edu => {
        const completedRecords = history.filter(h => h.educationId === edu.id);
        const lastCompleted = completedRecords.length > 0
            ? completedRecords[completedRecords.length - 1]
            : null;

        return {
            ...edu,
            completedCount: completedRecords.length,
            lastCompletedAt: lastCompleted?.completedAt || null,
            lastScore: lastCompleted?.quizScore || null,
            categoryInfo: CATEGORY_INFO[edu.category]
        };
    });
};

/**
 * 교육별 누적 시청 시간 조회
 * @param {string} educationId - 교육 ID
 * @returns {number} 누적 시청 시간 (초)
 */
export const getCumulativeWatchTime = (educationId) => {
    return educationProgress.getCumulativeWatchTime(educationId);
};

/**
 * 교육별 누적 시청 시간 저장
 * @param {string} educationId - 교육 ID
 * @param {number} totalWatchedTime - 총 누적 시청 시간 (초)
 */
export const saveCumulativeWatchTime = (educationId, totalWatchedTime) => {
    const CUMULATIVE_KEY = 'safety_quest_cumulative_watch_time';
    const data = JSON.parse(localStorage.getItem(CUMULATIVE_KEY) || '{}');

    // 기존 값보다 크면 업데이트
    if (totalWatchedTime > (data[educationId] || 0)) {
        data[educationId] = totalWatchedTime;
        localStorage.setItem(CUMULATIVE_KEY, JSON.stringify(data));
    }

    return data[educationId];
};

export default {
    getTodayEducationContent,
    startEducation,
    updateWatchTime,
    completeVideo,
    submitQuiz,
    hasCompletedTodayEducation,
    checkWorkPermission,
    getLegalHoursProgress,
    getEducationStats,
    generateCertificate,
    getCurrentProgress,
    getAllEducationsWithStatus
};
