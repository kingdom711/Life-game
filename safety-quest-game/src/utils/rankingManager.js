import userApi from '../api/userApi';
import { calculateLevel } from './pointsCalculator';
import { points, streak, userProfile, storage } from './storage';

const CACHE_TTL_MS = 5 * 60 * 1000;
const AUTH_BYPASS_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH === 'true';

const DEFAULT_ROLE = 'technician';

const SIMULATED_USERS = [
    { name: '이건설', role: 'technician' },
    { name: '박안전', role: 'technician' },
    { name: '최기술', role: 'supervisor' },
    { name: '정현장', role: 'supervisor' },
    { name: '김감독', role: 'safety_manager' },
    { name: '한공사', role: 'technician' },
    { name: '오점검', role: 'technician' },
    { name: '송관리', role: 'safety_manager' },
    { name: '윤작업', role: 'technician' }
];

const SIMULATED_TEAMS = [
    { teamName: '1공구 안전팀', memberCount: 8 },
    { teamName: '2공구 시공팀', memberCount: 12 },
    { teamName: '3공구 전기팀', memberCount: 6 },
    { teamName: '품질관리팀', memberCount: 5 },
    { teamName: '현장관리팀', memberCount: 10 }
];

function buildCacheKey(type, period = 'all', role = '') {
    const roleKey = role || 'all';
    return `safety_quest_rankings_cache_${type}_${period}_${roleKey}`;
}

function buildPreviousCacheKey(type, period = 'all', role = '') {
    const roleKey = role || 'all';
    return `safety_quest_rankings_previous_${type}_${period}_${roleKey}`;
}

function getCachedRankings(type, period = 'all', role = '') {
    return storage.get(buildCacheKey(type, period, role), null);
}

function setCachedRankings(type, period = 'all', role = '', data = []) {
    storage.set(buildCacheKey(type, period, role), {
        timestamp: Date.now(),
        data
    });
}

function isCacheValid(cacheEntry) {
    if (!cacheEntry || typeof cacheEntry !== 'object') return false;
    if (!cacheEntry.timestamp || !Array.isArray(cacheEntry.data)) return false;
    return Date.now() - cacheEntry.timestamp < CACHE_TTL_MS;
}

function toSafeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function normalizeRole(role) {
    if (!role || typeof role !== 'string') return DEFAULT_ROLE;
    return role;
}

function toDisplayName(apiEntry) {
    return (
        apiEntry?.name ||
        apiEntry?.displayName ||
        apiEntry?.username ||
        apiEntry?.user?.name ||
        apiEntry?.user?.username ||
        '익명 사용자'
    );
}

function normalizeApiRankingEntry(apiEntry, currentUserId) {
    const normalizedPoints = toSafeNumber(apiEntry?.points, 0);
    const resolvedUserId =
        apiEntry?.userId ||
        apiEntry?.id ||
        apiEntry?.user?.id ||
        apiEntry?.username ||
        toDisplayName(apiEntry);
    const normalizedStreak = toSafeNumber(apiEntry?.streak ?? apiEntry?.currentStreak, 0);

    return {
        rank: toSafeNumber(apiEntry?.rank, 0),
        userId: String(resolvedUserId),
        name: toDisplayName(apiEntry),
        role: normalizeRole(apiEntry?.role || apiEntry?.user?.role),
        points: normalizedPoints,
        level: calculateLevel(normalizedPoints),
        streak: normalizedStreak,
        isCurrentUser: currentUserId ? String(resolvedUserId) === String(currentUserId) : false,
        rankChange: null
    };
}

