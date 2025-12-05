// LocalStorage 키
const STORAGE_KEYS = {
    USER_PROFILE: 'safety_quest_user_profile',
    QUEST_PROGRESS: 'safety_quest_quest_progress',
    INVENTORY: 'safety_quest_inventory',
    EQUIPPED_ITEMS: 'safety_quest_equipped_items',
    POINTS: 'safety_quest_points',
    LEVEL: 'safety_quest_level',
    STREAK: 'safety_quest_streak',
    LAST_LOGIN: 'safety_quest_last_login'
};

// LocalStorage 래퍼 함수들
export const storage = {
    // 데이터 저장
    set: (key, value) => {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // 데이터 불러오기
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    // 데이터 삭제
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // 모든 데이터 삭제
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// 사용자 프로필
export const userProfile = {
    get: () => {
        return storage.get(STORAGE_KEYS.USER_PROFILE, {
            role: null,
            name: null,
            joinDate: new Date().toISOString()
        });
    },

    set: (profile) => {
        return storage.set(STORAGE_KEYS.USER_PROFILE, profile);
    },

    getRole: () => {
        const profile = userProfile.get();
        return profile.role;
    },

    setRole: (role) => {
        const profile = userProfile.get();
        profile.role = role;
        return userProfile.set(profile);
    },

    getName: () => {
        const profile = userProfile.get();
        return profile.name;
    },

    setName: (name) => {
        const profile = userProfile.get();
        profile.name = name;
        return userProfile.set(profile);
    }
};

// 퀘스트 진행도
export const questProgress = {
    get: () => {
        return storage.get(STORAGE_KEYS.QUEST_PROGRESS, {});
    },

    set: (progress) => {
        return storage.set(STORAGE_KEYS.QUEST_PROGRESS, progress);
    },

    getQuestProgress: (questId) => {
        const allProgress = questProgress.get();
        return allProgress[questId] || { current: 0, completed: false };
    },

    updateQuestProgress: (questId, current, completed = false) => {
        const allProgress = questProgress.get();
        allProgress[questId] = { current, completed };
        return questProgress.set(allProgress);
    },

    completeQuest: (questId) => {
        const allProgress = questProgress.get();
        if (allProgress[questId]) {
            allProgress[questId].completed = true;
        }
        return questProgress.set(allProgress);
    },

    resetQuests: (questIds) => {
        const allProgress = questProgress.get();
        questIds.forEach(questId => {
            if (allProgress[questId]) {
                allProgress[questId] = { current: 0, completed: false };
            }
        });
        return questProgress.set(allProgress);
    }
};

// 인벤토리
export const inventory = {
    get: () => {
        return storage.get(STORAGE_KEYS.INVENTORY, []);
    },

    set: (items) => {
        return storage.set(STORAGE_KEYS.INVENTORY, items);
    },

    addItem: (itemId) => {
        const items = inventory.get();
        if (!items.includes(itemId)) {
            items.push(itemId);
            return inventory.set(items);
        }
        return false;
    },

    hasItem: (itemId) => {
        const items = inventory.get();
        return items.includes(itemId);
    },

    removeItem: (itemId) => {
        let items = inventory.get();
        items = items.filter(id => id !== itemId);
        return inventory.set(items);
    }
};

// 장착된 아이템 (Item_Gear 모델)
export const equippedItems = {
    get: () => {
        return storage.get(STORAGE_KEYS.EQUIPPED_ITEMS, {});
    },

    set: (equipped) => {
        return storage.set(STORAGE_KEYS.EQUIPPED_ITEMS, equipped);
    },

    // 특정 카테고리의 장착 아이템 ID 반환 (하위 호환성 유지)
    getEquipped: (category) => {
        const equipped = equippedItems.get();
        const itemData = equipped[category];
        if (!itemData) return null;
        return typeof itemData === 'string' ? itemData : itemData.itemId;
    },

    // 특정 카테고리의 장착 아이템 전체 데이터 반환 (강화 레벨 포함)
    getEquippedData: (category) => {
        const equipped = equippedItems.get();
        const itemData = equipped[category];
        if (!itemData) return null;
        return typeof itemData === 'string' ? { itemId: itemData, enhancementLevel: 0 } : itemData;
    },

    // 아이템 장착 (강화 레벨 포함)
    equip: (category, itemId, enhancementLevel = 0) => {
        const equipped = equippedItems.get();
        equipped[category] = { itemId, enhancementLevel };
        return equippedItems.set(equipped);
    },

    unequip: (category) => {
        const equipped = equippedItems.get();
        delete equipped[category];
        return equippedItems.set(equipped);
    }
};

// 포인트
export const points = {
    get: () => {
        return storage.get(STORAGE_KEYS.POINTS, 0);
    },

    set: (pointsValue) => {
        return storage.set(STORAGE_KEYS.POINTS, pointsValue);
    },

    add: (amount) => {
        const current = points.get();
        return points.set(current + amount);
    },

    subtract: (amount) => {
        const current = points.get();
        const newPoints = Math.max(0, current - amount);
        return points.set(newPoints);
    },

    canAfford: (amount) => {
        return points.get() >= amount;
    }
};

// 레벨
export const level = {
    get: () => {
        return storage.get(STORAGE_KEYS.LEVEL, {
            current: 1,
            exp: 0,
            expToNext: 100
        });
    },

    set: (levelData) => {
        return storage.set(STORAGE_KEYS.LEVEL, levelData);
    },

    addExp: (expAmount) => {
        const levelData = level.get();
        levelData.exp += expAmount;

        // 레벨업 체크
        while (levelData.exp >= levelData.expToNext) {
            levelData.exp -= levelData.expToNext;
            levelData.current += 1;
            levelData.expToNext = Math.floor(levelData.expToNext * 1.5);
        }

        return level.set(levelData);
    }
};

// 스트릭 (연속 로그인) - 수동 체크인 방식
export const streak = {
    get: () => {
        return storage.get(STORAGE_KEYS.STREAK, {
            current: 0,
            longest: 0,
            lastLoginDate: null
        });
    },

    set: (streakData) => {
        return storage.set(STORAGE_KEYS.STREAK, streakData);
    },

    // 수동 출석 체크
    checkIn: () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];

        const streakData = streak.get();
        const lastLoginDate = streakData.lastLoginDate ? streakData.lastLoginDate.split('T')[0] : null;

        if (lastLoginDate === today) {
            return { success: false, message: '오늘은 이미 출석했습니다.' };
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLoginDate === yesterdayStr) {
            // 연속 출석
            streakData.current += 1;
            streakData.longest = Math.max(streakData.longest, streakData.current);
        } else {
            // 스트릭 끊김 (또는 첫 출석)
            streakData.current = 1;
            if (streakData.longest === 0) streakData.longest = 1;
        }

        streakData.lastLoginDate = now.toISOString();
        streak.set(streakData);

        // 포인트 보상 (출석 보상 20포인트)
        points.add(20);

        return { success: true, message: '출석 완료! +1 스트릭', streak: streakData.current };
    },

    // 오늘 출석 여부 확인
    isCheckedInToday: () => {
        const streakData = streak.get();
        if (!streakData.lastLoginDate) return false;

        const today = new Date().toISOString().split('T')[0];
        const lastLogin = streakData.lastLoginDate.split('T')[0];
        return today === lastLogin;
    }
};

