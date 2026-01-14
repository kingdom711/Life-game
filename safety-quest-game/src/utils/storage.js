// LocalStorage 키
const STORAGE_KEYS = {
    USER_PROFILE: 'safety_quest_user_profile',
    QUEST_PROGRESS: 'safety_quest_quest_progress',
    INVENTORY: 'safety_quest_inventory',
    EQUIPPED_ITEMS: 'safety_quest_equipped_items',
    INVENTORY_INSTANCES: 'safety_quest_inventory_instances', // [New] 아이템 인스턴스
    CALIBRATION_LOGS: 'safety_quest_calibration_logs', // [New] 검교정 로그
    POINTS: 'safety_quest_points',
    POINTS_HISTORY: 'safety_quest_points_history',
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

// ===== [New] 아이템 인스턴스 관리 (Item System 2.0) =====
// instanceId 기반으로 개별 아이템의 검교정 레벨과 활성 스탯 추적
export const userInventoryInstances = {
    get: () => {
        return storage.get(STORAGE_KEYS.INVENTORY_INSTANCES, []);
    },

    set: (instances) => {
        return storage.set(STORAGE_KEYS.INVENTORY_INSTANCES, instances);
    },

    // instanceId로 아이템 인스턴스 조회
    getByInstanceId: (instanceId) => {
        const instances = userInventoryInstances.get();
        return instances.find(inst => inst.instanceId === instanceId) || null;
    },

    // itemId로 아이템 인스턴스 조회
    getByItemId: (itemId) => {
        const instances = userInventoryInstances.get();
        return instances.find(inst => inst.itemId === itemId) || null;
    },

    // 새 아이템 인스턴스 생성 (아이템 획득 시)
    createInstance: (itemId, baseStats, setId = null) => {
        const instances = userInventoryInstances.get();
        
        // 이미 같은 itemId의 인스턴스가 있는지 확인
        const existing = instances.find(inst => inst.itemId === itemId);
        if (existing) {
            return existing; // 이미 존재하면 기존 인스턴스 반환
        }

        const newInstance = {
            instanceId: crypto.randomUUID(),
            itemId: itemId,
            currentCalibrationLevel: 0,
            setId: setId,
            // 활성 스탯 (baseStats와 동일하게 시작)
            activeStats: {
                pointBoost: baseStats?.pointBoost || 0,
                xpAccelerator: baseStats?.xpAccelerator || 0,
                streakSaver: baseStats?.streakSaver || 0
            },
            // 메타데이터
            acquiredAt: new Date().toISOString(),
            lastCalibratedAt: null,
            totalCalibrationAttempts: 0,
            successfulCalibrations: 0
        };

        instances.push(newInstance);
        userInventoryInstances.set(instances);
        return newInstance;
    },

    // 인스턴스 업데이트 (검교정 후)
    updateInstance: (instanceId, updates) => {
        const instances = userInventoryInstances.get();
        const index = instances.findIndex(inst => inst.instanceId === instanceId);
        
        if (index === -1) return null;

        instances[index] = {
            ...instances[index],
            ...updates,
            lastModifiedAt: new Date().toISOString()
        };

        userInventoryInstances.set(instances);
        return instances[index];
    },

    // 검교정 레벨 업데이트 및 스탯 재계산
    updateCalibrationLevel: (instanceId, newLevel, newActiveStats) => {
        const instances = userInventoryInstances.get();
        const index = instances.findIndex(inst => inst.instanceId === instanceId);
        
        if (index === -1) return null;

        instances[index] = {
            ...instances[index],
            currentCalibrationLevel: newLevel,
            activeStats: newActiveStats,
            lastCalibratedAt: new Date().toISOString()
        };

        userInventoryInstances.set(instances);
        return instances[index];
    },

    // 검교정 시도 기록
    recordCalibrationAttempt: (instanceId, isSuccess) => {
        const instances = userInventoryInstances.get();
        const index = instances.findIndex(inst => inst.instanceId === instanceId);
        
        if (index === -1) return null;

        instances[index].totalCalibrationAttempts += 1;
        if (isSuccess) {
            instances[index].successfulCalibrations += 1;
        }

        userInventoryInstances.set(instances);
        return instances[index];
    },

    // 인스턴스 삭제 (아이템 판매 등)
    removeInstance: (instanceId) => {
        let instances = userInventoryInstances.get();
        instances = instances.filter(inst => inst.instanceId !== instanceId);
        return userInventoryInstances.set(instances);
    },

    // 모든 장착 중인 아이템의 인스턴스 가져오기
    getEquippedInstances: () => {
        const equipped = equippedItems.get();
        const instances = userInventoryInstances.get();
        const result = {};

        Object.entries(equipped).forEach(([category, data]) => {
            const itemId = typeof data === 'string' ? data : data?.itemId;
            if (itemId) {
                const instance = instances.find(inst => inst.itemId === itemId);
                if (instance) {
                    result[category] = instance;
                }
            }
        });

        return result;
    }
};

// ===== [New] 검교정 로그 (Calibration History) =====
export const calibrationLogs = {
    get: () => {
        return storage.get(STORAGE_KEYS.CALIBRATION_LOGS, []);
    },

    add: (log) => {
        const logs = calibrationLogs.get();
        const newLog = {
            id: crypto.randomUUID(),
            ...log,
            timestamp: new Date().toISOString()
        };
        logs.push(newLog);
        
        // 최근 100개만 유지
        if (logs.length > 100) {
            logs.shift();
        }
        
        storage.set(STORAGE_KEYS.CALIBRATION_LOGS, logs);
        return newLog;
    },

    getByInstanceId: (instanceId) => {
        const logs = calibrationLogs.get();
        return logs.filter(log => log.instanceId === instanceId);
    },

    getRecent: (count = 10) => {
        const logs = calibrationLogs.get();
        return logs.slice(-count).reverse();
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

    /**
     * 포인트 추가 및 히스토리 자동 기록
     * @param {number} amount - 추가할 포인트
     * @param {string} source - 출처 ('퀘스트 완료', '출석 체크', '출석 보너스', '레벨업 보상', '기타')
     * @param {string} sourceDetail - 상세 설명 (예: '일일 퀘스트: 안전모 착용 점검')
     */
    add: (amount, source = '기타', sourceDetail = '') => {
        const current = points.get();
        const newBalance = current + amount;
        points.set(newBalance);
        
        // 히스토리 자동 기록
        pointsHistory.add({
            amount: amount,
            source: source,
            sourceDetail: sourceDetail,
            balance: newBalance
        });
        
        return newBalance;
    },

    subtract: (amount, source = '아이템 구매', sourceDetail = '') => {
        const current = points.get();
        const newPoints = Math.max(0, current - amount);
        points.set(newPoints);
        
        // 차감도 히스토리에 기록 (음수로)
        if (amount > 0) {
            pointsHistory.add({
                amount: -amount,
                source: source,
                sourceDetail: sourceDetail,
                balance: newPoints
            });
        }
        
        return newPoints;
    },

    canAfford: (amount) => {
        return points.get() >= amount;
    }
};

// 포인트 히스토리
export const pointsHistory = {
    get: () => {
        return storage.get(STORAGE_KEYS.POINTS_HISTORY, []);
    },

    set: (history) => {
        // 최대 500개까지만 저장
        const limitedHistory = history.slice(-500);
        return storage.set(STORAGE_KEYS.POINTS_HISTORY, limitedHistory);
    },

    add: (entry) => {
        const history = pointsHistory.get();
        const newEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            amount: entry.amount,
            source: entry.source || '기타',
            sourceDetail: entry.sourceDetail || '',
            balance: entry.balance || points.get()
        };
        history.push(newEntry);
        pointsHistory.set(history);
        return newEntry;
    },

    getRecent: (count = 100) => {
        const history = pointsHistory.get();
        return history.slice(-count).reverse();
    },

    getTotalBySource: () => {
        const history = pointsHistory.get();
        const totals = {};
        history.forEach(entry => {
            if (entry.amount > 0) {
                totals[entry.source] = (totals[entry.source] || 0) + entry.amount;
            }
        });
        return totals;
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

// 로컬 시간대 기준 날짜 문자열 생성 헬퍼 함수
const getLocalDateString = (date = new Date()) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
        const today = getLocalDateString(now);

        const streakData = streak.get();
        const lastLoginDate = streakData.lastLoginDate ? streakData.lastLoginDate.split('T')[0] : null;

        if (lastLoginDate === today) {
            return { success: false, message: '오늘은 이미 출석했습니다.' };
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

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
        points.add(20, '출석 체크', `${streakData.current}일 연속 출석`);

        return { success: true, message: '출석 완료! +1 스트릭', streak: streakData.current };
    },

    // 오늘 출석 여부 확인
    isCheckedInToday: () => {
        const streakData = streak.get();
        if (!streakData.lastLoginDate) return false;

        const today = getLocalDateString();
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

// 위험요인 발굴 퀘스트 이미지 목록
const HAZARD_QUEST_IMAGES = [
    '/hazzard/hazzard1.png',
    '/assets/중장비.png'
];

// 랜덤 이미지 선택 함수
const getRandomHazardImage = () => {
    const randomIndex = Math.floor(Math.random() * HAZARD_QUEST_IMAGES.length);
    return HAZARD_QUEST_IMAGES[randomIndex];
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
                photoUrl: getRandomHazardImage(), // 랜덤 이미지 선택
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

// 출석 기록 (Attendance_Log)
export const attendanceLogs = {
    get: () => {
        return storage.get('safety_quest_attendance_logs', []);
    },

    add: (log) => {
        const logs = attendanceLogs.get();
        const newLog = {
            id: Date.now(), // Simple ID
            ...log,
            rewardStatus: log.rewardStatus || 'PENDING'
        };
        logs.push(newLog);
        storage.set('safety_quest_attendance_logs', logs);
        return newLog;
    },

    getLastLog: () => {
        const logs = attendanceLogs.get();
        if (logs.length === 0) return null;
        return logs[logs.length - 1];
    }
};

// 월간 출석 보상 데이터
export const MONTHLY_REWARDS = [
    { day: 1, type: 'points', amount: 30, name: '30 포인트' },
    { day: 2, type: 'points', amount: 40, name: '40 포인트' },
    { day: 3, type: 'points', amount: 50, name: '50 포인트' },
    { day: 4, type: 'points', amount: 60, name: '60 포인트' },
    { day: 5, type: 'points', amount: 70, name: '70 포인트' },
    { day: 6, type: 'points', amount: 80, name: '80 포인트' },
    { day: 7, type: 'points', amount: 90, name: '90 포인트' },
    { day: 8, type: 'points', amount: 100, name: '100 포인트' },
    { day: 9, type: 'box', boxType: 'common', name: '일반 아이템 상자' },
    { day: 10, type: 'points', amount: 150, name: '150 포인트' },
    { day: 11, type: 'points', amount: 200, name: '200 포인트' },
    { day: 12, type: 'box', boxType: 'rare', name: '고급 아이템 상자' },
    { day: 13, type: 'points', amount: 250, name: '250 포인트' },
    { day: 14, type: 'points', amount: 300, name: '300 포인트' },
    { day: 15, type: 'box', boxType: 'epic', name: '희귀 아이템 상자' },
    { day: 16, type: 'points', amount: 350, name: '350 포인트' },
    { day: 17, type: 'points', amount: 400, name: '400 포인트' },
    { day: 18, type: 'points', amount: 450, name: '450 포인트' },
    { day: 19, type: 'box', boxType: 'legendary', name: '전설 아이템 상자' },
    { day: 20, type: 'points', amount: 500, name: '500 포인트' },
    { day: 21, type: 'points', amount: 600, name: '600 포인트' },
    { day: 22, type: 'points', amount: 700, name: '700 포인트' },
    { day: 23, type: 'points', amount: 800, name: '800 포인트' },
    { day: 24, type: 'points', amount: 1000, name: '1000 포인트' },
    { day: 25, type: 'box', boxType: 'special', name: '특별 아이템 상자' },
    { day: 26, type: 'grand', amount: 2000, name: '만근 대보상 (2000P + 전설 아이템)' }
];

// 월간 출석 관리
export const monthlyAttendance = {
    getStorageKey: () => 'safety_quest_monthly_attendance',

    getCurrentMonth: () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },

    get: () => {
        const data = storage.get('safety_quest_monthly_attendance', {
            currentMonth: null,
            attendedDays: [],
            claimedRewards: [],
            totalAttendance: 0
        });

        // 월이 바뀌었으면 초기화
        const currentMonth = monthlyAttendance.getCurrentMonth();
        if (data.currentMonth !== currentMonth) {
            return {
                currentMonth: currentMonth,
                attendedDays: [],
                claimedRewards: [],
                totalAttendance: 0
            };
        }

        return data;
    },

    set: (data) => {
        return storage.set('safety_quest_monthly_attendance', data);
    },

    // 오늘 출석 기록
    recordAttendance: () => {
        const data = monthlyAttendance.get();
        const today = new Date().getDate();

        if (!data.attendedDays.includes(today)) {
            data.attendedDays.push(today);
            data.totalAttendance = data.attendedDays.length;
            data.currentMonth = monthlyAttendance.getCurrentMonth();
            monthlyAttendance.set(data);
        }

        return data;
    },

    // 보상 수령
    claimReward: (rewardDay) => {
        const data = monthlyAttendance.get();

        // 이미 수령한 보상인지 확인
        if (data.claimedRewards.includes(rewardDay)) {
            return { success: false, message: '이미 수령한 보상입니다.' };
        }

        // 출석일 수가 충분한지 확인
        if (data.totalAttendance < rewardDay) {
            return { success: false, message: '출석일이 부족합니다.' };
        }

        const reward = MONTHLY_REWARDS.find(r => r.day === rewardDay);
        if (!reward) {
            return { success: false, message: '보상을 찾을 수 없습니다.' };
        }

        // 보상 지급
        if (reward.type === 'points') {
            points.add(reward.amount, '출석 보너스', `${rewardDay}일 출석 보상: ${reward.name}`);
        } else if (reward.type === 'grand') {
            points.add(reward.amount, '출석 보너스', `만근 대보상: ${reward.name}`);
            // 전설 아이템은 랜덤으로 지급 (예시)
            // inventory.addItem('legendary_item');
        }
        // box 타입은 별도 처리 필요 (아이템 상자 시스템)

        data.claimedRewards.push(rewardDay);
        monthlyAttendance.set(data);

        return { success: true, reward: reward };
    },

    // 수령 가능한 보상 목록
    getClaimableRewards: () => {
        const data = monthlyAttendance.get();
        return MONTHLY_REWARDS.filter(reward =>
            data.totalAttendance >= reward.day &&
            !data.claimedRewards.includes(reward.day)
        );
    },

    // 오늘 출석했는지 확인
    hasAttendedToday: () => {
        const data = monthlyAttendance.get();
        const today = new Date().getDate();
        return data.attendedDays.includes(today);
    }
};

// 주간 퀘스트 진행도 (Weekly_Quest_Progress)
export const weeklyQuestProgress = {
    get: () => {
        return storage.get('safety_quest_weekly_progress', []);
    },

    getByWeekAndType: (weekNumber, questType) => {
        const progressList = weeklyQuestProgress.get();
        return progressList.find(p => p.weekNumber === weekNumber && p.questType === questType);
    },

    update: (weekNumber, questType, increment = 1, targetCount = 5) => {
        const progressList = weeklyQuestProgress.get();
        let progress = progressList.find(p => p.weekNumber === weekNumber && p.questType === questType);

        if (progress) {
            progress.currentCount += increment;
            progress.isCompleted = progress.currentCount >= progress.targetCount;
        } else {
            progress = {
                id: Date.now(),
                userId: userProfile.get().name || 'guest', // Simple user mapping
                weekNumber,
                questType,
                currentCount: increment,
                targetCount,
                isCompleted: increment >= targetCount
            };
            progressList.push(progress);
        }

        storage.set('safety_quest_weekly_progress', progressList);
        return progress;
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
    userInventoryInstances,
    calibrationLogs,
    hazardLogs,
    dailyQuestInstances,
    hazardIdentificationLogs,
    actionRecords,
    gemsAnalysisLogs,
    attendanceLogs,
    weeklyQuestProgress,
    monthlyAttendance,
    MONTHLY_REWARDS
};
