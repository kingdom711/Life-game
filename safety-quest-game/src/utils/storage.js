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
    LAST_LOGIN: 'safety_quest_last_login',
    // [New] 마이크로 러닝 교육 시스템
    EDUCATION_PROGRESS: 'safety_quest_education_progress', // 현재 진행 중인 교육 상태
    EDUCATION_HISTORY: 'safety_quest_education_history',   // 완료한 교육 이력
    LEGAL_HOURS: 'safety_quest_legal_hours',               // 누적 법정 교육 시간
    EDUCATION_QUIZ_ATTEMPTS: 'safety_quest_quiz_attempts',  // 퀴즈 시도 횟수
    // [New] 전직(특수역할) 시스템
    SPECIALIZATION_DATA: 'safety_quest_specialization',         // 전직 상태 (활성 전직, 해금 목록)
    SPECIALIZATION_PROGRESS: 'safety_quest_spec_progress',      // 전직 교육 진행 상황
    SPECIALIZATION_QUIZ_ATTEMPTS: 'safety_quest_spec_quiz_attempts',  // 전직 퀴즈 시도 횟수
    // [New] 날씨 연동 안전 팁
    WEATHER_CACHE: 'safety_quest_weather_cache',                // 날씨 API 캐시
    // [New] 사업장 안전 점수
    SAFETY_SCORE_HISTORY: 'safety_quest_safety_score_history'   // 안전 점수 히스토리
};

const ACTIVE_USER_KEY = 'safety_quest_active_user';
const SCOPED_KEY_PREFIX = 'safety_quest_scope';
const LEGACY_OWNER_KEY = 'safety_quest_legacy_owner';

const LEGACY_USER_DATA_KEYS = Array.from(new Set([
    ...Object.values(STORAGE_KEYS),
    'safety_quest_hazard_logs',
    'safety_quest_daily_instances',
    'safety_quest_hazard_id_logs',
    'safety_quest_action_records',
    'safety_quest_gems_logs',
    'safety_quest_attendance_logs',
    'safety_quest_monthly_attendance',
    'safety_quest_weekly_progress',
    'safety_quest_cumulative_watch_time',
    'safety_quest_session_watch_time',
    'safety_quest_weekly_complete_daily_track',
    'safety_quest_daily_snapshots',
    'safety_quest_last_reset',
    'safety_quest_migration_version',
    'safety_quest_checklists',
    'safety_quest_reviews',
    'safety_quest_photos'
]));

const parseJSON = (value, defaultValue = null) => {
    if (value === null || value === undefined) return defaultValue;
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
};

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const toActiveUser = (user = null) => {
    if (!user) return null;
    return {
        id: user.id ?? null,
        username: user.username ?? null,
        name: user.name ?? null,
        email: user.email ?? null
    };
};

const getUserScope = (user = null) => {
    const activeUser = user || parseJSON(localStorage.getItem(ACTIVE_USER_KEY), null);
    if (!activeUser) return null;

    if (activeUser.id !== null && activeUser.id !== undefined) {
        return `id:${activeUser.id}`;
    }
    if (activeUser.username) {
        return `username:${normalizeText(activeUser.username)}`;
    }
    if (activeUser.email) {
        return `email:${normalizeText(activeUser.email)}`;
    }
    return null;
};

const shouldUseScopedKey = (key) => typeof key === 'string' && key.startsWith('safety_quest_');

const buildScopedKey = (key, scopeOverride = null) => {
    if (!shouldUseScopedKey(key)) return key;

    const scope = scopeOverride || getUserScope();
    if (!scope) return key;

    return `${SCOPED_KEY_PREFIX}:${scope}:${key}`;
};

const hasAnyLegacyData = () => LEGACY_USER_DATA_KEYS.some((key) => localStorage.getItem(key) !== null);

const hasScopedData = (scope) =>
    LEGACY_USER_DATA_KEYS.some((key) => localStorage.getItem(buildScopedKey(key, scope)) !== null);

