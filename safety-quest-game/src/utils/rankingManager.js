import userApi from '../api/userApi';
import { calculateLevel } from './pointsCalculator';
import { storage } from './storage';

const CACHE_TTL_MS = 5 * 60 * 1000;
const AUTH_BYPASS_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH === 'true';

const DEFAULT_ROLE = 'technician';

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

export async function fetchRankings(
    type = 'points',
    limit = 10,
    currentUserId = null,
    { period = 'all', role = '' } = {}
) {
    const token = localStorage.getItem('accessToken');
    if (token && !AUTH_BYPASS_ENABLED) {
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

    return { source: 'empty', data: [] };
}

export async function fetchTeamRankings(type = 'points', limit = 10) {
    const token = localStorage.getItem('accessToken');
    if (token && !AUTH_BYPASS_ENABLED) {
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

    return { source: 'empty', data: [] };
}
