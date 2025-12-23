/**
 * 검교정(강화) 서비스
 * 아이템 강화 로직, 확률 계산, 스탯 재계산을 담당
 */

import { points, userInventoryInstances, calibrationLogs } from './storage';
import { 
    getItemById, 
    getCalibrationConfig, 
    getItemBaseStats,
    getCalibrationCost,
    getCalibrationSuccessRate 
} from '../data/itemsData';

/**
 * 검교정 결과 타입
 */
export const CALIBRATION_RESULT = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    ERROR_NOT_FOUND: 'ERROR_NOT_FOUND',
    ERROR_MAX_LEVEL: 'ERROR_MAX_LEVEL',
    ERROR_INSUFFICIENT_POINTS: 'ERROR_INSUFFICIENT_POINTS'
};

/**
 * 활성 스탯 재계산
 * @param {Object} baseStats - 아이템 기본 스탯
 * @param {number} calibrationLevel - 현재 검교정 레벨
 * @param {Object} config - 검교정 설정
 * @returns {Object} 계산된 활성 스탯
 */
export const calculateActiveStats = (baseStats, calibrationLevel, config) => {
    if (!baseStats || !config) {
        return { pointBoost: 0, xpAccelerator: 0, streakSaver: 0 };
    }

    const multiplier = 1 + (calibrationLevel * config.statIncrement / 100);

    return {
        pointBoost: Math.round((baseStats.pointBoost * multiplier) * 100) / 100,
        xpAccelerator: Math.round((baseStats.xpAccelerator * multiplier) * 100) / 100,
        streakSaver: Math.round((baseStats.streakSaver * multiplier) * 100) / 100
    };
};

/**
 * 예상 스탯 미리보기 (강화 전 UI용)
 * @param {string} itemId - 아이템 ID
 * @param {number} currentLevel - 현재 레벨
 * @returns {Object} 현재 스탯과 다음 레벨 스탯
 */
export const previewCalibrationStats = (itemId, currentLevel) => {
    const item = getItemById(itemId);
    if (!item) return null;

    const config = getCalibrationConfig(itemId);
    if (!config) return null;

    const baseStats = getItemBaseStats(itemId);
    const currentStats = calculateActiveStats(baseStats, currentLevel, config);
    const nextStats = calculateActiveStats(baseStats, currentLevel + 1, config);

    return {
        currentLevel,
        nextLevel: currentLevel + 1,
        maxLevel: config.maxLevel,
        currentStats,
        nextStats,
        statDiff: {
            pointBoost: Math.round((nextStats.pointBoost - currentStats.pointBoost) * 100) / 100,
            xpAccelerator: Math.round((nextStats.xpAccelerator - currentStats.xpAccelerator) * 100) / 100,
            streakSaver: Math.round((nextStats.streakSaver - currentStats.streakSaver) * 100) / 100
        },
        cost: getCalibrationCost(itemId, currentLevel),
        successRate: getCalibrationSuccessRate(itemId, currentLevel),
        canCalibrate: currentLevel < config.maxLevel
    };
};

/**
 * 검교정(강화) 시도
 * @param {string} instanceId - 아이템 인스턴스 ID
 * @returns {Object} 검교정 결과
 */
