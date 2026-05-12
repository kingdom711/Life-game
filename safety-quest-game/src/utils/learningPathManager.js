/**
 * 학습 경로 매니저
 * - 진행 상태 관리
 * - 단계 해금/완료 처리
 * - 보상 지급
 */
import { storage, getKSTDateString } from './storage';
import { addPoints, addExperience } from './pointsCalculator';
import { getPathById, LEARNING_PATHS } from '../data/learningPathData';

const LEARNING_PATH_KEY = 'safety_quest_learning_path';

/**
 * 전체 학습 경로 진행 데이터 가져오기
 */
export const getLearningProgress = () => {
    return storage.get(LEARNING_PATH_KEY, {});
};

/**
 * 전체 학습 경로 진행 데이터 저장
 */
const setLearningProgress = (data) => {
    storage.set(LEARNING_PATH_KEY, data);
};

/**
 * 특정 경로의 진행 상태 가져오기
 */
export const getPathProgress = (pathId) => {
    const all = getLearningProgress();
    return all[pathId] || {
        startedAt: null,
        completedSteps: [],
        currentStep: 0,
        isCompleted: false,
        rewardClaimed: false
    };
};

/**
 * 경로 시작
 */
export const startPath = (pathId) => {
    const path = getPathById(pathId);
    if (!path) return { success: false, message: '경로를 찾을 수 없습니다.' };

    // 선수 과정 확인
    if (path.prerequisite) {
        const prereqProgress = getPathProgress(path.prerequisite);
        if (!prereqProgress.isCompleted) {
            return { success: false, message: '선수 과정을 먼저 완료해야 합니다.' };
        }
    }

    const all = getLearningProgress();
    if (!all[pathId]) {
        all[pathId] = {
            startedAt: new Date().toISOString(),
            completedSteps: [],
            currentStep: 0,
            isCompleted: false,
            rewardClaimed: false
        };
        setLearningProgress(all);
    }

    return { success: true };
};

/**
 * 단계 완료 처리
 */
export const completeStep = (pathId, stepId) => {
    const path = getPathById(pathId);
    if (!path) return { success: false, message: '경로를 찾을 수 없습니다.' };

    const all = getLearningProgress();
    const progress = all[pathId] || {
        startedAt: new Date().toISOString(),
        completedSteps: [],
        currentStep: 0,
        isCompleted: false,
        rewardClaimed: false
    };

    // 이미 완료된 단계인지 확인
    if (progress.completedSteps.includes(stepId)) {
        return { success: false, message: '이미 완료한 단계입니다.' };
    }

    // 순서 확인 (이전 단계가 완료되었는지)
    const stepIndex = path.steps.findIndex(s => s.id === stepId);
    if (stepIndex > 0) {
        const prevStep = path.steps[stepIndex - 1];
        if (!progress.completedSteps.includes(prevStep.id)) {
            return { success: false, message: '이전 단계를 먼저 완료해야 합니다.' };
        }
    }

    // 단계 완료 기록
    progress.completedSteps.push(stepId);
    progress.currentStep = stepIndex + 1;

    // 단계 보상 지급
    const step = path.steps[stepIndex];
    if (step.reward) {
        if (step.reward.points) addPoints(step.reward.points, '학습 경로', `${path.title} - ${step.title}`);
        if (step.reward.exp) addExperience(step.reward.exp);
    }

    // 전체 경로 완료 확인
    if (progress.completedSteps.length >= path.steps.length) {
        progress.isCompleted = true;
        progress.completedAt = new Date().toISOString();
    }

    all[pathId] = progress;
    setLearningProgress(all);

    return {
        success: true,
        stepReward: step.reward,
        isPathCompleted: progress.isCompleted,
        nextStep: progress.isCompleted ? null : path.steps[stepIndex + 1]
    };
};

/**
 * 경로 완료 보상 수령
 */
export const claimPathReward = (pathId) => {
    const path = getPathById(pathId);
    if (!path) return { success: false, message: '경로를 찾을 수 없습니다.' };

    const all = getLearningProgress();
    const progress = all[pathId];

    if (!progress || !progress.isCompleted) {
        return { success: false, message: '아직 경로를 완료하지 않았습니다.' };
    }

    if (progress.rewardClaimed) {
        return { success: false, message: '이미 보상을 수령했습니다.' };
    }

    // 보상 지급
    if (path.reward.points) addPoints(path.reward.points, '학습 경로 완료', path.title);
    if (path.reward.exp) addExperience(path.reward.exp);

    progress.rewardClaimed = true;
    all[pathId] = progress;
    setLearningProgress(all);

    return { success: true, reward: path.reward };
};

/**
 * 경로 상태 결합 (UI 표시용)
 */
export const getPathsWithProgress = (role) => {
    const paths = LEARNING_PATHS.filter(p => p.role === 'all' || p.role === role);

    return paths.map(path => {
        const progress = getPathProgress(path.id);
        const completedCount = progress.completedSteps.length;
        const totalSteps = path.steps.length;
        const progressPercent = Math.round((completedCount / totalSteps) * 100);

        // 선수과정 확인
        let isLocked = false;
        if (path.prerequisite) {
            const prereq = getPathProgress(path.prerequisite);
            isLocked = !prereq.isCompleted;
        }

        // 각 스텝에 해금 상태 추가
        const stepsWithStatus = path.steps.map((step, idx) => {
            const isStepCompleted = progress.completedSteps.includes(step.id);
            const isStepUnlocked = idx === 0 || progress.completedSteps.includes(path.steps[idx - 1].id);
            return {
                ...step,
                isCompleted: isStepCompleted,
                isUnlocked: isStepUnlocked && !isLocked
            };
        });

        return {
            ...path,
            steps: stepsWithStatus,
            progress: {
                ...progress,
                completedCount,
                totalSteps,
                progressPercent,
                isLocked
            }
        };
    });
};