const shouldMigrateLegacyDataForUser = (user, scope) => {
    const owner = localStorage.getItem(LEGACY_OWNER_KEY);
    if (owner) {
        return owner === scope;
    }

    const legacyProfile = parseJSON(localStorage.getItem(STORAGE_KEYS.USER_PROFILE), null);
    const legacyName = normalizeText(legacyProfile?.name);
    if (!legacyName) return false;

    const candidates = [user?.name, user?.username, user?.email]
        .map(normalizeText)
        .filter(Boolean);

    return candidates.includes(legacyName);
};

const migrateLegacyDataForUser = (user) => {
    const scope = getUserScope(user);
    if (!scope) {
        return { migrated: false, reason: 'NO_SCOPE', copiedKeys: 0 };
    }

    if (!hasAnyLegacyData()) {
        return { migrated: false, reason: 'NO_LEGACY_DATA', copiedKeys: 0 };
    }

    if (hasScopedData(scope)) {
        return { migrated: false, reason: 'SCOPED_DATA_ALREADY_EXISTS', copiedKeys: 0 };
    }

    if (!shouldMigrateLegacyDataForUser(user, scope)) {
        return { migrated: false, reason: 'OWNER_MISMATCH', copiedKeys: 0 };
    }

    let copiedKeys = 0;

    LEGACY_USER_DATA_KEYS.forEach((legacyKey) => {
        const legacyValue = localStorage.getItem(legacyKey);
        if (legacyValue === null) return;

        const scopedKey = buildScopedKey(legacyKey, scope);
        if (localStorage.getItem(scopedKey) !== null) return;

        localStorage.setItem(scopedKey, legacyValue);
        copiedKeys += 1;
    });

    if (copiedKeys > 0) {
        localStorage.setItem(LEGACY_OWNER_KEY, scope);
    }

    return {
        migrated: copiedKeys > 0,
        reason: copiedKeys > 0 ? 'MIGRATED' : 'NO_KEYS_COPIED',
        copiedKeys
    };
};

const clearScopedDataForScope = (scope) => {
    if (!scope) return false;
    const prefix = `${SCOPED_KEY_PREFIX}:${scope}:`;

    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Error clearing scoped localStorage:', error);
        return false;
    }
};

