/**
 * 데이터 마이그레이션 유틸리티
 * 기존 인벤토리 데이터를 새로운 instanceId 기반 시스템으로 마이그레이션
 */

import { inventory, userInventoryInstances, equippedItems, storage } from './storage';
import { getItemById } from '../data/itemsData';

const MIGRATION_VERSION_KEY = 'safety_quest_migration_version';
const CURRENT_MIGRATION_VERSION = 2; // Item System 2.0

/**
 * 마이그레이션이 필요한지 확인
 */
export const needsMigration = () => {
    const currentVersion = storage.get(MIGRATION_VERSION_KEY, 0);
    return currentVersion < CURRENT_MIGRATION_VERSION;
};

/**
 * 현재 마이그레이션 버전 가져오기
 */
export const getMigrationVersion = () => {
    return storage.get(MIGRATION_VERSION_KEY, 0);
};

/**
 * 마이그레이션 버전 업데이트
 */
const setMigrationVersion = (version) => {
    return storage.set(MIGRATION_VERSION_KEY, version);
};

/**
 * 기존 인벤토리 아이템을 인스턴스로 마이그레이션
 * - 기존: inventory = ['helmet_common_1', 'vest_rare_1', ...]
 * - 신규: userInventoryInstances = [{ instanceId, itemId, calibrationLevel, activeStats, ... }]
 */
const migrateInventoryToInstances = () => {
    const oldInventory = inventory.get();
    const existingInstances = userInventoryInstances.get();
    
    // 이미 인스턴스가 있는 아이템 ID 목록
    const existingItemIds = new Set(existingInstances.map(inst => inst.itemId));
    
    let migratedCount = 0;
    
    oldInventory.forEach(itemId => {
        // 이미 인스턴스가 있으면 스킵
        if (existingItemIds.has(itemId)) {
            return;
        }
        
        const item = getItemById(itemId);
        if (!item) {
            console.warn(`Migration: Item not found - ${itemId}`);
            return;
        }
        
        // 새 인스턴스 생성
        const newInstance = {
            instanceId: crypto.randomUUID(),
            itemId: itemId,
            currentCalibrationLevel: 0,
            setId: item.setId || null,
            activeStats: {
                pointBoost: item.baseStats?.pointBoost || item.effect?.bonus || 0,
                xpAccelerator: item.baseStats?.xpAccelerator || 0,
                streakSaver: item.baseStats?.streakSaver || 0
            },
            acquiredAt: new Date().toISOString(),
            lastCalibratedAt: null,
            totalCalibrationAttempts: 0,
            successfulCalibrations: 0,
            migratedFromLegacy: true
        };
        
        existingInstances.push(newInstance);
        migratedCount++;
    });
    
    userInventoryInstances.set(existingInstances);
    
    console.log(`Migration: Created ${migratedCount} new item instances`);
    return migratedCount;
};

/**
 * 장착된 아이템 데이터 마이그레이션
 * - 기존: { helmet: 'helmet_common_1' } 또는 { helmet: { itemId, enhancementLevel } }
 * - 신규: 인스턴스 기반 참조 확인
 */
const migrateEquippedItems = () => {
    const equipped = equippedItems.get();
    const instances = userInventoryInstances.get();
    
    Object.entries(equipped).forEach(([category, data]) => {
        const itemId = typeof data === 'string' ? data : data?.itemId;
        if (!itemId) return;
        
        // 해당 아이템의 인스턴스가 있는지 확인
        const instance = instances.find(inst => inst.itemId === itemId);
        if (!instance) {
            // 인스턴스가 없으면 생성
            const item = getItemById(itemId);
            if (item) {
                const newInstance = {
                    instanceId: crypto.randomUUID(),
                    itemId: itemId,
                    currentCalibrationLevel: typeof data === 'object' ? (data.enhancementLevel || 0) : 0,
                    setId: item.setId || null,
                    activeStats: {
                        pointBoost: item.baseStats?.pointBoost || item.effect?.bonus || 0,
                        xpAccelerator: item.baseStats?.xpAccelerator || 0,
                        streakSaver: item.baseStats?.streakSaver || 0
                    },
                    acquiredAt: new Date().toISOString(),
                    lastCalibratedAt: null,
                    totalCalibrationAttempts: 0,
                    successfulCalibrations: 0,
                    migratedFromLegacy: true
                };
                instances.push(newInstance);
            }
        }
    });
    
    userInventoryInstances.set(instances);
};

/**
 * 전체 마이그레이션 실행
 */
export const runMigration = () => {
    const currentVersion = getMigrationVersion();
    
    console.log(`Starting migration from version ${currentVersion} to ${CURRENT_MIGRATION_VERSION}`);
    
    try {
        // Version 1 -> 2: 인스턴스 기반 시스템으로 마이그레이션
        if (currentVersion < 2) {
            console.log('Running migration v2: Instance-based inventory system');
            
            // 1. 인벤토리 아이템을 인스턴스로 변환
            const inventoryMigrated = migrateInventoryToInstances();
            
            // 2. 장착된 아이템 확인 및 인스턴스 생성
            migrateEquippedItems();
            
            console.log(`Migration v2 completed: ${inventoryMigrated} items migrated`);
        }
        
        // 마이그레이션 버전 업데이트
        setMigrationVersion(CURRENT_MIGRATION_VERSION);
        
        console.log(`Migration completed. Current version: ${CURRENT_MIGRATION_VERSION}`);
        
        return {
            success: true,
            previousVersion: currentVersion,
            newVersion: CURRENT_MIGRATION_VERSION
        };
    } catch (error) {
        console.error('Migration failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * 마이그레이션 상태 확인
 */
export const getMigrationStatus = () => {
    const currentVersion = getMigrationVersion();
    const inventoryCount = inventory.get().length;
    const instanceCount = userInventoryInstances.get().length;
    
    return {
        currentVersion,
        latestVersion: CURRENT_MIGRATION_VERSION,
        needsMigration: currentVersion < CURRENT_MIGRATION_VERSION,
        inventoryItemCount: inventoryCount,
        instanceCount: instanceCount,
        missingInstances: inventoryCount - instanceCount
    };
};

/**
 * 앱 시작 시 자동 마이그레이션 체크
 */
export const checkAndRunMigration = () => {
    if (needsMigration()) {
        console.log('Migration needed. Running automatic migration...');
        return runMigration();
    }
    console.log('No migration needed. Data is up to date.');
    return { success: true, skipped: true };
};

/**
 * 마이그레이션 롤백 (디버그용)
 * 주의: 데이터 손실 가능
 */
export const rollbackMigration = () => {
    if (process.env.NODE_ENV !== 'development') {
        console.warn('Rollback is only available in development mode');
        return false;
    }
    
    // 인스턴스 데이터 삭제
    storage.remove('safety_quest_inventory_instances');
    storage.remove('safety_quest_calibration_logs');
    storage.remove(MIGRATION_VERSION_KEY);
    
    console.log('Migration rolled back. Please refresh the page.');
    return true;
};

export default {
    needsMigration,
    getMigrationVersion,
    getMigrationStatus,
    runMigration,
    checkAndRunMigration,
    rollbackMigration
};

