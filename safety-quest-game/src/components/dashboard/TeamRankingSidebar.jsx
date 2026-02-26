import { useRankings } from '../../hooks/useRankings';

const ROLE_LABELS = {
    technician: '기술자',
    supervisor: '관리감독자',
    safety_manager: '안전관리자'
};

const RANKING_TYPES = [
    { key: 'points', label: '포인트', icon: '💰' },
    { key: 'level', label: '레벨', icon: '⭐' },
    { key: 'streak', label: '스트릭', icon: '🔥' }
];

const SOURCE_LABELS = {
    api: '실시간',
    cache: '캐시',
    empty: '데이터 없음'
};

const PODIUM_ORDER = [2, 1, 3];

const getPodiumHeight = (rank) => {
    if (rank === 1) return '132px';
    if (rank === 2) return '106px';
    return '94px';
};

const getCrown = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    return '🥉';
};

function getRankValueDisplay(entry, type) {
    switch (type) {
        case 'points':
            return `${(entry.points || 0).toLocaleString()}P`;
        case 'level':
            return entry.level?.name || '';
        case 'streak':
            return `${entry.streak || 0}일`;
        default:
            return '';
    }
}

function renderRankChange(rankChange) {
    if (rankChange === null) {
        return <span className="rank-change-new">NEW</span>;
    }
    if (rankChange > 0) {
        return <span className="rank-change-up">▲{rankChange}</span>;
    }
    if (rankChange < 0) {
        return <span className="rank-change-down">▼{Math.abs(rankChange)}</span>;
    }
    return null;
}

function TeamRankingSidebar({ onShowLeaderboard = () => {} }) {
    const {
        top3,
        currentUserRank,
        rankingType,
        changeType,
        loading,
        error,
        source
    } = useRankings('points', 10);

    return (
        <aside className="dashboard-side-card">
            <header
                className="dashboard-side-title-row"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}
            >
                <h3 className="dashboard-side-title">팀 랭킹</h3>
                {source && <span className="ranking-source-badge">{SOURCE_LABELS[source] || '오프라인'}</span>}
            </header>

            <div className="ranking-type-tabs">
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

            {loading && <div className="ranking-loading">랭킹을 불러오는 중입니다...</div>}
            {error && <div className="ranking-error">데이터를 불러오지 못했습니다.</div>}

            {!loading && !error && top3.length > 0 && (
                <div className="team-podium">
                    {PODIUM_ORDER.map((rank) => {
                        const entry = top3.find((item) => item.rank === rank);
                        if (!entry) return null;

                        return (
                            <div
                                key={entry.rank}
                                className={`podium-slot podium-slot-${entry.rank} ${entry.isCurrentUser ? 'podium-slot--current' : ''}`}
                            >
                                <span className="podium-crown" aria-hidden="true">
                                    {getCrown(entry.rank)}
                                </span>
                                <div className="podium-avatar">{entry.level?.tierIcon || entry.name.slice(0, 1)}</div>
                                <span className="podium-name">{entry.name}</span>
                                <span className="podium-role">{ROLE_LABELS[entry.role] || '기술자'}</span>
                                <div className="podium-block" style={{ height: getPodiumHeight(entry.rank) }}>
                                    <strong>{entry.rank}위</strong>
                                    <span>{getRankValueDisplay(entry, rankingType)}</span>
                                    {renderRankChange(entry.rankChange)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && !error && top3.length === 0 && (
                <div className="ranking-loading">표시할 랭킹 데이터가 없습니다.</div>
            )}

            {currentUserRank && currentUserRank.rank > 3 && (
                <div className="ranking-my-position">
                    <span>내 순위</span>
                    <strong>
                        {currentUserRank.rank}위 ({getRankValueDisplay(currentUserRank, rankingType)})
                    </strong>
                </div>
            )}

            <button type="button" className="dashboard-side-action" onClick={onShowLeaderboard}>
                더보기
            </button>
        </aside>
    );
}

export default TeamRankingSidebar;
