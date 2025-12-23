import { points, level, equippedItems, userInventoryInstances } from './storage';
import { getItemEffect, getItemById, getItemBaseStats } from '../data/itemsData';
import { 
    calculateActiveSetBonuses, 
    sumSetBonusStats, 
    getActiveVisualAura,
    getNextSetBonusInfo 
} from '../data/setsData';

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

// ===== [New] 착용 아이템 스탯 정보 가져오기 (검교정 레벨 반영) =====
export const getEquippedItemsWithStats = () => {
    const equipped = equippedItems.get();
    const result = {};

    Object.entries(equipped).forEach(([category, data]) => {
        const itemId = typeof data === 'string' ? data : data?.itemId;
        if (!itemId) return;

        const item = getItemById(itemId);
        if (!item) return;

        // 인스턴스에서 검교정된 스탯 가져오기
        const instance = userInventoryInstances.getByItemId(itemId);
        const activeStats = instance?.activeStats || item.baseStats || { 
            pointBoost: 0, 
            xpAccelerator: 0, 
            streakSaver: 0 
        };

        result[category] = {
            itemId,
            item,
            instanceId: instance?.instanceId || null,
            calibrationLevel: instance?.currentCalibrationLevel || 0,
            setId: item.setId,
            activeStats
        };
    });

    return result;
};

// ===== [New] 모든 장착 아이템의 총 활성 스탯 계산 =====
export const calculateTotalActiveStats = () => {
    const equippedWithStats = getEquippedItemsWithStats();
    
    const totalStats = {
        pointBoost: 0,
        xpAccelerator: 0,
        streakSaver: 0
    };

    Object.values(equippedWithStats).forEach(equipped => {
        if (equipped?.activeStats) {
            totalStats.pointBoost += equipped.activeStats.pointBoost || 0;
            totalStats.xpAccelerator += equipped.activeStats.xpAccelerator || 0;
            totalStats.streakSaver += equipped.activeStats.streakSaver || 0;
        }
    });

    return totalStats;
};

// ===== [New] 세트 효과 계산 =====
export const calculateSetBonuses = () => {
    const equippedWithStats = getEquippedItemsWithStats();
    
    // 세트 계산용 객체 변환
    const forSetCalc = {};
    Object.entries(equippedWithStats).forEach(([category, data]) => {
        forSetCalc[category] = { setId: data.setId };
    });

    return calculateActiveSetBonuses(forSetCalc);
};

// ===== [New] 세트 보너스 스탯 합계 =====
export const getSetBonusStats = () => {
    const activeBonuses = calculateSetBonuses();
    return sumSetBonusStats(activeBonuses);
};

// ===== [New] 총 스탯 (아이템 + 세트 효과) =====
export const getTotalCombinedStats = () => {
    const itemStats = calculateTotalActiveStats();
    const setStats = getSetBonusStats();

    return {
        pointBoost: Math.round((itemStats.pointBoost + setStats.pointBoost) * 100) / 100,
        xpAccelerator: Math.round((itemStats.xpAccelerator + setStats.xpAccelerator) * 100) / 100,
        streakSaver: Math.round((itemStats.streakSaver + setStats.streakSaver) * 100) / 100
    };
};

// ===== [New] 현재 시각 효과(아우라) 가져오기 =====
export const getVisualAura = () => {
    const activeBonuses = calculateSetBonuses();
    return getActiveVisualAura(activeBonuses);
};

// ===== [New] HUD용 전체 스탯 정보 =====
export const getActiveStatsForHUD = () => {
    const itemStats = calculateTotalActiveStats();
    const setStats = getSetBonusStats();
    const totalStats = getTotalCombinedStats();
    const activeBonuses = calculateSetBonuses();
    const visualAura = getActiveVisualAura(activeBonuses);

    return {
        // 개별 스탯
        itemStats,
        setStats,
        
        // 총합
        totalPointBoost: totalStats.pointBoost,
        totalXpAccelerator: totalStats.xpAccelerator,
        totalStreakSaver: totalStats.streakSaver,
        
        // 세트 효과
        activeSetBonuses: activeBonuses.map(b => ({
            setId: b.setId,
            setName: b.setName,
            tier: b.tier,
            pieceCount: b.pieceCount,
            maxPieces: b.maxPieces,
            bonusName: b.bonus.name,
            bonusDescription: b.bonus.description
        })),
        
        // 시각 효과
        visualAura: visualAura?.id || null,
        visualAuraName: visualAura?.name || null,
        visualAuraCssClass: visualAura?.cssClass || null
    };
};

// 포인트 추가 (아이템 보너스 + 세트 효과 포함) [Updated]
export const addPoints = (basePoints, questType = 'all') => {
    // 새로운 스탯 시스템 사용
    const totalStats = getTotalCombinedStats();
    const bonusPercent = totalStats.pointBoost;
    const totalPoints = Math.round(basePoints * (1 + bonusPercent / 100));

    points.add(totalPoints);

    return {
        basePoints,
        bonus: bonusPercent,
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

// 아이템 착용 보너스 계산 (Legacy 호환성 유지)
export const calculateItemBonus = (questType = 'all') => {
    const equipped = equippedItems.get();
    let totalBonus = 0;

    Object.values(equipped).forEach(data => {
        const itemId = typeof data === 'string' ? data : data?.itemId;
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

    Object.entries(equipped).forEach(([category, data]) => {
        const itemId = typeof data === 'string' ? data : data?.itemId;
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

// 총 보너스 퍼센트 계산 [Updated: 새 시스템 통합]
export const getTotalBonusPercent = () => {
    const totalStats = getTotalCombinedStats();
    return totalStats.pointBoost;
};

// 경험치 추가 (XP 가속기 적용) [Updated]
export const addExperience = (expAmount) => {
    const totalStats = getTotalCombinedStats();
    const xpBonus = totalStats.xpAccelerator;
    const boostedExp = Math.round(expAmount * (1 + xpBonus / 100));

    const levelData = level.get();
    const oldLevel = levelData.current;

    level.addExp(boostedExp);

    const newLevelData = level.get();
    const leveledUp = newLevelData.current > oldLevel;

    return {
        exp: expAmount,
        boostedExp,
        xpBonus,
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

// 스트릭 보호 체크 [New]
export const checkStreakProtection = () => {
    const totalStats = getTotalCombinedStats();
    const protectionChance = totalStats.streakSaver / 100;
    
    if (protectionChance <= 0) return false;
    
    const roll = Math.random();
    return roll < protectionChance;
};

// 통계 정보 가져오기 [Updated]
export const getPlayerStats = () => {
    const currentPoints = points.get();
    const currentLevel = calculateLevel(currentPoints);
    const levelData = level.get();
    const totalStats = getTotalCombinedStats();
    const activeHUD = getActiveStatsForHUD();

    return {
        points: currentPoints,
        level: currentLevel,
        experience: levelData,
        itemBonus: totalStats.pointBoost,
        xpBonus: totalStats.xpAccelerator,
        streakProtection: totalStats.streakSaver,
        pointsToNextLevel: getPointsToNextLevel(),
        activeSetBonuses: activeHUD.activeSetBonuses,
        visualAura: activeHUD.visualAura
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
    getPlayerStats,
    // [New] Stats 2.0
    getEquippedItemsWithStats,
    calculateTotalActiveStats,
    calculateSetBonuses,
    getSetBonusStats,
    getTotalCombinedStats,
    getVisualAura,
    getActiveStatsForHUD,
    checkStreakProtection
};
