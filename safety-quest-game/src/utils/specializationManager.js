/**
 * 전직(특수역할) 매니저
 * 기술인의 전직 시스템 핵심 비즈니스 로직
 *
 * 기능:
 * - 전직 조건 확인 (레벨, 교육 이수)
 * - 전직 교육 시작/완료 처리
 * - 전직 실행 (클래스 체인지)
 * - 전직 전환 (해금된 전직 간)
 * - 전직 보너스 조회
 */

import {
    specializationData,
    specializationProgress,
    specQuizAttempts,
    points,
    legalHours
} from './storage';

import { calculateLevel } from './pointsCalculator';

import {
    SPECIALIZATIONS,
    SPECIALIZATION_STATUS,
    getSpecializationById
} from '../data/specializationData';

import {
    getEducationsBySpecialization,
    getSpecializationEducationById,
    SPECIALIZATION_EDUCATION_CONFIG
} from '../data/specializationEducationData';

/**
 * 전직 조건 충족 여부 확인
 * @param {string} specId - 전직 ID
 * @returns {Object} { canStart, reasons[] }
 */
export const canStartSpecialization = (specId) => {
    const spec = getSpecializationById(specId);
    if (!spec) {
        return { canStart: false, reasons: ['존재하지 않는 전직입니다.'] };
    }

    // 이미 해금된 경우
    if (specializationData.isUnlocked(specId)) {
        return { canStart: false, reasons: ['이미 해금된 전직입니다.'], alreadyUnlocked: true };
    }

    const reasons = [];
    const currentLevel = calculateLevel();

    // 레벨 조건 확인
    if (currentLevel.rank < spec.unlockRequirements.minLevel) {
        reasons.push(`${spec.unlockRequirements.minLevelName} 이상 레벨이 필요합니다. (현재: ${currentLevel.name})`);
    }

    return {
        canStart: reasons.length === 0,
        reasons,
        currentLevel: currentLevel.name,
        requiredLevel: spec.unlockRequirements.minLevelName
    };
};

/**
 * 전직 상태 조회
 * @param {string} specId - 전직 ID
 * @returns {string} SPECIALIZATION_STATUS
 */
export const getSpecializationStatus = (specId) => {
    const activeSpec = specializationData.getActive();

    // 현재 활성 전직
    if (activeSpec === specId) {
        return SPECIALIZATION_STATUS.ACTIVE;
    }

    // 해금 완료
    if (specializationData.isUnlocked(specId)) {
        return SPECIALIZATION_STATUS.UNLOCKED;
    }

    const spec = getSpecializationById(specId);
    if (!spec) return SPECIALIZATION_STATUS.LOCKED;

    // 교육 진행 중인지 확인
    const specProgress = specializationProgress.getBySpecialization(specId);
    const hasAnyProgress = Object.keys(specProgress).length > 0;
    if (hasAnyProgress) {
        return SPECIALIZATION_STATUS.IN_PROGRESS;
    }

    // 시작 가능 여부
    const { canStart } = canStartSpecialization(specId);
    if (canStart) {
        return SPECIALIZATION_STATUS.AVAILABLE;
    }

    return SPECIALIZATION_STATUS.LOCKED;
};

/**
 * 전직 진행 상황 상세 조회
 * @param {string} specId - 전직 ID
 * @returns {Object} 진행 상황 데이터
 */
export const getSpecializationProgress = (specId) => {
    const spec = getSpecializationById(specId);
    if (!spec) return null;

    const status = getSpecializationStatus(specId);
    const requiredEduIds = spec.unlockRequirements.requiredEducations;
    const educations = getEducationsBySpecialization(specId);
    const specProgress = specializationProgress.getBySpecialization(specId);

    const educationDetails = educations.map(edu => ({
        id: edu.id,
        title: edu.title,
        order: edu.order,
        completed: specProgress[edu.id]?.completed === true,
        score: specProgress[edu.id]?.score || null,
        completedAt: specProgress[edu.id]?.completedAt || null
    }));

    const completedCount = educationDetails.filter(e => e.completed).length;
    const totalCount = requiredEduIds.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
        specId,
        specName: spec.name,
        specIcon: spec.icon,
        specColor: spec.color,
        status,
        completionRate,
        completedCount,
        totalCount,
        educations: educationDetails,
        canStart: canStartSpecialization(specId),
        isFullyCompleted: completedCount === totalCount && totalCount > 0
    };
};

/**
 * 모든 전직의 진행 상황 조회
 * @returns {Array} 각 전직의 진행 상황
 */
