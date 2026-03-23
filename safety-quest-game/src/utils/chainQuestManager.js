/**
 * 체인 퀘스트(연쇄 퀘스트) 매니저
 * 일일 퀘스트 N개 완료 시 보너스 체인 퀘스트 해금
 */

import { storage, getKSTDateString, questProgress, userProfile } from './storage';
import { dailyQuests, getQuestsByTypeRoleAndSpec, QUEST_TYPE } from '../data/questsData';
import { addPoints, addExperience } from './pointsCalculator';
import { getActiveSpecialization } from './specializationManager';

const CHAIN_QUEST_KEY = 'safety_quest_chain_quests';

// 체인 퀘스트 정의
export const CHAIN_QUESTS = [
    {
        id: 'chain_daily_3',
        name: '안전 마스터 미션',
        description: '오늘 수행한 안전 활동을 한 줄로 정리하세요.',
        icon: '🔗',
        unlockCondition: 3, // 일일 퀘스트 3개 완료 시 해금
        type: 'text_input',
        reward: { points: 200, exp: 50 },
        rarity: 'rare'
    },
    {
        id: 'chain_perfect_bonus',
        name: '완벽한 하루',
        description: '체인 퀘스트까지 모두 완료! 추가 보너스를 받으세요.',
        icon: '🔥',
        unlockCondition: 'chain_complete', // 체인 퀘스트 완료 시 자동 지급
        type: 'auto',
        reward: { points: 100, exp: 30 },
        rarity: 'epic'
    }
];

// 오늘의 체인 퀘스트 상태 조회
const getTodayChainState = () => {
    const today = getKSTDateString();
    const state = storage.get(CHAIN_QUEST_KEY, {});
    if (state.date !== today) {
        return { date: today, unlocked: false, completed: false, textInput: '', perfectClaimed: false };
    }
    return state;
};

const saveTodayChainState = (state) => {
    storage.set(CHAIN_QUEST_KEY, state);
};

// 현재 완료된 일일 퀘스트 수 계산
export const getCompletedDailyCount = (role) => {
    const spec = getActiveSpecialization()?.id || null;
    const quests = getQuestsByTypeRoleAndSpec(QUEST_TYPE.DAILY, role, spec);
    let completed = 0;
    quests.forEach(q => {
        const progress = questProgress.getQuestProgress(q.id);
        if (progress?.completed) completed++;
    });
    return { completed, total: quests.length };
};

// 체인 퀘스트 해금 여부
export const isChainQuestUnlocked = (role) => {
    const state = getTodayChainState();
    if (state.unlocked) return true;

    const { completed } = getCompletedDailyCount(role);
    return completed >= CHAIN_QUESTS[0].unlockCondition;
};

// 체인 퀘스트 완료 여부
export const isChainQuestCompleted = () => {
    return getTodayChainState().completed;
};

// 완벽한 하루 보너스 수령 여부
export const isPerfectBonusClaimed = () => {
    return getTodayChainState().perfectClaimed;
};

// 체인 퀘스트 상태 전체 조회
export const getChainQuestStatus = (role) => {
    const state = getTodayChainState();
    const { completed, total } = getCompletedDailyCount(role);
    const threshold = CHAIN_QUESTS[0].unlockCondition;
    const unlocked = completed >= threshold || state.unlocked;

    return {
        dailyCompleted: completed,
        dailyTotal: total,
        threshold,
        unlocked,
        chainCompleted: state.completed,
        perfectClaimed: state.perfectClaimed,
        textInput: state.textInput || ''
    };
};

// 체인 퀘스트 완료 (텍스트 입력)
export const completeChainQuest = (textInput, role) => {
    if (!textInput || textInput.trim().length < 5) {
        return { success: false, message: '5자 이상 입력해 주세요.' };
    }

    const state = getTodayChainState();
    if (state.completed) {
        return { success: false, message: '이미 완료한 체인 퀘스트입니다.' };
    }

    if (!isChainQuestUnlocked(role)) {
        return { success: false, message: '체인 퀘스트가 아직 해금되지 않았습니다.' };
    }

    const chain = CHAIN_QUESTS[0];
    const pointsResult = addPoints(chain.reward.points, '체인 퀘스트', chain.name);
    const expResult = addExperience(chain.reward.exp);

    state.unlocked = true;
    state.completed = true;
    state.textInput = textInput.trim();
    state.completedAt = new Date().toISOString();
    saveTodayChainState(state);

    return {
        success: true,
        message: `${chain.name} 완료! +${chain.reward.points}P +${chain.reward.exp}EXP`,
        pointsResult,
        expResult
    };
};

// 완벽한 하루 보너스 수령
export const claimPerfectBonus = () => {
    const state = getTodayChainState();
    if (!state.completed || state.perfectClaimed) {
        return { success: false, message: '보너스를 수령할 수 없습니다.' };
    }

    const bonus = CHAIN_QUESTS[1];
    addPoints(bonus.reward.points, '완벽한 하루', bonus.name);
    addExperience(bonus.reward.exp);

    state.perfectClaimed = true;
    saveTodayChainState(state);

    return {
        success: true,
        message: `완벽한 하루! +${bonus.reward.points}P +${bonus.reward.exp}EXP`
    };
};

export default {
    CHAIN_QUESTS,
    getCompletedDailyCount,
    isChainQuestUnlocked,
    isChainQuestCompleted,
    isPerfectBonusClaimed,
    getChainQuestStatus,
    completeChainQuest,
    claimPerfectBonus
};
