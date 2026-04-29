import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import teamApi from '../api/teamApi';

const normalizeStatus = (status) => String(status || '').toUpperCase();

export default function useTeamGate({ autoLoad = true } = {}) {
    const { user } = useAuth();
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(Boolean(autoLoad && user));
    const [error, setError] = useState('');

    const loadMembership = useCallback(async () => {
        if (!user) {
            setMembership(null);
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError('');
        try {
            const result = await teamApi.getMyMembership();
            setMembership(result || null);
            return result || null;
        } catch (err) {
            setError(err.message || 'Failed to load team status.');
            setMembership(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (autoLoad) {
            loadMembership();
        }
    }, [autoLoad, loadMembership]);

    return useMemo(() => {
        const userTeam = user?.team || null;
        const membershipStatus = normalizeStatus(membership?.status);
        const activeTeam = membershipStatus === 'ACTIVE'
            ? {
                id: membership.teamId,
                name: membership.teamName,
                siteName: userTeam?.siteName,
                leader: userTeam?.leader || userTeam?.isLeader || false
            }
            : userTeam;

        const status = activeTeam
            ? 'ACTIVE'
            : membershipStatus === 'PENDING'
                ? 'PENDING'
                : 'NONE';

        return {
            loading,
            error,
            status,
            membership,
            team: activeTeam,
            isActive: status === 'ACTIVE',
            isPending: status === 'PENDING',
            isMissing: status === 'NONE',
            isLeader: Boolean(activeTeam?.leader || activeTeam?.isLeader),
            refresh: loadMembership
        };
    }, [error, loadMembership, loading, membership, user]);
}