export const attemptCalibration = (instanceId) => {
    // 인스턴스 조회
    const instance = userInventoryInstances.getByInstanceId(instanceId);
    if (!instance) {
        return {
            status: CALIBRATION_RESULT.ERROR_NOT_FOUND,
            message: '아이템을 찾을 수 없습니다.',
            success: false
        };
    }

    const { itemId, currentCalibrationLevel } = instance;
    const item = getItemById(itemId);
    if (!item) {
        return {
            status: CALIBRATION_RESULT.ERROR_NOT_FOUND,
            message: '아이템 정보를 찾을 수 없습니다.',
            success: false
        };
    }

    const config = getCalibrationConfig(itemId);
    if (!config) {
        return {
            status: CALIBRATION_RESULT.ERROR_NOT_FOUND,
            message: '검교정 설정을 찾을 수 없습니다.',
            success: false
        };
    }

    // 최대 레벨 확인
    if (currentCalibrationLevel >= config.maxLevel) {
        return {
            status: CALIBRATION_RESULT.ERROR_MAX_LEVEL,
            message: '이미 최대 레벨에 도달했습니다.',
            success: false,
            currentLevel: currentCalibrationLevel,
            maxLevel: config.maxLevel
        };
    }

    // 비용 확인
    const cost = getCalibrationCost(itemId, currentCalibrationLevel);
    if (!points.canAfford(cost)) {
        return {
            status: CALIBRATION_RESULT.ERROR_INSUFFICIENT_POINTS,
            message: `포인트가 부족합니다. (필요: ${cost}P, 보유: ${points.get()}P)`,
            success: false,
            requiredPoints: cost,
            currentPoints: points.get()
        };
    }

    // 포인트 차감
    points.subtract(cost);

    // 성공 확률 계산
    const successRate = getCalibrationSuccessRate(itemId, currentCalibrationLevel);
    const roll = Math.random();
    const isSuccess = roll < successRate;

    // 검교정 시도 기록
    userInventoryInstances.recordCalibrationAttempt(instanceId, isSuccess);

    if (isSuccess) {
        // 성공: 레벨 업 및 스탯 재계산
        const newLevel = currentCalibrationLevel + 1;
        const baseStats = getItemBaseStats(itemId);
        const newActiveStats = calculateActiveStats(baseStats, newLevel, config);

        userInventoryInstances.updateCalibrationLevel(instanceId, newLevel, newActiveStats);

        // 로그 기록
        calibrationLogs.add({
            instanceId,
            itemId,
            itemName: item.name,
            previousLevel: currentCalibrationLevel,
            newLevel,
            cost,
            isSuccess: true,
            successRate,
            roll
        });

        return {
            status: CALIBRATION_RESULT.SUCCESS,
            message: `검교정 성공! +${newLevel}`,
            success: true,
            previousLevel: currentCalibrationLevel,
            newLevel,
            newActiveStats,
            pointsConsumed: cost,
            remainingPoints: points.get(),
            effect: 'Visual_Success_Lime_Green'
        };
    } else {
        // 실패: 포인트만 소모
        calibrationLogs.add({
            instanceId,
            itemId,
            itemName: item.name,
            previousLevel: currentCalibrationLevel,
            newLevel: currentCalibrationLevel,
            cost,
            isSuccess: false,
            successRate,
            roll
        });

        return {
            status: CALIBRATION_RESULT.FAILURE,
            message: '검교정 실패... 포인트가 소모되었습니다.',
            success: false,
            currentLevel: currentCalibrationLevel,
            pointsConsumed: cost,
            remainingPoints: points.get(),
            effect: 'Visual_Failure_Red_Shake'
        };
    }
};

/**
 * 아이템의 검교정 정보 가져오기
 * @param {string} itemId - 아이템 ID
 * @returns {Object|null} 검교정 정보
 */
export const getCalibrationInfo = (itemId) => {
    const instance = userInventoryInstances.getByItemId(itemId);
    const item = getItemById(itemId);
    const config = getCalibrationConfig(itemId);

    if (!item || !config) return null;

    const currentLevel = instance?.currentCalibrationLevel || 0;
    const baseStats = getItemBaseStats(itemId);

    return {
        itemId,
        itemName: item.name,
        rarity: item.rarity,
        instanceId: instance?.instanceId || null,
        currentLevel,
        maxLevel: config.maxLevel,
        cost: getCalibrationCost(itemId, currentLevel),
        successRate: getCalibrationSuccessRate(itemId, currentLevel),
        successRatePercent: Math.round(getCalibrationSuccessRate(itemId, currentLevel) * 100),
        baseStats,
        currentStats: instance?.activeStats || baseStats,
        canCalibrate: currentLevel < config.maxLevel,
        preview: previewCalibrationStats(itemId, currentLevel)
    };
};

/**
 * 검교정 통계 가져오기
 * @param {string} instanceId - 인스턴스 ID
 * @returns {Object} 통계 정보
 */
export const getCalibrationStats = (instanceId) => {
    const instance = userInventoryInstances.getByInstanceId(instanceId);
    if (!instance) return null;

    const logs = calibrationLogs.getByInstanceId(instanceId);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

    return {
        totalAttempts: instance.totalCalibrationAttempts,
        successfulAttempts: instance.successfulCalibrations,
        successRate: instance.totalCalibrationAttempts > 0
            ? Math.round((instance.successfulCalibrations / instance.totalCalibrationAttempts) * 100)
            : 0,
        totalPointsSpent: totalCost,
        currentLevel: instance.currentCalibrationLevel,
        history: logs
    };
};

/**
 * 아이템 획득 시 인스턴스 생성 또는 기존 인스턴스 반환
 * @param {string} itemId - 아이템 ID
 * @returns {Object} 생성된 또는 기존 인스턴스
 */
export const ensureItemInstance = (itemId) => {
    const existing = userInventoryInstances.getByItemId(itemId);
    if (existing) return existing;

    const item = getItemById(itemId);
    if (!item) return null;

    return userInventoryInstances.createInstance(
        itemId,
        item.baseStats || { pointBoost: 0, xpAccelerator: 0, streakSaver: 0 },
        item.setId || null
    );
};

export default {
    CALIBRATION_RESULT,
    calculateActiveStats,
    previewCalibrationStats,
    attemptCalibration,
    getCalibrationInfo,
    getCalibrationStats,
    ensureItemInstance
};

