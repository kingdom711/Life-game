const TEAM_RANKINGS = [
    { rank: 1, name: '철근팀 A조', score: 96, icon: '🥇', isMine: false },
    { rank: 2, name: '철근팀 B조', score: 92, icon: '🥈', isMine: true, label: '내 팀' },
    { rank: 3, name: '거푸집팀', score: 88, icon: '🥉', isMine: false },
    { rank: 4, name: '콘크리트팀', score: 85, icon: null, isMine: false }
];

function OurTeamSection({ weeklyProgress = 78 }) {
    return (
        <div className="new-team-section">
            <h3 className="new-team-title">우리 팀</h3>

            <div className="new-team-progress-card">
                <div className="new-team-progress-header">
                    <span className="new-team-progress-icon">🎯</span>
                    <span className="new-team-progress-label">이번 주 팀 퀘스트 수행률</span>
                    <span className="new-team-progress-value">{weeklyProgress}%</span>
                </div>
                <div className="new-team-progress-bar">
                    <div
                        className="new-team-progress-fill"
                        style={{ width: `${weeklyProgress}%` }}
                    />
                </div>
                <div className="new-team-progress-hint">
                    함께 100% 달성하면 팀 보상이 지급됩니다!
                </div>
            </div>

            <div className="new-team-ranking">
                <div className="new-team-ranking-header">
                    <span className="new-team-ranking-icon">🏆</span>
                    <span className="new-team-ranking-label">안전 참여 랭킹</span>
                </div>
                <div className="new-team-ranking-list">
                    {TEAM_RANKINGS.map((team) => (
                        <div
                            key={team.rank}
                            className={`new-team-ranking-item ${team.isMine ? 'new-team-ranking-item--mine' : ''}`}
                        >
                            <span className="new-team-rank-num">
                                {team.icon || team.rank}
                            </span>
                            <span className="new-team-rank-name">
                                {team.name}
                                {team.isMine && <span className="new-team-mine-badge">(내 팀)</span>}
                            </span>
                            <div className="new-team-rank-bar-wrap">
                                <div
                                    className="new-team-rank-bar"
                                    style={{ width: `${team.score}%` }}
                                />
                            </div>
                            <span className="new-team-rank-score">{team.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OurTeamSection;
