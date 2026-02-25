import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRankings, fetchTeamRankings } from '../utils/rankingManager';
import { checkAndUpdateAchievements } from '../utils/rankingAchievements';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useRankings(initialType = 'points', limit = 10) {
    const { user } = useAuth();

    const [rankings, setRankings] = useState([]);
    const [teamRankings, setTeamRankings] = useState([]);
    const [rankingType, setRankingType] = useState(initialType);
    const [period, setPeriod] = useState('all');
    const [roleFilter, setRoleFilter] = useState('');
    const [viewMode, setViewMode] = useState('individual');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [source, setSource] = useState(null);
    const [newAchievements, setNewAchievements] = useState([]);
    const intervalRef = useRef(null);

    const loadRankings = useCallback(
        async (showLoading = true) => {
            if (showLoading) setLoading(true);
            setError(null);

            try {
                if (viewMode === 'team') {
                    const result = await fetchTeamRankings(rankingType, limit);
                    setTeamRankings(result.data);
                    setSource(result.source);
                } else {
                    const result = await fetchRankings(rankingType, limit, user?.id, {
                        period,
                        role: roleFilter
                    });
                    setRankings(result.data);
                    setSource(result.source);

                    const currentUserEntry = result.data.find((entry) => entry.isCurrentUser);
                    if (currentUserEntry) {
                        const newly = checkAndUpdateAchievements(currentUserEntry, {
                            period,
                            type: rankingType
                        });
                        if (newly.length > 0) {
                            setNewAchievements(newly);
                        }
                    }
                }
            } catch (err) {
                setError(err?.message || '랭킹 데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        },
        [rankingType, period, roleFilter, viewMode, limit, user?.id]
    );

    useEffect(() => {
        loadRankings();

        intervalRef.current = setInterval(() => {
            loadRankings(false);
        }, REFRESH_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [loadRankings]);

    const clearNewAchievements = useCallback(() => {
        setNewAchievements([]);
    }, []);

    return {
        rankings,
        teamRankings,
        top3: rankings.slice(0, 3),
        currentUserRank: rankings.find((entry) => entry.isCurrentUser) || null,

        rankingType,
        period,
        roleFilter,
        viewMode,

        changeType: setRankingType,
        changePeriod: setPeriod,
        changeRoleFilter: setRoleFilter,
        changeViewMode: setViewMode,

        loading,
        error,
        source,
        refresh: () => loadRankings(true),

        newAchievements,
        clearNewAchievements
    };
}

