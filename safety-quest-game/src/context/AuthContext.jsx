import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import gameProfileApi from '../api/gameProfileApi';
import { userProfile, storage } from '../utils/storage';
import {
    pullAndRestoreSnapshot,
    bindSnapshotFlushOnUnload,
} from '../utils/gameStateSnapshot';

const AuthContext = createContext(null);
const AUTH_BYPASS_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH === 'true';
const DEV_BYPASS_USER = {
    id: 'local-dev-user',
    username: 'local-dev',
    name: '로컬 테스트 사용자',
    email: 'local-dev@example.com'
};

/**
 * 서버 게임 데이터를 localStorage에 저장 (크로스 디바이스 동기화)
 */
const hydrateLocalStorage = (gameData) => {
    try {
        if (gameData.profile) {
            const { level, exp, expToNext, gameRole, activeSpecialization } = gameData.profile;

            // 레벨 데이터
            storage.set('safety_quest_level', {
                current: level,
                exp: exp,
                expToNext: expToNext
            });

            // 유저 프로필 (게임 역할)
            const existingProfile = storage.get('safety_quest_user_profile', {});
            storage.set('safety_quest_user_profile', {
                ...existingProfile,
                role: gameRole || existingProfile.role
            });

            // 전직 데이터
            if (gameData.specializations) {
                const unlockedSpecs = gameData.specializations.map(s => s.specId);
                storage.set('safety_quest_specialization', {
                    activeSpecialization: activeSpecialization,
                    unlockedSpecializations: unlockedSpecs
                });
            }
        }

        if (gameData.points) {
            storage.set('safety_quest_points', {
                balance: gameData.points.balance,
                totalEarned: gameData.points.totalEarned,
                totalSpent: gameData.points.totalSpent
            });
        }

        if (gameData.streak) {
            storage.set('safety_quest_streak', {
                current: gameData.streak.currentStreak,
                longest: gameData.streak.longestStreak,
                lastLoginDate: gameData.streak.lastCheckInDate
            });
        }

        console.log('[AuthContext] 서버 게임 데이터 → localStorage 동기화 완료');
    } catch (err) {
        console.error('[AuthContext] localStorage 동기화 실패:', err);
    }
};

/**
 * localStorage에서 게임 데이터 수집 (서버 마이그레이션용)
 */
const collectLocalData = () => {
    try {
        const levelData = storage.get('safety_quest_level', {});
        const profileData = storage.get('safety_quest_user_profile', {});
        const specData = storage.get('safety_quest_specialization', {});
        const pointsData = storage.get('safety_quest_points', {});
        const streakData = storage.get('safety_quest_streak', {});

        const specializations = (specData.unlockedSpecializations || []).map(specId => ({
            specId,
            unlockedAt: null,
            educationProgress: null
        }));

        const currentStreak = streakData.current ?? streakData.currentStreak ?? 0;
        const longestStreak = streakData.longest ?? streakData.longestStreak ?? 0;
        const lastCheckInDate = streakData.lastLoginDate ?? streakData.lastCheckInDate ?? null;

        return {
            level: levelData.current || 1,
            exp: levelData.exp || 0,
            expToNext: levelData.expToNext || 100,
            gameRole: profileData.role || null,
            activeSpecialization: specData.activeSpecialization || null,
            totalQuestsCompleted: 0,
            specializations,
            pointsBalance: pointsData.balance || 0,
            currentStreak,
            longestStreak,
            lastCheckInDate
        };
    } catch (err) {
        console.error('[AuthContext] localStorage 수집 실패:', err);
        return null;
    }
};

const applyUserScope = (userData) => {
    if (!userData) return;

    storage.setActiveUser(userData);

    const migrationResult = storage.ensureScopedDataForUser(userData);
    if (migrationResult?.migrated) {
        console.log(
            `[AuthContext] 레거시 로컬 데이터 ${migrationResult.copiedKeys}건을 사용자 스코프로 마이그레이션했습니다.`
        );
    }
};

/**
 * 서버에서 게임 데이터를 가져와 localStorage에 동기화
 * - 서버에 데이터가 있으면 → localStorage에 저장 (다른 기기에서도 동일 데이터)
 * - 서버에 데이터가 없으면 → localStorage 데이터를 서버에 업로드 (마이그레이션)
 */
