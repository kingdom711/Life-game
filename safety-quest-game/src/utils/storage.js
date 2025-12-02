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

// 장착된 아이템
export const equippedItems = {
    get: () => {
        return storage.get(STORAGE_KEYS.EQUIPPED_ITEMS, {});
    },

    set: (equipped) => {
        return storage.set(STORAGE_KEYS.EQUIPPED_ITEMS, equipped);
    },

    getEquipped: (category) => {
        const equipped = equippedItems.get();
        return equipped[category] || null;
    },

    equip: (category, itemId) => {
        const equipped = equippedItems.get();
        equipped[category] = itemId;
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

// 스트릭 (연속 로그인)
export const streak = {
    get: () => {
        return storage.get(STORAGE_KEYS.STREAK, {
            current: 0,
            longest: 0
        });
    },

    set: (streakData) => {
        return storage.set(STORAGE_KEYS.STREAK, streakData);
    },

    update: () => {
        const lastLogin = storage.get(STORAGE_KEYS.LAST_LOGIN);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const streakData = streak.get();

            if (lastLoginDate.getTime() === today.getTime()) {
                // 이미 오늘 로그인함
                return streakData;
            } else if (lastLoginDate.getTime() === yesterday.getTime()) {
                // 어제 로그인함 - 스트릭 증가
                streakData.current += 1;
                streakData.longest = Math.max(streakData.longest, streakData.current);
            } else {
                // 스트릭 끊김
                streakData.current = 1;
            }

            streak.set(streakData);
            storage.set(STORAGE_KEYS.LAST_LOGIN, today.toISOString());
            return streakData;
        } else {
            // 첫 로그인
            const streakData = { current: 1, longest: 1 };
            streak.set(streakData);
            storage.set(STORAGE_KEYS.LAST_LOGIN, today.toISOString());
            return streakData;
        }
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
        streak.update();
    } else {
        // 기존 사용자 - 스트릭 업데이트
        streak.update();
    }
};

export default storage;
