import { useEffect } from 'react';
import { useRankings } from '../hooks/useRankings';
import { getUserAchievementIcons } from '../utils/rankingAchievements';

const ROLE_LABELS = {
    technician: '기술자',
    supervisor: '관리감독자',
    safety_manager: '안전관리자'
};

const SOURCE_LABELS = {
    api: '실시간',
    cache: '캐시',
    empty: '데이터 없음'
};

const RANKING_TYPES = [
    { key: 'points', label: '포인트', icon: '💰' },
    { key: 'level', label: '레벨', icon: '⭐' },
    { key: 'streak', label: '스트릭', icon: '🔥' }
];

const PERIODS = [
    { key: 'all', label: '전체' },
    { key: 'weekly', label: '이번 주' },
    { key: 'monthly', label: '이번 달' }
];

const ROLE_FILTERS = [
    { key: '', label: '전체' },
    { key: 'technician', label: '기술자' },
    { key: 'supervisor', label: '관리감독자' },
    { key: 'safety_manager', label: '안전관리자' }
];

const VIEW_MODES = [
    { key: 'individual', label: '개인' },
    { key: 'team', label: '팀' }
];

function getRankValueDisplay(entry, type) {
    if (type === 'level') return entry.level?.name || '-';
    if (type === 'streak') return `${entry.streak || 0}일`;
    return `${(entry.points || 0).toLocaleString()}P`;
}

function getTeamValueDisplay(entry, type) {
    if (type === 'level') return `${entry.avgPoints?.toLocaleString() || 0}P 평균`;
    if (type === 'streak') return `${Math.max(1, Math.round((entry.avgPoints || 0) / 1200))}일 평균`;
    return `${(entry.totalPoints || 0).toLocaleString()}P`;
}

function getPodiumIcon(rank) {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
}

function renderRankChange(rankChange) {
    if (rankChange === null) {
        return (
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.72rem' }}>
                NEW
            </span>
        );
    }
    if (rankChange > 0) {
        return (
            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.72rem' }}>
                ▲{rankChange}
            </span>
        );
    }
    if (rankChange < 0) {
        return (
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.72rem' }}>
                ▼{Math.abs(rankChange)}
            </span>
        );
    }
    return <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>-</span>;
}

