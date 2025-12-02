import { points, level } from './storage';
import { equippedItems } from './storage';
import { getItemEffect } from '../data/itemsData';

// 레벨 정의
export const LEVELS = {
    BRONZE: { min: 0, max: 500, name: 'Bronze', color: '#cd7f32' },
    SILVER: { min: 500, max: 1500, name: 'Silver', color: '#c0c0c0' },
    GOLD: { min: 1500, max: 3000, name: 'Gold', color: '#ffd700' },
    PLATINUM: { min: 3000, max: 5000, name: 'Platinum', color: '#e5e4e2' },
    DIAMOND: { min: 5000, max: Infinity, name: 'Diamond', color: '#b9f2ff' }
};

// 현재 포인트로 레벨 계산
export const calculateLevel = (currentPoints = null) => {
    const pointsValue = currentPoints !== null ? currentPoints : points.get();

    for (const [key, levelInfo] of Object.entries(LEVELS)) {
        if (pointsValue >= levelInfo.min && pointsValue < levelInfo.max) {
            return {
                level: key,
                name: levelInfo.name,
                color: levelInfo.color,
                points: pointsValue,
                min: levelInfo.min,
                max: levelInfo.max,
                progress: levelInfo.max !== Infinity
                    ? Math.round(((pointsValue - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100)
                    : 100
            };
        }
    }

    return {
        level: 'BRONZE',
        name: 'Bronze',
        color: '#cd7f32',
        points: pointsValue,
        min: 0,
        max: 500,
        progress: 0
    };
};

// 다음 레벨까지 필요한 포인트
export const getPointsToNextLevel = () => {
    const currentLevel = calculateLevel();

    if (currentLevel.max === Infinity) {
        return 0; // 최대 레벨
    }

    return currentLevel.max - currentLevel.points;
};

// 포인트 추가 (아이템 보너스 포함)
export const addPoints = (basePoints, questType = 'all') => {
    const bonus = calculateItemBonus(questType);
    const totalPoints = Math.round(basePoints * (1 + bonus / 100));

    points.add(totalPoints);

    return {
        basePoints,
        bonus,
        totalPoints,
        newTotal: points.get()
    };
};

// 포인트 차감
export const subtractPoints = (amount) => {
    if (!points.canAfford(amount)) {
        return {
            success: false,
            message: '포인트가 부족합니다.'
        };
    }

    points.subtract(amount);

    return {
        success: true,
        newTotal: points.get()
    };
};

// 아이템 착용 보너스 계산
export const calculateItemBonus = (questType = 'all') => {
    const equipped = equippedItems.get();
    let totalBonus = 0;

    Object.values(equipped).forEach(itemId => {
        if (!itemId) return;

        const effect = getItemEffect(itemId);
        if (!effect) return;

        // 퀘스트 타입이 일치하거나 all인 경우 보너스 적용
        if (effect.questType === questType || effect.questType === 'all') {
            totalBonus += effect.bonus;
        }
    });

    return totalBonus;
};

// 착용 중인 모든 아이템 효과 가져오기
export const getEquippedItemEffects = () => {
    const equipped = equippedItems.get();
    const effects = [];

    Object.entries(equipped).forEach(([category, itemId]) => {
        if (!itemId) return;

        const effect = getItemEffect(itemId);
        if (effect) {
            effects.push({
                category,
                itemId,
                ...effect
            });
        }
    });

    return effects;
};

// 총 보너스 퍼센트 계산
export const getTotalBonusPercent = () => {
    const effects = getEquippedItemEffects();
    return effects.reduce((total, effect) => total + effect.bonus, 0);
};

// 경험치 추가
export const addExperience = (expAmount) => {
    const levelData = level.get();
    const oldLevel = levelData.current;

    level.addExp(expAmount);

    const newLevelData = level.get();
    const leveledUp = newLevelData.current > oldLevel;

    return {
        exp: expAmount,
        leveledUp,
        oldLevel,
        newLevel: newLevelData.current,
        currentExp: newLevelData.exp,
        expToNext: newLevelData.expToNext
    };
};

// 레벨업 보상
export const getLevelUpReward = (newLevel) => {
    const baseReward = 100;
    const reward = baseReward * newLevel;

    points.add(reward);

    return {
        points: reward,
        message: `레벨 ${newLevel} 달성! ${reward} 포인트를 획득했습니다!`
    };
};

// 통계 정보 가져오기
export const getPlayerStats = () => {
    const currentPoints = points.get();
    const currentLevel = calculateLevel(currentPoints);
    const levelData = level.get();
    const itemBonus = getTotalBonusPercent();

    return {
        points: currentPoints,
        level: currentLevel,
        experience: levelData,
        itemBonus,
        pointsToNextLevel: getPointsToNextLevel()
    };
};

export default {
    calculateLevel,
    getPointsToNextLevel,
    addPoints,
    subtractPoints,
    calculateItemBonus,
    getEquippedItemEffects,
    getTotalBonusPercent,
    addExperience,
    getLevelUpReward,
    getPlayerStats
};