function calculateRankChanges(currentRankings, previousRankings) {
    if (!Array.isArray(currentRankings) || currentRankings.length === 0) {
        return [];
    }

    if (!Array.isArray(previousRankings) || previousRankings.length === 0) {
        return currentRankings.map((entry) => ({ ...entry, rankChange: null }));
    }

    const previousRankByUserId = previousRankings.reduce((acc, entry) => {
        if (entry?.userId) {
            acc[String(entry.userId)] = toSafeNumber(entry.rank, 0);
        }
        return acc;
    }, {});

    return currentRankings.map((entry) => {
        const prevRank = previousRankByUserId[String(entry.userId)];
        if (!prevRank) {
            return { ...entry, rankChange: null };
        }
        return {
            ...entry,
            rankChange: prevRank - toSafeNumber(entry.rank, 0)
        };
    });
}

function sortByRankingType(entries, type = 'points') {
    const sorted = [...entries];
    if (type === 'level') {
        sorted.sort((a, b) => {
            const levelDiff = (b.level?.rank || 0) - (a.level?.rank || 0);
            if (levelDiff !== 0) return levelDiff;
            return b.points - a.points;
        });
        return sorted;
    }

    if (type === 'streak') {
        sorted.sort((a, b) => {
            const streakDiff = b.streak - a.streak;
            if (streakDiff !== 0) return streakDiff;
            return b.points - a.points;
        });
        return sorted;
    }

    sorted.sort((a, b) => b.points - a.points);
    return sorted;
}

function generateRandomPoints(basePoints) {
    if (basePoints <= 0) {
        return Math.round(500 + Math.random() * 1500);
    }
    return Math.round(basePoints * (0.6 + Math.random() * 0.8));
}

function generateRandomStreak(baseStreak) {
    if (baseStreak <= 0) {
        return Math.floor(Math.random() * 8);
    }
    const randomStreak = Math.round(baseStreak * (0.6 + Math.random() * 0.8));
    return Math.max(0, randomStreak);
}

function generateFallbackRankings(type = 'points', limit = 10, currentUserId = null, { role = '' } = {}) {
    const currentPoints = toSafeNumber(points.get(), 0);
    const currentStreak = toSafeNumber(streak.get()?.current, 0);
    const currentName = userProfile.getName() || '나';
    const currentRole = normalizeRole(userProfile.getRole() || DEFAULT_ROLE);
    const resolvedCurrentUserId = currentUserId || 'local-current-user';

    const currentUserEntry = {
        rank: 0,
        userId: String(resolvedCurrentUserId),
        name: currentName,
        role: currentRole,
        points: currentPoints,
        level: calculateLevel(currentPoints),
        streak: currentStreak,
        isCurrentUser: true,
        rankChange: null
    };

    const simulatedEntries = SIMULATED_USERS.map((simUser, index) => {
        const simulatedPoints = generateRandomPoints(currentPoints);
        return {
            rank: 0,
            userId: `sim-${index + 1}`,
            name: simUser.name,
            role: simUser.role,
            points: simulatedPoints,
            level: calculateLevel(simulatedPoints),
            streak: generateRandomStreak(currentStreak),
            isCurrentUser: false,
            rankChange: null
        };
    });

    let mergedEntries = [currentUserEntry, ...simulatedEntries];

    if (role) {
        mergedEntries = mergedEntries.filter((entry) => entry.role === role);
    }

    const sorted = sortByRankingType(mergedEntries, type)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
            level: calculateLevel(entry.points)
        }))
        .slice(0, limit);

    return sorted;
}

function normalizeTeamRankingEntry(entry, index) {
    const memberCount = toSafeNumber(entry?.memberCount, 1) || 1;
    const avgPoints = toSafeNumber(entry?.avgPoints, 0);
    const totalPoints = toSafeNumber(entry?.totalPoints, avgPoints * memberCount);

    return {
        rank: toSafeNumber(entry?.rank, index + 1),
        teamName: entry?.teamName || `팀 ${index + 1}`,
        memberCount,
        totalPoints,
        avgPoints: avgPoints || Math.round(totalPoints / memberCount),
        topMember: entry?.topMember || '미정',
        rankChange: entry?.rankChange ?? null
    };
}

