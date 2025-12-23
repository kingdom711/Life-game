import { points, level } from './storage';
import { equippedItems } from './storage';
import { getItemEffect } from '../data/itemsData';

// 티어 정보
export const TIERS = {
    bronze: { name: 'Bronze', color: '#cd7f32', icon: '🥉' },
    silver: { name: 'Silver', color: '#c0c0c0', icon: '🥈' },
    gold: { name: 'Gold', color: '#ffd700', icon: '🥇' },
    platinum: { name: 'Platinum', color: '#e5e4e2', icon: '💎' },
    diamond: { name: 'Diamond', color: '#b9f2ff', icon: '👑' }
};

// 15단계 레벨 정의 (III → II → I 순서, I이 가장 높음)
export const LEVELS = {
    BRONZE_3: { min: 0, max: 10000, name: 'Bronze III', color: '#cd7f32', tier: 'bronze', rank: 1, subRank: 3 },
    BRONZE_2: { min: 10000, max: 30000, name: 'Bronze II', color: '#cd7f32', tier: 'bronze', rank: 2, subRank: 2 },
    BRONZE_1: { min: 30000, max: 60000, name: 'Bronze I', color: '#cd7f32', tier: 'bronze', rank: 3, subRank: 1 },
    SILVER_3: { min: 60000, max: 100000, name: 'Silver III', color: '#c0c0c0', tier: 'silver', rank: 4, subRank: 3 },
    SILVER_2: { min: 100000, max: 150000, name: 'Silver II', color: '#c0c0c0', tier: 'silver', rank: 5, subRank: 2 },
    SILVER_1: { min: 150000, max: 220000, name: 'Silver I', color: '#c0c0c0', tier: 'silver', rank: 6, subRank: 1 },
    GOLD_3: { min: 220000, max: 310000, name: 'Gold III', color: '#ffd700', tier: 'gold', rank: 7, subRank: 3 },
    GOLD_2: { min: 310000, max: 420000, name: 'Gold II', color: '#ffd700', tier: 'gold', rank: 8, subRank: 2 },
    GOLD_1: { min: 420000, max: 560000, name: 'Gold I', color: '#ffd700', tier: 'gold', rank: 9, subRank: 1 },
    PLATINUM_3: { min: 560000, max: 730000, name: 'Platinum III', color: '#e5e4e2', tier: 'platinum', rank: 10, subRank: 3 },
    PLATINUM_2: { min: 730000, max: 930000, name: 'Platinum II', color: '#e5e4e2', tier: 'platinum', rank: 11, subRank: 2 },
    PLATINUM_1: { min: 930000, max: 1180000, name: 'Platinum I', color: '#e5e4e2', tier: 'platinum', rank: 12, subRank: 1 },
    DIAMOND_3: { min: 1180000, max: 1500000, name: 'Diamond III', color: '#b9f2ff', tier: 'diamond', rank: 13, subRank: 3 },
    DIAMOND_2: { min: 1500000, max: 1900000, name: 'Diamond II', color: '#b9f2ff', tier: 'diamond', rank: 14, subRank: 2 },
    DIAMOND_1: { min: 1900000, max: Infinity, name: 'Diamond I', color: '#b9f2ff', tier: 'diamond', rank: 15, subRank: 1 }
};

// 현재 포인트로 레벨 계산
export const calculateLevel = (currentPoints = null) => {
    const pointsValue = currentPoints !== null ? currentPoints : points.get();

    for (const [key, levelInfo] of Object.entries(LEVELS)) {
        if (pointsValue >= levelInfo.min && pointsValue < levelInfo.max) {
            const tierInfo = TIERS[levelInfo.tier];
            return {
                level: key,
                name: levelInfo.name,
                color: levelInfo.color,
                points: pointsValue,
                min: levelInfo.min,
                max: levelInfo.max,
                progress: levelInfo.max !== Infinity
                    ? Math.round(((pointsValue - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100)
                    : 100,
                tier: levelInfo.tier,
                tierName: tierInfo.name,
                tierIcon: tierInfo.icon,
                rank: levelInfo.rank,
                subRank: levelInfo.subRank,
                totalRanks: 15,
                tierRanks: 3
            };
        }
    }

    // 기본값 (Bronze III - 가장 낮은 레벨)
    const defaultTier = TIERS.bronze;
    return {
        level: 'BRONZE_3',
        name: 'Bronze III',
        color: '#cd7f32',
        points: pointsValue,
        min: 0,
        max: 10000,
        progress: Math.round((pointsValue / 10000) * 100),
        tier: 'bronze',
        tierName: defaultTier.name,
        tierIcon: defaultTier.icon,
        rank: 1,
        subRank: 3,
        totalRanks: 15,
        tierRanks: 3
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
