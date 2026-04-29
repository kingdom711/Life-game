import { useNavigate } from 'react-router-dom';
import useTeamGate from '../../hooks/useTeamGate';
import userApi from '../../api/userApi';
import questApi from '../../api/questApi';
import { useEffect, useState } from 'react';

function OurTeamSection({ weeklyProgress = 0 }) {
    const navigate = useNavigate();
    const teamGate = useTeamGate();
    const [rankings, setRankings] = useState([]);
    const [summary, setSummary] = useState({ weeklyProgress });

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
                if (active) setSummary(data || { weeklyProgress: 0 });
            })
            .catch(() => {
                if (active) setSummary({ weeklyProgress: 0 });
            });

        return () => {
            active = false;
        };
    }, [teamGate.isActive]);

    if (!teamGate.isActive) {
        return (
            <div className="new-team-section" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
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
            </div>
        );
    }

    return (
        <div className="new-team-section" onClick={() => navigate('/my-team')} style={{ cursor: 'pointer' }}>
            <h3 className="new-team-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                우리 팀
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>더보기</span>
            </h3>

            <div className="new-team-progress-card">
                <div className="new-team-progress-header">
                    <span className="new-team-progress-label">이번 주 팀 퀘스트 수행률</span>
                    <span className="new-team-progress-value">{summary.weeklyProgress || 0}%</span>
                </div>
                <div className="new-team-progress-bar">
                    <div className="new-team-progress-fill" style={{ width: `${summary.weeklyProgress || 0}%` }} />
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
                                <div className="new-team-rank-bar-wrap">
                                    <div className="new-team-rank-bar" style={{ width: `${Math.min(100, Number(score) || 0)}%` }} />
                                </div>
                                <span className="new-team-rank-score">{score}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default OurTeamSection;