// 초기화 함수
export const initializeUserData = () => {
    if (!userProfile.getRole()) {
        // 첫 방문자 - 기본값 설정
        points.set(500); // 시작 포인트 (아이템 구매 테스트용)
        level.set({
            current: 1,
            exp: 0,
            expToNext: 100
        });
        streak.get(); // 데이터 초기화 확인만 수행
    } else {
        // 기존 사용자
    }
};

// 위험 발굴 로그 관리
export const hazardLogs = {
    get: () => {
        return storage.get('safety_quest_hazard_logs', []);
    },
    add: (log) => {
        const logs = hazardLogs.get();
        logs.push(log);
        return storage.set('safety_quest_hazard_logs', logs);
    },
    // 오늘 날짜의 퀘스트 수행 여부 확인
    hasCompletedToday: (userId) => {
        const logs = hazardLogs.get();
        const today = new Date().toISOString().split('T')[0];
        // userId가 없으면(비로그인 등) 로컬스토리지 전체에서 오늘 날짜 확인
        return logs.some(log => log.questDate === today);
    }
};

// 일일 퀘스트 인스턴스 (Daily_Quest_Instance)
export const dailyQuestInstances = {
    get: () => {
        return storage.get('safety_quest_daily_instances', []);
    },

    // 오늘 날짜의 퀘스트 인스턴스 가져오기 (없으면 생성)
    getTodayInstance: (userId) => {
        const instances = dailyQuestInstances.get();
        const today = new Date().toISOString().split('T')[0];

        let instance = instances.find(inst => inst.userId === userId && inst.questDate === today);

        if (!instance) {
            instance = {
                id: crypto.randomUUID(),
                userId: userId,
                questDate: today,
                photoUrl: '/hazzard/hazzard1.png', // 기본 이미지
                isCompleted: false,
                attemptCount: 0,
                completionTimestamp: null
            };
            instances.push(instance);
            storage.set('safety_quest_daily_instances', instances);
        }

        return instance;
    },

    // 퀘스트 완료 처리
    complete: (instanceId) => {
        const instances = dailyQuestInstances.get();
        const index = instances.findIndex(inst => inst.id === instanceId);

        if (index !== -1) {
            instances[index].isCompleted = true;
            instances[index].completionTimestamp = new Date().toISOString();
            instances[index].attemptCount += 1;
            storage.set('safety_quest_daily_instances', instances);
            return true;
        }
        return false;
    }
};