export const getAllSpecializationProgress = () => {
    return SPECIALIZATIONS.map(spec => getSpecializationProgress(spec.id));
};

/**
 * 전직 교육 시작
 * @param {string} specId - 전직 ID
 * @param {string} eduId - 교육 ID
 * @returns {Object} 시작 결과
 */
export const startSpecializationTraining = (specId, eduId) => {
    const spec = getSpecializationById(specId);
    if (!spec) {
        return { success: false, message: '존재하지 않는 전직입니다.' };
    }

    const education = getSpecializationEducationById(eduId);
    if (!education) {
        return { success: false, message: '존재하지 않는 교육 콘텐츠입니다.' };
    }

    // 이미 완료한 교육인지 확인
    if (specializationProgress.isEducationCompleted(specId, eduId)) {
        return { success: false, message: '이미 완료한 교육입니다.', alreadyCompleted: true };
    }

    // 레벨 조건 확인
    const { canStart, reasons } = canStartSpecialization(specId);
    if (!canStart && !specializationData.isUnlocked(specId)) {
        return { success: false, message: reasons[0] || '조건 미충족' };
    }

    return {
        success: true,
        message: '전직 교육을 시작합니다.',
        education,
        spec
    };
};

/**
 * 전직 교육 완료 처리
 * @param {string} specId - 전직 ID
 * @param {string} eduId - 교육 ID
 * @param {number} score - 퀴즈 점수 (%)
 * @returns {Object} 완료 결과
 */
export const completeSpecializationEducation = (specId, eduId, score) => {
    const education = getSpecializationEducationById(eduId);
    if (!education) {
        return { success: false, message: '존재하지 않는 교육입니다.' };
    }

    if (specializationProgress.isEducationCompleted(specId, eduId)) {
        return { success: false, alreadyCompleted: true, message: '이미 완료한 교육입니다.' };
    }

    const requiredScore = SPECIALIZATION_EDUCATION_CONFIG.REQUIRED_SCORE;
    const passed = score >= requiredScore;

    if (!passed) {
        return {
            success: false,
            passed: false,
            score,
            requiredScore,
            message: `합격 기준(${requiredScore}%)에 미달합니다. (득점: ${score}%)`
        };
    }

    // 교육 완료 기록
    specializationProgress.completeEducation(specId, eduId, score);

    // 보상 지급
    const pointsReward = education.points || SPECIALIZATION_EDUCATION_CONFIG.POINTS_REWARD;
    const expReward = education.exp || SPECIALIZATION_EDUCATION_CONFIG.EXP_REWARD;
    const legalHoursReward = education.legalHours || 0;
    points.add(pointsReward, '전직 교육', `${education.title} 이수 완료`);
    if (legalHoursReward > 0) {
        legalHours.add(legalHoursReward);
    }

    // 모든 교육 완료 확인
    const spec = getSpecializationById(specId);
    const allCompleted = specializationProgress.areAllEducationsCompleted(
        specId,
        spec.unlockRequirements.requiredEducations
    );

    return {
        success: true,
        passed: true,
        score,
        pointsReward,
        expReward,
        legalHoursReward,
        message: `교육 이수 완료! (+${pointsReward}P, +${expReward}EXP, +${legalHoursReward.toFixed(2)}h)`,
        allEducationsCompleted: allCompleted,
        canClassChange: allCompleted
    };
};

/**
 * 전직 실행 (클래스 체인지)
 * @param {string} specId - 전직 ID
 * @returns {Object} 전직 결과
 */
export const executeClassChange = (specId) => {
    const spec = getSpecializationById(specId);
    if (!spec) {
        return { success: false, message: '존재하지 않는 전직입니다.' };
    }

    // 이미 해금된 경우
    if (specializationData.isUnlocked(specId)) {
        return { success: false, message: '이미 해금된 전직입니다.' };
    }

    // 모든 교육 완료 확인
    const allCompleted = specializationProgress.areAllEducationsCompleted(
        specId,
        spec.unlockRequirements.requiredEducations
    );

    if (!allCompleted) {
        return { success: false, message: '필수 교육을 모두 이수해야 합니다.' };
    }

    // 전직 해금
    specializationData.unlock(specId);

    // 전직 보상 지급
    const reward = spec.classChangeReward;
    points.add(reward.points, '전직 완료', `${spec.name} 전직 보상`);

    return {
        success: true,
        message: `${spec.name}(으)로 전직이 완료되었습니다!`,
        spec,
        reward
    };
};

/**
 * 현재 활성 전직 조회
 * @returns {Object|null} 활성 전직 데이터
 */
