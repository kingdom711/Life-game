/**
 * 인벤토리 관련 API
 * Backend-Ready 구조: API 연동 가능 + localStorage fallback
 */

import apiClient from './apiClient';
import { 
    attemptCalibration, 
    getCalibrationInfo, 
    previewCalibrationStats,
    ensureItemInstance 
} from '../utils/calibrationService';
import { getActiveStatsForHUD, getTotalCombinedStats, calculateSetBonuses } from '../utils/pointsCalculator';
import { userInventoryInstances, points } from '../utils/storage';
import { getItemById } from '../data/itemsData';

// API 모드 체크 (환경 설정에 따라 전환 가능)
const USE_API = false; // true로 변경 시 실제 백엔드 API 사용

const inventoryApi = {
    /**
     * 인벤토리 전체 조회
     */
    getInventory: async () => {
        if (USE_API) {
            return apiClient.get('/inventory');
        }
        // localStorage fallback
        const instances = userInventoryInstances.get();
        return { data: instances, success: true };
    },
    
    /**
     * 카테고리별 인벤토리 조회
     * @param {string} category - helmet, vest, shoes, etc.
     */
    getByCategory: async (category) => {
        if (USE_API) {
            return apiClient.get(`/inventory?category=${category}`);
        }
        // localStorage fallback
        const instances = userInventoryInstances.get();
        const filtered = instances.filter(inst => {
            const item = getItemById(inst.itemId);
            return item?.category === category;
        });
        return { data: filtered, success: true };
    },
    
    /**
     * 아이템 획득 (인스턴스 생성 포함)
     * @param {string} itemId
     */
    addItem: async (itemId) => {
        if (USE_API) {
            return apiClient.post('/inventory/add', { itemId });
        }
        // localStorage fallback - 인스턴스 생성
        const instance = ensureItemInstance(itemId);
        return { 
            data: instance, 
            success: !!instance,
            message: instance ? '아이템이 추가되었습니다.' : '아이템을 추가할 수 없습니다.'
        };
    },
    
    /**
     * 아이템 장착
     * @param {string} itemId
     */
    equipItem: async (itemId) => {
        if (USE_API) {
            return apiClient.post(`/inventory/${itemId}/equip`);
        }
        // localStorage는 inventoryManager에서 처리
        return { success: true };
    },
    
    /**
     * 아이템 해제
     * @param {string} itemId
     */
    unequipItem: async (itemId) => {
        if (USE_API) {
            return apiClient.post(`/inventory/${itemId}/unequip`);
        }
        return { success: true };
    },
    
    /**
     * 장착된 아이템 목록 조회
     */
    getEquippedItems: async () => {
        if (USE_API) {
            return apiClient.get('/inventory/equipped');
        }
        const instances = userInventoryInstances.getEquippedInstances();
        return { data: instances, success: true };
    },
    
    /**
     * [Legacy] 아이템 강화 (검교정으로 대체)
     * @param {string} itemId
     * @deprecated - calibrateItem 사용 권장
     */
    enhanceItem: async (itemId) => {
        if (USE_API) {
            return apiClient.post(`/inventory/${itemId}/enhance`);
        }
        // 인스턴스 ID로 변환하여 calibrate 호출
        const instance = userInventoryInstances.getByItemId(itemId);
        if (!instance) {
            return { success: false, message: '아이템 인스턴스를 찾을 수 없습니다.' };
        }
        return inventoryApi.calibrateItem(instance.instanceId);
    },
    
    /**
     * 아이템 판매
     * @param {string} itemId
     */
    sellItem: async (itemId) => {
        if (USE_API) {
            return apiClient.post(`/inventory/${itemId}/sell`);
        }
        const instance = userInventoryInstances.getByItemId(itemId);
        if (instance) {
            userInventoryInstances.removeInstance(instance.instanceId);
        }
        return { success: true };
    },

    // ===== [New] 검교정(강화) API =====

    /**
     * 아이템 검교정 (강화) 요청
     * POST /api/v1/inventory/calibrate
     * @param {string} instanceId - 아이템 인스턴스 ID
     * @returns {Object} 검교정 결과
     */
    calibrateItem: async (instanceId) => {
        if (USE_API) {
            return apiClient.post('/inventory/calibrate', { instanceId });
        }
        // localStorage fallback - calibrationService 직접 호출
        const result = attemptCalibration(instanceId);
        return {
            data: result,
            success: result.success,
            status: result.status,
            message: result.message
        };
    },

    /**
     * 검교정 정보 조회 (UI용)
     * @param {string} itemId - 아이템 ID
     * @returns {Object} 검교정 정보
     */
    getCalibrationInfo: async (itemId) => {
        if (USE_API) {
            return apiClient.get(`/inventory/${itemId}/calibration`);
        }
        const info = getCalibrationInfo(itemId);
        return { data: info, success: !!info };
    },

    /**
     * 검교정 미리보기 (예상 스탯)
     * @param {string} itemId - 아이템 ID
     * @param {number} currentLevel - 현재 레벨
     * @returns {Object} 예상 스탯 정보
     */
    getCalibrationPreview: async (itemId, currentLevel = 0) => {
        if (USE_API) {
            return apiClient.get(`/inventory/${itemId}/calibration/preview?level=${currentLevel}`);
        }
        const preview = previewCalibrationStats(itemId, currentLevel);
        return { data: preview, success: !!preview };
    },

    // ===== [New] 활성 스탯 API =====

    /**
     * 사용자의 현재 활성 스탯 조회
     * GET /api/v1/user/{userId}/stats/active
     * @returns {Object} 활성 스탯 정보
     */
    getActiveStats: async () => {
        if (USE_API) {
            return apiClient.get('/user/stats/active');
        }
        // localStorage fallback
        const stats = getActiveStatsForHUD();
        return {
            data: {
                totalPointBoost: stats.totalPointBoost,
                totalXpAccelerator: stats.totalXpAccelerator,
                totalStreakSaver: stats.totalStreakSaver,
                activeSetBonuses: stats.activeSetBonuses,
                visualAura: stats.visualAura
            },
            success: true
        };
    },

    /**
     * 세트 효과 목록 조회
     * @returns {Object} 활성화된 세트 효과 목록
     */
    getSetBonuses: async () => {
        if (USE_API) {
            return apiClient.get('/user/stats/sets');
        }
        const bonuses = calculateSetBonuses();
        return { data: bonuses, success: true };
    },

    /**
     * 총 스탯 합계 조회 (아이템 + 세트)
     * @returns {Object} 총 스탯
     */
    getTotalStats: async () => {
        if (USE_API) {
            return apiClient.get('/user/stats/total');
        }
        const stats = getTotalCombinedStats();
        return { data: stats, success: true };
    },

    // ===== 유틸리티 =====

    /**
     * 인스턴스 ID로 아이템 정보 조회
     * @param {string} instanceId
     */
    getItemByInstanceId: async (instanceId) => {
        if (USE_API) {
            return apiClient.get(`/inventory/instance/${instanceId}`);
        }
        const instance = userInventoryInstances.getByInstanceId(instanceId);
        if (!instance) {
            return { data: null, success: false };
        }
        const item = getItemById(instance.itemId);
        return {
            data: { instance, item },
            success: true
        };
    },

    /**
     * 포인트 잔액 확인
     */
    getPointsBalance: async () => {
        if (USE_API) {
            return apiClient.get('/user/points');
        }
        return { data: { points: points.get() }, success: true };
    }
};

export default inventoryApi;