function LeaderboardModal({ isOpen, onClose = () => {} }) {
    const {
        rankings,
        teamRankings,
        currentUserRank,
        rankingType,
        period,
        roleFilter,
        viewMode,
        changeType,
        changePeriod,
        changeRoleFilter,
        changeViewMode,
        loading,
        error,
        source,
        newAchievements,
        clearNewAchievements
    } = useRankings('points', 20);

    const achievementIcons = getUserAchievementIcons();
    const list = viewMode === 'team' ? teamRankings.slice(0, 5) : rankings.slice(0, 20);
    const isCurrentUserOutsideList =
        viewMode === 'individual' &&
        currentUserRank &&
        !list.some((entry) => String(entry.userId) === String(currentUserRank.userId));

    useEffect(() => {
        if (newAchievements.length === 0) return undefined;
        const timer = setTimeout(() => clearNewAchievements(), 4000);
        return () => clearTimeout(timer);
    }, [newAchievements, clearNewAchievements]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: '20px',
                    border: '1px solid rgba(148,163,184,0.25)',
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
                    boxShadow: '0 24px 48px rgba(2, 6, 23, 0.5)'
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    style={{
                        padding: '1rem 1.1rem',
                        borderBottom: '1px solid rgba(148,163,184,0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>전체 리더보드</h2>
                        <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                            데이터 소스: {SOURCE_LABELS[source] || '오프라인'}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: '1px solid rgba(148,163,184,0.35)',
                            borderRadius: '10px',
                            background: 'rgba(15,23,42,0.55)',
                            color: '#e2e8f0',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
                    <div className="ranking-type-tabs" style={{ marginBottom: '0.5rem' }}>
                        {VIEW_MODES.map((mode) => (
                            <button
                                key={mode.key}
                                type="button"
                                className={`ranking-tab ${viewMode === mode.key ? 'ranking-tab--active' : ''}`}
                                onClick={() => changeViewMode(mode.key)}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    <div className="ranking-type-tabs" style={{ marginBottom: '0.5rem' }}>
                        {RANKING_TYPES.map((type) => (
                            <button
                                key={type.key}
                                type="button"
                                className={`ranking-tab ${rankingType === type.key ? 'ranking-tab--active' : ''}`}
                                onClick={() => changeType(type.key)}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="ranking-type-tabs" style={{ marginBottom: viewMode === 'individual' ? '0.5rem' : 0 }}>
                        {PERIODS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={`ranking-tab ${period === item.key ? 'ranking-tab--active' : ''}`}
                                onClick={() => changePeriod(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {viewMode === 'individual' && (
                        <div className="ranking-type-tabs" style={{ marginBottom: 0 }}>
                            {ROLE_FILTERS.map((item) => (
                                <button
                                    key={item.key || 'all'}
                                    type="button"
                                    className={`ranking-tab ${roleFilter === item.key ? 'ranking-tab--active' : ''}`}
                                    onClick={() => changeRoleFilter(item.key)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ padding: '0.9rem 1rem', overflowY: 'auto' }}>
                    {loading && <div className="ranking-loading">랭킹 데이터를 불러오는 중입니다...</div>}
                    {error && <div className="ranking-error">데이터를 불러오지 못했습니다.</div>}

                    {!loading && !error && list.length === 0 && (
                        <div className="ranking-loading">표시할 데이터가 없습니다.</div>
                    )}

                    {!loading && !error && list.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {list.map((entry) => {
                                const isCurrentUser = viewMode === 'individual' && entry.isCurrentUser;
                                const podiumIcon = getPodiumIcon(entry.rank);

                                return (
                                    <div
                                        key={viewMode === 'team' ? `${entry.teamName}-${entry.rank}` : `${entry.userId}-${entry.rank}`}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '70px minmax(0, 1fr) auto',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            padding: '0.65rem 0.8rem',
                                            borderRadius: '12px',
                                            border: isCurrentUser
                                                ? '1px solid #38bdf8'
                                                : '1px solid rgba(148,163,184,0.2)',
                                            background: isCurrentUser
                                                ? 'rgba(56,189,248,0.1)'
                                                : 'rgba(15,23,42,0.6)'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                color: '#f8fafc',
                                                fontWeight: 700
                                            }}
                                        >
                                            <span style={{ minWidth: '26px' }}>{podiumIcon || `#${entry.rank}`}</span>
                                            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{entry.rank}위</span>
                                        </div>

                                        {viewMode === 'team' ? (
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        color: '#f8fafc',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {entry.teamName}
                                                </div>
                                                <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                                                    인원 {entry.memberCount}명 · 최고 기여자 {entry.topMember}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                        minWidth: 0
                                                    }}
                                                >
                                                    <span>{entry.level?.tierIcon || '👤'}</span>
                                                    <span
                                                        style={{
                                                            color: '#f8fafc',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 700,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {entry.name}
                                                    </span>
                                                    {isCurrentUser && achievementIcons.length > 0 && (
                                                        <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                                                            {achievementIcons.join('')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                                                    {ROLE_LABELS[entry.role] || '기술자'}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#e2e8f0', fontSize: '0.86rem', fontWeight: 700 }}>
                                                {viewMode === 'team'
                                                    ? getTeamValueDisplay(entry, rankingType)
                                                    : getRankValueDisplay(entry, rankingType)}
                                            </div>
                                            <div style={{ marginTop: '0.15rem' }}>
                                                {renderRankChange(entry.rankChange)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && !error && isCurrentUserOutsideList && (
                        <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px dashed rgba(148,163,184,0.35)' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.45rem' }}>
                                내 현재 순위
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '70px minmax(0, 1fr) auto',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    padding: '0.65rem 0.8rem',
                                    borderRadius: '12px',
                                    border: '1px solid #38bdf8',
                                    background: 'rgba(56,189,248,0.1)'
                                }}
                            >
                                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{currentUserRank.rank}위</div>
                                <div style={{ color: '#f8fafc', fontSize: '0.88rem', fontWeight: 700 }}>
                                    {currentUserRank.name}
                                </div>
                                <div style={{ color: '#e2e8f0', fontWeight: 700 }}>
                                    {getRankValueDisplay(currentUserRank, rankingType)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {newAchievements.length > 0 && (
                <div
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        zIndex: 2100
                    }}
                >
                    {newAchievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            style={{
                                minWidth: '230px',
                                border: '1px solid rgba(251,191,36,0.5)',
                                background: 'rgba(15,23,42,0.95)',
                                borderRadius: '12px',
                                padding: '0.6rem 0.75rem',
                                boxShadow: '0 10px 20px rgba(2,6,23,0.45)'
                            }}
                        >
                            <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>
                                {achievement.icon} 신규 업적 달성
                            </div>
                            <div style={{ marginTop: '0.2rem', color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700 }}>
                                {achievement.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LeaderboardModal;

