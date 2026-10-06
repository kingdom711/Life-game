import { Link } from 'react-router-dom';
import useTeamGate from '../../hooks/useTeamGate';
import userApi from '../../api/userApi';
import questApi from '../../api/questApi';
import { useEffect, useState } from 'react';

function OurTeamSection() {
    const teamGate = useTeamGate();
    const [rankings, setRankings] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        let active = true;
        if (!teamGate.isActive) return;

        userApi.getTeamRankings('points', 4)
            .then((data) => {
                if (!active) return;
                setRankings(Array.isArray(data) ? data : data?.rankings || []);
            })
            .catch(() => {
                if (active) setRankings([]);
            });

        questApi.getTeamQuestSummary()
            .then((data) => {
                if (active) setSummary(data || null);
            })
            .catch(() => {
                if (active) setSummary(null);
            });

        return () => {
            active = false;
        };
    }, [teamGate.isActive]);

    if (!teamGate.isActive) {
        return (
            <Link className="new-team-section adventure-team-link" to="/profile">
                <h3 className="new-team-title">우리 팀</h3>
                <div className="new-team-progress-card">
                    <div className="new-team-progress-header">
                        <span className="new-team-progress-label">
                            {teamGate.isPending ? '가입 승인 대기 중' : '팀 설정 필요'}
                        </span>
                    </div>
                    <div className="new-team-progress-hint">
                        팀이 활성화되면 팀 퀘스트와 랭킹을 확인할 수 있습니다.
                    </div>
                </div>
            </Link>
        );
    }

    const weeklyProgress = summary?.weeklyProgress != null && Number.isFinite(Number(summary.weeklyProgress)) ? Math.max(0, Math.min(100, Number(summary.weeklyProgress))) : null;
    return (
        <Link className="new-team-section adventure-team-link" to="/my-team">
            <h3 className="new-team-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                우리 팀
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>더보기</span>
            </h3>

            <div className="new-team-progress-card">
                <div className="new-team-progress-header">
                    <span className="new-team-progress-label">이번 주 팀 퀘스트 수행률</span>
                    <span className="new-team-progress-value">{weeklyProgress === null ? '미집계' : `${weeklyProgress}%`}</span>
                </div>
                <div className="new-team-progress-bar">
                    <div className="new-team-progress-fill" style={{ width: `${weeklyProgress || 0}%` }} />
                </div>
                <div className="new-team-progress-hint">
                    {teamGate.team?.name} 구성원과 함께 진행 중입니다.
                </div>
            </div>

            <div className="new-team-ranking">
                <div className="new-team-ranking-header">
                    <span className="new-team-ranking-label">안전 참여 랭킹</span>
                </div>
                <div className="new-team-ranking-list">
                    {rankings.length === 0 ? (
                        <div className="new-team-progress-hint">랭킹 데이터가 아직 없습니다.</div>
                    ) : rankings.map((team, index) => {
                        const rank = team.rank || index + 1;
                        const score = team.score ?? team.totalScore ?? team.points ?? 0;
                        const isMine = team.teamId === teamGate.team?.id || team.id === teamGate.team?.id;
                        return (
                            <div key={team.teamId || team.id || rank} className={`new-team-ranking-item ${isMine ? 'new-team-ranking-item--mine' : ''}`}>
                                <span className="new-team-rank-num">{rank}</span>
                                <span className="new-team-rank-name">
                                    {team.teamName || team.name}
                                    {isMine && <span className="new-team-mine-badge">(우리 팀)</span>}
                                </span>
                                <span className="new-team-rank-score">{score}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Link>
    );
}

export default OurTeamSection;
