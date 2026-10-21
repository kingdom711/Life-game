import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import teamApi from '../api/teamApi';
import { resolveTeamMembership } from '../utils/teamMembership';

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
        const resolved = resolveTeamMembership(membership, user?.team);
        const { team: activeTeam, status } = resolved;

        return {
            loading,
            error,
            status,
            membership,
            team: activeTeam,
            isActive: status === 'ACTIVE',
            isPending: status === 'PENDING',
            isMissing: status === 'NONE',
            isLeader: resolved.isLeader,
            refresh: loadMembership
        };
    }, [error, loadMembership, loading, membership, user]);
}