// 위험 요인 식별 로그 (Hazard_Identification_Log)
export const hazardIdentificationLogs = {
    get: () => {
        return storage.get('safety_quest_hazard_id_logs', []);
    },

    add: (instanceId, x, y, text) => {
        const logs = hazardIdentificationLogs.get();
        const newLog = {
            id: crypto.randomUUID(),
            instanceId: instanceId,
            xCoord: x,
            yCoord: y,
            userIdentifiedHazard: text,
            timestamp: new Date().toISOString()
        };
        logs.push(newLog);
        storage.set('safety_quest_hazard_id_logs', logs);
        return newLog;
    },

    getByInstanceId: (instanceId) => {
        const logs = hazardIdentificationLogs.get();
        return logs.filter(log => log.instanceId === instanceId);
    }
};

// 조치 기록 (ActionRecord)
export const actionRecords = {
    get: () => {
        return storage.get('safety_quest_action_records', []);
    },

    add: (record) => {
        const records = actionRecords.get();
        const newRecord = {
            id: crypto.randomUUID(),
            ...record,
            status: record.status || 'draft', // draft, completed
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        records.push(newRecord);
        storage.set('safety_quest_action_records', records);
        return newRecord;
    },

    update: (id, updates) => {
        const records = actionRecords.get();
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
            storage.set('safety_quest_action_records', records);
            return records[index];
        }
        return null;
    }
};

// GEMS 분석 로그 (GEMSAnalysisLog)
export const gemsAnalysisLogs = {
    get: () => {
        return storage.get('safety_quest_gems_logs', []);
    },

    add: (log) => {
        const logs = gemsAnalysisLogs.get();
        const newLog = {
            id: crypto.randomUUID(),
            ...log,
            analyzedAt: new Date().toISOString()
        };
        logs.push(newLog);
        storage.set('safety_quest_gems_logs', logs);
        return newLog;
    }
};

export default {
    userProfile,
    points,
    level,
    streak,
    questProgress,
    inventory,
    equippedItems,
    hazardLogs,
    dailyQuestInstances,
    hazardIdentificationLogs,
    actionRecords,
    gemsAnalysisLogs
};