function generateFallbackTeamRankings(type = 'points', limit = 5) {
    const currentPoints = toSafeNumber(points.get(), 0);

    const simulated = SIMULATED_TEAMS.map((team, index) => {
        const avgPoints = generateRandomPoints(currentPoints);
        const totalPoints = avgPoints * team.memberCount;
        const randomTopMember = SIMULATED_USERS[index % SIMULATED_USERS.length]?.name || '이건설';
        const avgLevelRank = calculateLevel(avgPoints).rank;
        const avgStreak = generateRandomStreak(toSafeNumber(streak.get()?.current, 0));

        return {
            rank: 0,
            teamName: team.teamName,
            memberCount: team.memberCount,
            totalPoints,
            avgPoints,
            avgLevelRank,
            avgStreak,
            topMember: randomTopMember,
            rankChange: null
        };
    });

    const sorted = [...simulated];
    if (type === 'level') {
        sorted.sort((a, b) => {
            const levelDiff = b.avgLevelRank - a.avgLevelRank;
            if (levelDiff !== 0) return levelDiff;
            return b.avgPoints - a.avgPoints;
        });
    } else if (type === 'streak') {
        sorted.sort((a, b) => {
            const streakDiff = b.avgStreak - a.avgStreak;
            if (streakDiff !== 0) return streakDiff;
            return b.avgPoints - a.avgPoints;
        });
    } else {
        sorted.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return sorted.slice(0, limit).map((entry, index) => ({
        rank: index + 1,
        teamName: entry.teamName,
        memberCount: entry.memberCount,
        totalPoints: entry.totalPoints,
        avgPoints: entry.avgPoints,
        topMember: entry.topMember,
        rankChange: entry.rankChange
    }));
}

export async function fetchRankings(
    type = 'points',
    limit = 10,
    currentUserId = null,
    { period = 'all', role = '' } = {}
) {
    if (AUTH_BYPASS_ENABLED) {
        return {
            source: 'fallback',
            data: generateFallbackRankings(type, limit, currentUserId, { role })
        };
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const apiData = await userApi.getRankings(type, limit, { period, role });
            const rows = Array.isArray(apiData) ? apiData : [];

            if (rows.length > 0) {
                const normalized = rows
                    .map((entry) => normalizeApiRankingEntry(entry, currentUserId))
                    .filter((entry) => !role || entry.role === role)
                    .slice(0, limit)
                    .map((entry, index) => ({
                        ...entry,
                        rank: entry.rank || index + 1
                    }));

                const prevCache = getCachedRankings(type, period, role);
                if (prevCache) {
                    storage.set(buildPreviousCacheKey(type, period, role), prevCache);
                }

                const withChanges = calculateRankChanges(normalized, prevCache?.data || null);
                setCachedRankings(type, period, role, withChanges);

                return { source: 'api', data: withChanges };
            }
        } catch (err) {
            console.warn('[RankingManager] API 실패:', err.message);
        }
    }

    const cached = getCachedRankings(type, period, role);
    if (cached && isCacheValid(cached)) {
        return { source: 'cache', data: cached.data.slice(0, limit) };
    }

    const fallback = generateFallbackRankings(type, limit, currentUserId, { role });
    const withChanges = calculateRankChanges(fallback, cached?.data || null);
    setCachedRankings(type, period, role, withChanges);

    return {
        source: 'fallback',
        data: withChanges
    };
}

export async function fetchTeamRankings(type = 'points', limit = 10) {
    if (AUTH_BYPASS_ENABLED) {
        return { source: 'fallback', data: generateFallbackTeamRankings(type, limit) };
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const apiData = await userApi.getTeamRankings(type, limit);
            const rows = Array.isArray(apiData) ? apiData : [];
            if (rows.length > 0) {
                return {
                    source: 'api',
                    data: rows.slice(0, limit).map((entry, index) => normalizeTeamRankingEntry(entry, index))
                };
            }
        } catch (err) {
            console.warn('[RankingManager] 팀 랭킹 API 실패:', err.message);
        }
    }

    return { source: 'fallback', data: generateFallbackTeamRankings(type, limit) };
}