export const getActiveSpecialization = () => {
    const activeId = specializationData.getActive();
    if (!activeId) return null;
    return getSpecializationById(activeId);
};

/**
 * 해금된 전직 목록 조회
 * @returns {Array} 해금된 전직 데이터 목록
 */
export const getUnlockedSpecializations = () => {
    const unlockedIds = specializationData.getUnlocked();
    return unlockedIds.map(id => getSpecializationById(id)).filter(Boolean);
};

/**
 * 전직 전환 (해금된 전직 간)
 * @param {string} specId - 전환할 전직 ID
 * @returns {Object} 전환 결과
 */
export const switchSpecialization = (specId) => {
    if (!specializationData.isUnlocked(specId)) {
        return { success: false, message: '해금되지 않은 전직입니다.' };
    }

    const currentActive = specializationData.getActive();
    if (currentActive === specId) {
        return { success: false, message: '이미 활성화된 전직입니다.' };
    }

    specializationData.setActive(specId);
    const spec = getSpecializationById(specId);

    return {
        success: true,
        message: `${spec.name}(으)로 전직을 전환했습니다.`,
        spec
    };
};

/**
 * 전직 해제 (기본 기술인으로 복귀)
 * @returns {Object} 해제 결과
 */
export const deactivateSpecialization = () => {
    specializationData.setActive(null);
    return {
        success: true,
        message: '기본 기술인으로 복귀했습니다.'
    };
};

/**
 * 현재 전직의 포인트 배율 조회
 * @returns {number} 포인트 배율 (기본 1.0)
 */
export const getPointMultiplier = () => {
    const active = getActiveSpecialization();
    if (!active) return 1.0;
    return active.bonuses?.pointMultiplier || 1.0;
};

/**
 * 전직 퀴즈 시도 가능 여부
 * @param {string} eduId - 교육 ID
 * @returns {Object} { canAttempt, remaining }
 */
export const canAttemptSpecQuiz = (eduId) => {
    const maxAttempts = SPECIALIZATION_EDUCATION_CONFIG.MAX_DAILY_ATTEMPTS;
    const canAttempt = specQuizAttempts.canAttempt(eduId, maxAttempts);
    const remaining = specQuizAttempts.getRemainingAttempts(eduId, maxAttempts);
    return { canAttempt, remaining, maxAttempts };
};

/**
 * 전직 퀴즈 제출
 * @param {string} specId - 전직 ID
 * @param {string} eduId - 교육 ID
 * @param {Array} answers - 사용자 답변 배열 (인덱스)
 * @returns {Object} 채점 결과
 */
export const submitSpecializationQuiz = (specId, eduId, answers) => {
    const education = getSpecializationEducationById(eduId);
    if (!education) {
        return { success: false, message: '존재하지 않는 교육입니다.' };
    }

    // 시도 횟수 확인
    const { canAttempt, remaining } = canAttemptSpecQuiz(eduId);
    if (!canAttempt) {
        return {
            success: false,
            message: '오늘 시도 횟수를 모두 사용했습니다. 내일 다시 도전하세요.',
            remainingAttempts: 0
        };
    }

    // 시도 횟수 증가
    specQuizAttempts.increment(eduId);

    // 채점
    const quiz = education.quiz;
    let correctCount = 0;
    const results = quiz.map((q, idx) => {
        const isCorrect = answers[idx] === q.correctAnswer;
        if (isCorrect) correctCount++;
        return {
            questionId: q.id,
            userAnswer: answers[idx],
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: q.explanation
        };
    });

    const score = Math.round((correctCount / quiz.length) * 100);
    const requiredScore = SPECIALIZATION_EDUCATION_CONFIG.REQUIRED_SCORE;
    const passed = score >= requiredScore;

    let completionResult = null;
    if (passed) {
        completionResult = completeSpecializationEducation(specId, eduId, score);
    }

    return {
        success: true,
        passed,
        score,
        requiredScore,
        correctCount,
        totalQuestions: quiz.length,
        results,
        remainingAttempts: remaining - 1,
        completionResult,
        message: passed
            ? `합격! (${score}%) ${completionResult?.message || ''}`
            : `불합격 (${score}%). ${requiredScore}% 이상이 필요합니다.`
    };
};

export default {
    canStartSpecialization,
    getSpecializationStatus,
    getSpecializationProgress,
    getAllSpecializationProgress,
    startSpecializationTraining,
    completeSpecializationEducation,
    executeClassChange,
    getActiveSpecialization,
    getUnlockedSpecializations,
    switchSpecialization,
    deactivateSpecialization,
    getPointMultiplier,
    canAttemptSpecQuiz,
    submitSpecializationQuiz
};