// LocalStorage 래퍼 함수들
export const storage = {
    setActiveUser: (user) => {
        try {
            const activeUser = toActiveUser(user);
            if (!activeUser) return false;
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));
            return true;
        } catch (error) {
            console.error('Error setting active user:', error);
            return false;
        }
    },

    getActiveUser: () => {
        return parseJSON(localStorage.getItem(ACTIVE_USER_KEY), null);
    },

    clearActiveUser: () => {
        try {
            localStorage.removeItem(ACTIVE_USER_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing active user:', error);
            return false;
        }
    },

    getActiveUserScope: () => {
        return getUserScope();
    },

    ensureScopedDataForUser: (user) => {
        return migrateLegacyDataForUser(user);
    },

    getScopedKey: (key, user = null) => {
        return buildScopedKey(key, user ? getUserScope(user) : null);
    },

    setRaw: (key, value) => {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving raw localStorage:', error);
            return false;
        }
    },

    getRaw: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            const parsed = parseJSON(item, undefined);
            return parsed === undefined ? item : parsed;
        } catch (error) {
            console.error('Error reading raw localStorage:', error);
            return defaultValue;
        }
    },

    removeRaw: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing raw localStorage:', error);
            return false;
        }
    },

    clearCurrentUserData: () => {
        const scope = getUserScope();
        const scopedCleared = clearScopedDataForScope(scope);

        if (!scope) return scopedCleared;

        // 레거시 데이터의 소유자가 현재 사용자일 때만 함께 제거합니다.
        if (localStorage.getItem(LEGACY_OWNER_KEY) === scope) {
            LEGACY_USER_DATA_KEYS.forEach((legacyKey) => localStorage.removeItem(legacyKey));
            localStorage.removeItem(LEGACY_OWNER_KEY);
        }

        return scopedCleared;
    },

    // 데이터 저장
    set: (key, value) => {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(buildScopedKey(key), serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // 데이터 불러오기
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(buildScopedKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    // 데이터 삭제
    remove: (key) => {
        try {
            localStorage.removeItem(buildScopedKey(key));
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

// KST(한국 표준시) 기준 날짜 문자열 생성 헬퍼 함수 (YYYY-MM-DD)
export const getKSTDateString = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
};

// KST 기준 어제 날짜 문자열 (YYYY-MM-DD)
export const getKSTYesterdayString = () => {
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    kstNow.setDate(kstNow.getDate() - 1);
    return `${kstNow.getFullYear()}-${String(kstNow.getMonth() + 1).padStart(2, '0')}-${String(kstNow.getDate()).padStart(2, '0')}`;
};

// KST 기준 현재 월 (YYYY-MM)
export const getKSTMonth = () => {
    const dateStr = getKSTDateString();
    return dateStr.substring(0, 7);
};

// KST 기준 오늘 날짜(일)
export const getKSTDay = () => {
    const dateStr = getKSTDateString();
    return parseInt(dateStr.split('-')[2], 10);
};

// KST 기준 요일 (0=일, 1=월, ..., 6=토)
export const getKSTDayOfWeek = () => {
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    return kstNow.getDay();
};

// 하위 호환용 alias (내부에서 사용)
const getLocalDateString = () => getKSTDateString();

const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

const formatKSTDate = (dateValue) => {
    const parts = KST_DATE_FORMATTER.formatToParts(dateValue);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    if (!year || !month || !day) return null;
    return `${year}-${month}-${day}`;
};

const extractDateOnly = (value) => {
    if (!value) return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return formatKSTDate(value);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        const directMatch = trimmed.match(/\d{4}-\d{2}-\d{2}/);
        if (directMatch) {
            return directMatch[0];
        }

        const parsedFromString = new Date(trimmed);
        if (!Number.isNaN(parsedFromString.getTime())) {
            return formatKSTDate(parsedFromString);
        }
        return null;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return formatKSTDate(parsed);
    }

    return null;
};

const toSafeInt = (value) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        return 0;
    }
    return Math.max(0, Math.floor(numberValue));
};

const normalizeStreakPayload = (streakData = {}) => {
    if (!streakData || typeof streakData !== 'object' || Array.isArray(streakData)) {
        return {
            current: 0,
            longest: 0,
            lastLoginDate: null
        };
    }

    const current = toSafeInt(streakData.current ?? streakData.currentStreak);
    const longest = Math.max(current, toSafeInt(streakData.longest ?? streakData.longestStreak));
    const lastLoginDate = extractDateOnly(streakData.lastLoginDate ?? streakData.lastCheckInDate);

    return { current, longest, lastLoginDate };
};

// 스트릭 (연속 로그인) - 수동 체크인 방식
export const streak = {
    get: () => {
        const rawData = storage.get(STORAGE_KEYS.STREAK, null);
        const normalized = normalizeStreakPayload(rawData);

        const needsMigration =
            !!rawData &&
            (Object.prototype.hasOwnProperty.call(rawData, 'currentStreak') ||
                Object.prototype.hasOwnProperty.call(rawData, 'longestStreak') ||
                Object.prototype.hasOwnProperty.call(rawData, 'lastCheckInDate') ||
                rawData.current !== normalized.current ||
                rawData.longest !== normalized.longest ||
                rawData.lastLoginDate !== normalized.lastLoginDate);

        if (needsMigration) {
            storage.set(STORAGE_KEYS.STREAK, normalized);
        }

        return normalized;
    },

    set: (streakData) => {
        return storage.set(STORAGE_KEYS.STREAK, normalizeStreakPayload(streakData));
    },

    // 수동 출석 체크 (KST 기준)
    checkIn: () => {
        const today = getKSTDateString();
        const yesterdayStr = getKSTYesterdayString();

        const streakData = streak.get();
        const lastLoginDate = extractDateOnly(streakData.lastLoginDate);

        if (lastLoginDate === today) {
            return { success: false, message: '오늘은 이미 출석했습니다.' };
        }

        if (lastLoginDate === yesterdayStr) {
            // 연속 출석
            streakData.current += 1;
            streakData.longest = Math.max(streakData.longest, streakData.current);
        } else {
            // 스트릭 끊김 (또는 첫 출석)
            streakData.current = 1;
            if (streakData.longest === 0) streakData.longest = 1;
        }

        streakData.lastLoginDate = today;
        streak.set(streakData);

        // 포인트 보상 (출석 보상 20포인트)
        points.add(20, '출석 체크', `${streakData.current}일 연속 출석`);

        return { success: true, message: '출석 완료! +1 스트릭', streak: streakData.current };
    },

    // 오늘 출석 여부 확인 (KST 기준)
    isCheckedInToday: () => {
        const streakData = streak.get();
        if (!streakData.lastLoginDate) return false;

        const today = getKSTDateString();
        const lastLogin = extractDateOnly(streakData.lastLoginDate);
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

// 주차/요일별 교육-이미지 매핑 (educationData.js의 스케줄과 동일)
// weekNumber_dayOfWeek → 이미지 번호
const HAZARD_IMAGE_SCHEDULE = {
    '1_1': '/hazzard/1.png',   // 1주차 월요일 - 사다리 작업 안전 수칙
    '1_2': '/hazzard/2.png',   // 1주차 화요일 - 고소작업대 안전 작업
    '1_3': '/hazzard/3.png',   // 1주차 수요일 - 개구부 및 단차 추락 예방
    '2_1': '/hazzard/4.png',   // 2주차 월요일 - 기계 작업 끼임 예방
    '2_2': '/hazzard/5.png',   // 2주차 화요일 - 지게차 충돌 예방
    '3_1': '/hazzard/6.png',   // 3주차 월요일 - 안전모 올바른 착용법
    '3_2': '/hazzard/7.png',   // 3주차 화요일 - 안전대 착용 및 점검
    '4_1': '/hazzard/8.png',   // 4주차 월요일 - 소화기 사용법
    '4_2': '/hazzard/9.png',   // 4주차 화요일 - 전기 안전 기본
    '5_1': '/hazzard/10.png',  // 5주차 월요일 - 밀폐공간 작업 안전
};

// 오늘의 교육에 맞는 위험 사진 선택 (getTodayEducation과 동일한 로직)
const getTodayHazardImage = () => {
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const startOfYear = new Date(kstNow.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((kstNow - startOfYear) / (24 * 60 * 60 * 1000)) + 1;

    const weekNumber = Math.ceil(dayOfYear / 7) % 5 + 1;
    let dayOfWeek = kstNow.getDay();
    if (dayOfWeek === 0) dayOfWeek = 1;
    if (dayOfWeek === 6) dayOfWeek = 1;

    const key = `${weekNumber}_${dayOfWeek}`;
    return HAZARD_IMAGE_SCHEDULE[key] || '/hazzard/1.png';
};

// 일일 퀘스트 인스턴스 (Daily_Quest_Instance)
export const dailyQuestInstances = {
    get: () => {
        return storage.get('safety_quest_daily_instances', []);
    },

    // 오늘 날짜의 퀘스트 인스턴스 가져오기 (없으면 생성, KST 기준)
    getTodayInstance: (userId) => {
        const instances = dailyQuestInstances.get();
        const today = getKSTDateString();

        let instance = instances.find(inst => inst.userId === userId && inst.questDate === today);

        if (!instance) {
            instance = {
                id: crypto.randomUUID(),
                userId: userId,
                questDate: today,
                photoUrl: getTodayHazardImage(), // 오늘의 교육에 맞는 이미지 선택
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
        return getKSTMonth();
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

    // 오늘 출석 기록 (KST 기준)
    recordAttendance: () => {
        const data = monthlyAttendance.get();
        const today = getKSTDay();

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

// 일간 퀘스트 스냅샷 (요일별 수행률 조회용)
export const dailyQuestSnapshots = {
    getAll: () => {
        return storage.get('safety_quest_daily_snapshots', {});
    },

    getByDate: (dateStr) => {
        const all = dailyQuestSnapshots.getAll();
        return all[dateStr] || null;
    },

    save: (dateStr, enrichedQuests) => {
        const all = dailyQuestSnapshots.getAll();
        const total = enrichedQuests.length;
        const completed = enrichedQuests.filter(q => q.isCompleted).length;

        all[dateStr] = {
            date: dateStr,
            total,
            completed,
            quests: enrichedQuests.map(q => ({
                id: q.id,
                title: q.title || '',
                isCompleted: q.isCompleted
            }))
        };

        return storage.set('safety_quest_daily_snapshots', all);
    },

    cleanOldEntries: (keepDays = 14) => {
        const all = dailyQuestSnapshots.getAll();
        const keys = Object.keys(all);
        if (keys.length <= keepDays) return;

        const sorted = keys.sort();
        const toRemove = sorted.slice(0, sorted.length - keepDays);
        toRemove.forEach(key => delete all[key]);

        storage.set('safety_quest_daily_snapshots', all);
    }
};

// ===== [New] 마이크로 러닝 교육 시스템 =====

// 법정 교육 시간 (연간 기준)
export const LEGAL_EDUCATION_REQUIREMENTS = {
    ANNUAL_HOURS: 4,           // 연간 법정 의무 교육 시간
    QUARTERLY_HOURS: 1,        // 분기별 권장 시간
    MONTHLY_MINIMUM: 0.33      // 월별 최소 권장 시간 (20분)
};

// 교육 진행 상태 관리
export const educationProgress = {
    get: () => {
        return storage.get(STORAGE_KEYS.EDUCATION_PROGRESS, {
            currentEducationId: null,
            watchedTime: 0,
            maxWatchedTime: 0,
            videoCompleted: false,
            quizCompleted: false,
            quizScore: 0,
            startedAt: null,
            lastUpdatedAt: null
        });
    },

    set: (progress) => {
        return storage.set(STORAGE_KEYS.EDUCATION_PROGRESS, progress);
    },

    // 교육별 누적 시청 시간 저장소 키
    getCumulativeStorageKey: () => 'safety_quest_cumulative_watch_time',

    // 교육별 누적 시청 시간 가져오기
    getCumulativeWatchTime: (educationId) => {
        const data = storage.get(educationProgress.getCumulativeStorageKey(), {});
        return data[educationId] || 0;
    },

    // 교육별 누적 시청 시간 업데이트
    updateCumulativeWatchTime: (educationId, watchedTime) => {
        const data = storage.get(educationProgress.getCumulativeStorageKey(), {});
        const currentCumulative = data[educationId] || 0;
        // 이번 세션에서 더 많이 봤다면 그 차이만큼 누적
        if (watchedTime > currentCumulative) {
            data[educationId] = watchedTime;
            storage.set(educationProgress.getCumulativeStorageKey(), data);
        }
        return data[educationId];
    },

    // 세션 시청 시간 추적 (현재 재생 세션에서 시청한 시간)
    getSessionStorageKey: () => 'safety_quest_session_watch_time',

    getSessionWatchTime: (educationId) => {
        const data = storage.get(educationProgress.getSessionStorageKey(), {});
        return data[educationId] || 0;
    },

    updateSessionWatchTime: (educationId, sessionTime) => {
        const data = storage.get(educationProgress.getSessionStorageKey(), {});
        data[educationId] = sessionTime;
        storage.set(educationProgress.getSessionStorageKey(), data);
        return sessionTime;
    },

    resetSessionWatchTime: (educationId) => {
        const data = storage.get(educationProgress.getSessionStorageKey(), {});
        data[educationId] = 0;
        storage.set(educationProgress.getSessionStorageKey(), data);
    },

    // 교육 시작
    startEducation: (educationId) => {
        // 기존 누적 시청 시간 불러오기
        const cumulativeTime = educationProgress.getCumulativeWatchTime(educationId);

        // 새 세션 시작 - 세션 시청 시간 초기화
        educationProgress.resetSessionWatchTime(educationId);

        const progress = {
            currentEducationId: educationId,
            watchedTime: 0,
            maxWatchedTime: 0,  // 세션 내 최대 위치 (빨리감기 방지용)
            cumulativeWatchedTime: cumulativeTime,  // 누적 시청 시간
            videoCompleted: false,
            quizCompleted: false,
            quizScore: 0,
            startedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString()
        };
        educationProgress.set(progress);
        return progress;
    },

    // 시청 시간 업데이트
    updateWatchTime: (watchedTime) => {
        const progress = educationProgress.get();
        const educationId = progress.currentEducationId;

        progress.watchedTime = watchedTime;
        progress.maxWatchedTime = Math.max(progress.maxWatchedTime, watchedTime);

        // 세션 시청 시간 업데이트
        const sessionTime = educationProgress.updateSessionWatchTime(educationId, watchedTime);

        // 누적 시청 시간 계산: 기존 누적 + 이번 세션
        const previousCumulative = educationProgress.getCumulativeWatchTime(educationId);
        // 이번 세션에서 새로 본 시간만 추가 (영상 처음부터 다시 보면 추가됨)
        const newCumulative = previousCumulative + sessionTime;

        progress.cumulativeWatchedTime = newCumulative;
        progress.lastUpdatedAt = new Date().toISOString();

        educationProgress.set(progress);
        return progress;
    },

    // 영상 시청 완료 처리
    completeVideo: () => {
        const progress = educationProgress.get();
        const educationId = progress.currentEducationId;

        // 최종 누적 시간 저장
        const sessionTime = educationProgress.getSessionWatchTime(educationId);
        const previousCumulative = educationProgress.getCumulativeWatchTime(educationId);
        educationProgress.updateCumulativeWatchTime(educationId, previousCumulative + sessionTime);

        progress.videoCompleted = true;
        progress.lastUpdatedAt = new Date().toISOString();
        educationProgress.set(progress);
        return progress;
    },

    // 퀴즈 완료 처리
    completeQuiz: (score, passed) => {
        const progress = educationProgress.get();
        progress.quizCompleted = passed;
        progress.quizScore = score;
        progress.lastUpdatedAt = new Date().toISOString();
        educationProgress.set(progress);
        return progress;
    },

    // 진행 상태 초기화 (다음 교육을 위해)
    reset: () => {
        return educationProgress.set({
            currentEducationId: null,
            watchedTime: 0,
            maxWatchedTime: 0,
            cumulativeWatchedTime: 0,
            videoCompleted: false,
            quizCompleted: false,
            quizScore: 0,
            startedAt: null,
            lastUpdatedAt: null
        });
    }
};

// 교육 이력 관리
export const educationHistory = {
    get: () => {
        return storage.get(STORAGE_KEYS.EDUCATION_HISTORY, []);
    },

    set: (history) => {
        return storage.set(STORAGE_KEYS.EDUCATION_HISTORY, history);
    },

    // 완료한 교육 추가
    addCompleted: (educationData) => {
        const history = educationHistory.get();
        const record = {
            id: crypto.randomUUID(),
            educationId: educationData.educationId,
            title: educationData.title,
            category: educationData.category,
            watchedTime: educationData.watchedTime,
            legalHours: educationData.legalHours,
            quizScore: educationData.quizScore,
            pointsEarned: educationData.pointsEarned,
            expEarned: educationData.expEarned,
            completedAt: new Date().toISOString()
        };
        history.push(record);
        educationHistory.set(history);

        // 법정 교육 시간 누적
        legalHours.add(educationData.legalHours);

        return record;
    },

    // 오늘 완료한 교육 확인
    getTodayCompleted: () => {
        const history = educationHistory.get();
        const today = getLocalDateString();
        return history.filter(record =>
            record.completedAt.split('T')[0] === today
        );
    },

    // 특정 교육 완료 여부 확인 (오늘 기준)
    hasCompletedToday: (educationId) => {
        const todayCompleted = educationHistory.getTodayCompleted();
        return todayCompleted.some(record => record.educationId === educationId);
    },

    // 이번 달 완료한 교육
    getThisMonthCompleted: () => {
        const history = educationHistory.get();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return history.filter(record =>
            record.completedAt.startsWith(currentMonth)
        );
    },

    // 최근 교육 이력 조회
    getRecent: (count = 20) => {
        const history = educationHistory.get();
        return history.slice(-count).reverse();
    },

    // 카테고리별 통계
    getStatsByCategory: () => {
        const history = educationHistory.get();
        const stats = {};
        history.forEach(record => {
            if (!stats[record.category]) {
                stats[record.category] = {
                    count: 0,
                    totalHours: 0,
                    totalPoints: 0
                };
            }
            stats[record.category].count += 1;
            stats[record.category].totalHours += record.legalHours;
            stats[record.category].totalPoints += record.pointsEarned;
        });
        return stats;
    }
};

// 법정 교육 시간 관리
export const legalHours = {
    get: () => {
        return storage.get(STORAGE_KEYS.LEGAL_HOURS, {
            totalHours: 0,
            yearlyHours: {},  // { '2026': 2.5, '2025': 4.0 }
            quarterlyHours: {}, // { '2026-Q1': 1.2 }
            lastUpdatedAt: null
        });
    },

    set: (data) => {
        return storage.set(STORAGE_KEYS.LEGAL_HOURS, data);
    },

    // 교육 시간 추가
    add: (hours) => {
        const data = legalHours.get();
        const now = new Date();
        const year = now.getFullYear().toString();
        const quarter = `${year}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

        data.totalHours += hours;
        data.yearlyHours[year] = (data.yearlyHours[year] || 0) + hours;
        data.quarterlyHours[quarter] = (data.quarterlyHours[quarter] || 0) + hours;
        data.lastUpdatedAt = now.toISOString();

        legalHours.set(data);
        return data;
    },

    // 올해 누적 시간 조회
    getCurrentYearHours: () => {
        const data = legalHours.get();
        const year = new Date().getFullYear().toString();
        return data.yearlyHours[year] || 0;
    },

    // 이번 분기 누적 시간 조회
    getCurrentQuarterHours: () => {
        const data = legalHours.get();
        const now = new Date();
        const year = now.getFullYear();
        const quarter = `${year}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
        return data.quarterlyHours[quarter] || 0;
    },

    // 법정 교육 달성률 (%)
    getCompletionRate: () => {
        const currentYearHours = legalHours.getCurrentYearHours();
        return Math.min(100, (currentYearHours / LEGAL_EDUCATION_REQUIREMENTS.ANNUAL_HOURS) * 100);
    },

    // 법정 교육 이수 여부
    hasMetRequirement: () => {
        return legalHours.getCurrentYearHours() >= LEGAL_EDUCATION_REQUIREMENTS.ANNUAL_HOURS;
    }
};

// 퀴즈 시도 횟수 관리 (하루 3회 제한)
export const quizAttempts = {
    get: () => {
        const data = storage.get(STORAGE_KEYS.EDUCATION_QUIZ_ATTEMPTS, {
            date: null,
            attempts: {}  // { educationId: attemptCount }
        });

        // 날짜가 바뀌었으면 초기화
        const today = getLocalDateString();
        if (data.date !== today) {
            return {
                date: today,
                attempts: {}
            };
        }

        return data;
    },

    set: (data) => {
        return storage.set(STORAGE_KEYS.EDUCATION_QUIZ_ATTEMPTS, data);
    },

    // 시도 횟수 증가
    increment: (educationId) => {
        const data = quizAttempts.get();
        data.attempts[educationId] = (data.attempts[educationId] || 0) + 1;
        data.date = getLocalDateString();
        quizAttempts.set(data);
        return data.attempts[educationId];
    },

    // 시도 횟수 조회
    getAttempts: (educationId) => {
        const data = quizAttempts.get();
        return data.attempts[educationId] || 0;
    },

    // 추가 시도 가능 여부 (하루 3회 제한)
    canAttempt: (educationId, maxAttempts = 3) => {
        const attempts = quizAttempts.getAttempts(educationId);
        return attempts < maxAttempts;
    },

    // 남은 시도 횟수
    getRemainingAttempts: (educationId, maxAttempts = 3) => {
        const attempts = quizAttempts.getAttempts(educationId);
        return Math.max(0, maxAttempts - attempts);
    }
};

// ===== [New] 전직(특수역할) 시스템 =====

// 전직 상태 관리
export const specializationData = {
    get: () => {
        return storage.get(STORAGE_KEYS.SPECIALIZATION_DATA, {
            activeSpecialization: null,      // 현재 활성 전직 ID
            unlockedSpecializations: [],     // 해금된 전직 ID 목록
            classChangeHistory: []           // 전직 이력
        });
    },

    set: (data) => {
        return storage.set(STORAGE_KEYS.SPECIALIZATION_DATA, data);
    },

    // 현재 활성 전직 조회
    getActive: () => {
        const data = specializationData.get();
        return data.activeSpecialization;
    },

    // 활성 전직 설정
    setActive: (specId) => {
        const data = specializationData.get();
        data.activeSpecialization = specId;
        return specializationData.set(data);
    },

    // 전직 해금
    unlock: (specId) => {
        const data = specializationData.get();
        if (!data.unlockedSpecializations.includes(specId)) {
            data.unlockedSpecializations.push(specId);
            data.classChangeHistory.push({
                specId,
                unlockedAt: new Date().toISOString()
            });
        }
        data.activeSpecialization = specId;
        return specializationData.set(data);
    },

    // 전직 해금 여부 확인
    isUnlocked: (specId) => {
        const data = specializationData.get();
        return data.unlockedSpecializations.includes(specId);
    },

    // 해금된 전직 목록 조회
    getUnlocked: () => {
        const data = specializationData.get();
        return data.unlockedSpecializations;
    },

    // 전직 이력 조회
    getHistory: () => {
        const data = specializationData.get();
        return data.classChangeHistory;
    }
};

// 전직 교육 진행 상황 관리
export const specializationProgress = {
    get: () => {
        return storage.get(STORAGE_KEYS.SPECIALIZATION_PROGRESS, {});
    },

    set: (progress) => {
        return storage.set(STORAGE_KEYS.SPECIALIZATION_PROGRESS, progress);
    },

    // 특정 전직의 교육 진행 상황 조회
    getBySpecialization: (specId) => {
        const allProgress = specializationProgress.get();
        return allProgress[specId] || {};
    },

    // 특정 교육 완료 기록
    completeEducation: (specId, eduId, score) => {
        const allProgress = specializationProgress.get();
        if (!allProgress[specId]) {
            allProgress[specId] = {};
        }
        allProgress[specId][eduId] = {
            completed: true,
            score,
            completedAt: new Date().toISOString()
        };
        return specializationProgress.set(allProgress);
    },

    // 특정 교육 완료 여부 확인
    isEducationCompleted: (specId, eduId) => {
        const specProgress = specializationProgress.getBySpecialization(specId);
        return specProgress[eduId]?.completed === true;
    },

    // 전직의 모든 필수 교육 완료 여부 확인
    areAllEducationsCompleted: (specId, requiredEduIds) => {
        const specProgress = specializationProgress.getBySpecialization(specId);
        return requiredEduIds.every(eduId => specProgress[eduId]?.completed === true);
    },

    // 전직 교육 진행률 (%)
    getCompletionRate: (specId, requiredEduIds) => {
        const specProgress = specializationProgress.getBySpecialization(specId);
        const completed = requiredEduIds.filter(
            eduId => specProgress[eduId]?.completed === true
        ).length;
        return Math.round((completed / requiredEduIds.length) * 100);
    }
};

// 전직 퀴즈 시도 횟수 관리 (하루 3회 제한)
export const specQuizAttempts = {
    get: () => {
        const data = storage.get(STORAGE_KEYS.SPECIALIZATION_QUIZ_ATTEMPTS, {
            date: null,
            attempts: {}
        });

        const today = getLocalDateString();
        if (data.date !== today) {
            return { date: today, attempts: {} };
        }
        return data;
    },

    set: (data) => {
        return storage.set(STORAGE_KEYS.SPECIALIZATION_QUIZ_ATTEMPTS, data);
    },

    increment: (eduId) => {
        const data = specQuizAttempts.get();
        data.attempts[eduId] = (data.attempts[eduId] || 0) + 1;
        data.date = getLocalDateString();
        specQuizAttempts.set(data);
        return data.attempts[eduId];
    },

    canAttempt: (eduId, maxAttempts = 3) => {
        const data = specQuizAttempts.get();
        return (data.attempts[eduId] || 0) < maxAttempts;
    },

    getRemainingAttempts: (eduId, maxAttempts = 3) => {
        const data = specQuizAttempts.get();
        return Math.max(0, maxAttempts - (data.attempts[eduId] || 0));
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
    dailyQuestSnapshots,
    monthlyAttendance,
    MONTHLY_REWARDS,
    // [New] 교육 시스템
    educationProgress,
    educationHistory,
    legalHours,
    quizAttempts,
    LEGAL_EDUCATION_REQUIREMENTS,
    // [New] 전직 시스템
    specializationData,
    specializationProgress,
    specQuizAttempts
};
