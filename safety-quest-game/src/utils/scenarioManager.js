/**
 * 시나리오 시뮬레이션 매니저
 * - 시나리오 진행 상태 관리 (localStorage)
 * - 선택지 기록 및 점수 계산
 * - 완료 보상 지급
 */
import { SCENARIOS, getScenarioById } from '../data/scenarioData';
import { addPoints, addExperience } from './pointsCalculator';
import { getKSTDateString } from './storage';

const PROGRESS_KEY = 'safety_quest_scenario_progress';

// ===== 내부 헬퍼 =====

const loadProgress = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProgress = (data) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
};

const getKSTTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// ===== 공개 API =====

/**
 * 전체 시나리오 진행 상황 조회
 * @returns {Object} { scenarioId: { completed, score, totalScore, completedAt, attempts, choices } }
 */
export const getScenarioProgress = () => {
  return loadProgress();
};

/**
 * 시나리오 시작 (새 시도 초기화)
 * @param {string} scenarioId
 * @returns {Object} { success, scenario, currentStep }
 */
export const startScenario = (scenarioId) => {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) {
    return { success: false, message: '시나리오를 찾을 수 없습니다.' };
  }

  const progress = loadProgress();
  const existing = progress[scenarioId] || {};

  // 시도 횟수 증가, 현재 진행 상태 초기화
  progress[scenarioId] = {
    ...existing,
    completed: existing.completed || false,
    score: existing.score || 0,
    totalScore: existing.totalScore || 0,
    completedAt: existing.completedAt || null,
    attempts: (existing.attempts || 0) + 1,
    // 현재 진행 중인 시도 데이터
    currentAttempt: {
      startedAt: getKSTTimestamp(),
      currentStepIndex: 0,
      choices: [],
      earnedPoints: 0,
      finished: false
    }
  };

  saveProgress(progress);

  return {
    success: true,
    scenario,
    currentStep: scenario.steps[0]
  };
};

/**
 * 선택지 제출
 * @param {string} scenarioId
 * @param {string} stepId
 * @param {string} choiceId
 * @returns {Object} { correct, feedback, points, nextStepId, isLastStep }
 */
export const submitChoice = (scenarioId, stepId, choiceId) => {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) {
    return { success: false, message: '시나리오를 찾을 수 없습니다.' };
  }

  const step = scenario.steps.find(s => s.id === stepId);
  if (!step) {
    return { success: false, message: '단계를 찾을 수 없습니다.' };
  }

  const choice = step.choices.find(c => c.id === choiceId);
  if (!choice) {
    return { success: false, message: '선택지를 찾을 수 없습니다.' };
  }

  const progress = loadProgress();
  const scenarioProgress = progress[scenarioId];

  if (scenarioProgress?.currentAttempt) {
    scenarioProgress.currentAttempt.choices.push({
      stepId,
      choiceId,
      isCorrect: choice.isCorrect,
      points: choice.points,
      timestamp: getKSTTimestamp()
    });
    scenarioProgress.currentAttempt.earnedPoints += choice.points;
    saveProgress(progress);
  }

  const isLastStep = choice.nextStepId === 'end';

  return {
    success: true,
    correct: choice.isCorrect,
    feedback: choice.feedback,
    points: choice.points,
    nextStepId: choice.nextStepId,
    isLastStep
  };
};

/**
 * 시나리오 완료 처리 및 보상 지급
 * @param {string} scenarioId
 * @param {number} totalScore - 이번 시도에서 획득한 총 점수
 * @param {number} maxScore - 만점
 * @returns {Object} { success, pointsResult, expResult, isNewBest }
 */
export const completeScenario = (scenarioId, totalScore, maxScore) => {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) {
    return { success: false, message: '시나리오를 찾을 수 없습니다.' };
  }

  const progress = loadProgress();
  const existing = progress[scenarioId] || {};
  const isNewBest = totalScore > (existing.score || 0);
  const completedAt = getKSTTimestamp();

  // 진행 상태 업데이트
  progress[scenarioId] = {
    ...existing,
    completed: true,
    score: isNewBest ? totalScore : (existing.score || 0),
    totalScore: maxScore,
    completedAt,
    attempts: existing.attempts || 1,
    currentAttempt: {
      ...(existing.currentAttempt || {}),
      finished: true,
      finishedAt: completedAt
    }
  };

  saveProgress(progress);

  // 점수 비율에 따라 보상 조정
  const scoreRatio = maxScore > 0 ? totalScore / maxScore : 0;
  const earnedPoints = Math.round(scenario.reward.points * scoreRatio);
  const earnedExp = Math.round(scenario.reward.exp * scoreRatio);

  // 보상 지급
  const pointsResult = addPoints(earnedPoints, 'all', '시나리오 완료', scenario.title);
  const expResult = addExperience(earnedExp);

  // 시즌 포인트 추가 (seasonManager가 존재하는 경우)
  try {
    const { addSeasonPoints } = require('./seasonManager');
    addSeasonPoints(earnedPoints, `시나리오: ${scenario.title}`);
  } catch {
    // seasonManager가 없으면 무시
  }

  return {
    success: true,
    isNewBest,
    earnedPoints,
    earnedExp,
    scoreRatio: Math.round(scoreRatio * 100),
    pointsResult,
    expResult
  };
};

/**
 * 시나리오 목록에 진행 상태 병합
 * @returns {Array} 진행 상태가 포함된 시나리오 배열
 */
export const getScenariosWithProgress = () => {
  const progress = loadProgress();

  return SCENARIOS.map(scenario => {
    const prog = progress[scenario.id] || {};
    const maxScore = scenario.steps.reduce((total, step) => {
      const maxChoicePoints = Math.max(...step.choices.map(c => c.points));
      return total + maxChoicePoints;
    }, 0);

    return {
      ...scenario,
      progress: {
        completed: prog.completed || false,
        score: prog.score || 0,
        totalScore: maxScore,
        completedAt: prog.completedAt || null,
        attempts: prog.attempts || 0,
        scorePercent: maxScore > 0 ? Math.round(((prog.score || 0) / maxScore) * 100) : 0
      }
    };
  });
};

/**
 * 전체 시나리오 통계
 * @returns {Object} { totalCompleted, totalAttempts, averageScore, perfectCount }
 */
export const getScenarioStats = () => {
  const progress = loadProgress();
  const entries = Object.values(progress);

  const completedEntries = entries.filter(e => e.completed);
  const totalCompleted = completedEntries.length;
  const totalAttempts = entries.reduce((sum, e) => sum + (e.attempts || 0), 0);

  let averageScore = 0;
  let perfectCount = 0;

  if (totalCompleted > 0) {
    const scores = completedEntries.map(e => {
      const maxScore = e.totalScore || 1;
      return (e.score || 0) / maxScore;
    });
    averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);

    perfectCount = completedEntries.filter(e => {
      return e.totalScore > 0 && e.score >= e.totalScore;
    }).length;
  }

  return {
    totalCompleted,
    totalScenarios: SCENARIOS.length,
    totalAttempts,
    averageScore,
    perfectCount
  };
};

/**
 * 시나리오의 만점 계산
 * @param {string} scenarioId
 * @returns {number}
 */
export const getMaxScore = (scenarioId) => {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return 0;

  return scenario.steps.reduce((total, step) => {
    const maxChoicePoints = Math.max(...step.choices.map(c => c.points));
    return total + maxChoicePoints;
  }, 0);
};

export default {
  getScenarioProgress,
  startScenario,
  submitChoice,
  completeScenario,
  getScenariosWithProgress,
  getScenarioStats,
  getMaxScore
};