const syncGameData = async () => {
    try {
        const gameData = await gameProfileApi.fetchFullGameData();
        const hasServerProgress =
            gameData?.profile &&
            (
                gameData.profile.level > 1 ||
                gameData.profile.exp > 0 ||
                gameData.profile.expToNext !== 100 ||
                gameData.profile.gameRole ||
                gameData.profile.activeSpecialization ||
                (gameData.points?.balance || 0) > 0 ||
                (gameData.streak?.currentStreak || 0) > 0
            );

        if (hasServerProgress) {
            // 서버에 진행된 데이터가 있으면 → localStorage에 반영
            hydrateLocalStorage(gameData);
        } else {
            // 서버에 데이터가 없으면 → localStorage 데이터를 서버에 업로드
            const localData = collectLocalData();
            if (localData && (localData.level > 1 || localData.gameRole)) {
                console.log('[AuthContext] localStorage → 서버 마이그레이션 시작');
                const syncedData = await gameProfileApi.syncLocalData(localData);
                if (syncedData) {
                    hydrateLocalStorage(syncedData);
                }
            }
        }

        // ⭐ 정규화 안 된 durable 데이터(인벤토리/검교정/퀘스트진행/출석/교육 등) 스냅샷 복원
        await pullAndRestoreSnapshot();
    } catch (err) {
        console.warn('[AuthContext] 게임 데이터 동기화 실패 (오프라인 모드 유지):', err.message);
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshUser = async () => {
        if (AUTH_BYPASS_ENABLED) {
            setUser(DEV_BYPASS_USER);
            return DEV_BYPASS_USER;
        }

        const response = await authApi.getMe();
        const userData = response.user || response;
        applyUserScope(userData);
        setUser(userData);
        if (userData?.name) {
            userProfile.setName(userData.name);
        }
        return userData;
    };

    // 페이지 종료 시 스냅샷 백업 보장 (앱 1회 등록)
    useEffect(() => {
        bindSnapshotFlushOnUnload();
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            if (AUTH_BYPASS_ENABLED) {
                applyUserScope(DEV_BYPASS_USER);
                if (!userProfile.getName()) {
                    userProfile.setName(DEV_BYPASS_USER.name);
                }
                setUser(DEV_BYPASS_USER);
                setLoading(false);
                return;
            }

            try {
                if (authApi.isAuthenticated()) {
                    const response = await authApi.getMe();
                    const userData = response.user || response;

                    applyUserScope(userData);
                    setUser(userData);

                    // ⭐ 사용자 이름 localStorage에 저장 (관리자 이름 표시 문제 해결)
                    if (userData.name) {
                        userProfile.setName(userData.name);
                    }

                    // ⭐ 세션 복원 시에도 서버 게임 데이터 동기화
                    await syncGameData();
                } else {
                    storage.clearActiveUser();
                }
            } catch (err) {
                console.error("Failed to restore session:", err);
                storage.clearActiveUser();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        if (AUTH_BYPASS_ENABLED) {
            const bypassUser = {
                ...DEV_BYPASS_USER,
                username: credentials?.username || DEV_BYPASS_USER.username
            };
            applyUserScope(bypassUser);
            if (!userProfile.getName()) {
                userProfile.setName(bypassUser.name);
            }
            setUser(bypassUser);
            return { user: bypassUser, bypass: true };
        }

        setError(null);
        try {
            const response = await authApi.login(credentials);
            let userData;

            if (response.user) {
                userData = response.user;
            } else {
                const userResponse = await authApi.getMe();
                userData = userResponse.user || userResponse;
            }

            applyUserScope(userData);
            setUser(userData);

            // ⭐ 사용자 이름 localStorage에 저장 (관리자 이름 표시 문제 해결)
            if (userData && userData.name) {
                userProfile.setName(userData.name);
            }

            // ⭐ 로그인 성공 후 서버 게임 데이터 동기화 (크로스 디바이스)
            await syncGameData();

            return response;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    const logout = async () => {
        if (AUTH_BYPASS_ENABLED) {
            setUser(DEV_BYPASS_USER);
            return;
        }

        try {
            await authApi.logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
            storage.clearActiveUser();
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        refreshUser,
        setUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
