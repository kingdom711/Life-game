import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import questApi from '../api/questApi';
import useTeamGate from '../hooks/useTeamGate';

const questIcons = {
    HAZARD_REPORTED: '!',
    ZERO_WORK_STOP: '0',
    EDUCATION_COMPLETED: 'E',
    DAILY_ALL_COMPLETE: '*'
};

function TeamQuestPage() {
    const teamGate = useTeamGate();
    const [period, setPeriod] = useState('all');
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (teamGate.loading || !teamGate.isActive) {
            return;
        }

        let mounted = true;
        setLoading(true);
        setError('');
        setMessage('');

        questApi.getTeamQuests(period)
            .then(data => {
                if (mounted) {
                    setQuests(Array.isArray(data) ? data : data?.quests || []);
                }
            })
            .catch(err => {
                if (mounted) {
                    setError(err.message || '팀 퀘스트를 불러오지 못했습니다.');
                    setQuests([]);
                }
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [period, teamGate.loading, teamGate.isActive]);

    const handleClaim = async (questId) => {
        setError('');
        setMessage('');
        try {
            const result = await questApi.claimTeamQuestReward(questId);
            setMessage(`팀 보상 수령 완료: ${result.rewardedMembers}명에게 +${result.reward?.points || 0}P 지급`);
            const data = await questApi.getTeamQuests(period);
            setQuests(Array.isArray(data) ? data : data?.quests || []);
        } catch (err) {
            setError(err.message || '보상을 수령하지 못했습니다.');
        }
    };

    const stats = useMemo(() => {
        const completed = quests.filter(quest => quest.completed).length;
        const memberTotal = quests[0]?.totalMemberCount || 0;
        const memberDone = quests.reduce((max, quest) => Math.max(max, quest.completedMemberCount || 0), 0);
        return { completed, total: quests.length, memberDone, memberTotal };
    }, [quests]);

    if (!teamGate.loading && !teamGate.isActive) {
        return (
            <div className="page">
                <div className="container">
                    <Link to="/" className="btn btn-secondary btn-sm">대시보드</Link>
                    <div className="card" style={{ marginTop: '1rem' }}>
                        <div className="card-header">
                            <h3 className="card-title">팀 설정 필요</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">
                                {teamGate.isPending ? '팀 리더의 승인을 기다리고 있습니다.' : '팀에 가입해야 팀 퀘스트를 이용할 수 있습니다.'}
                            </p>
                            <Link to="/profile" className="btn btn-primary btn-sm">팀 설정으로 이동</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">대시보드</Link>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: '#e2e8f0' }}>
                        팀 퀘스트
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {teamGate.team?.name || '우리 팀'}의 안전 활동 진행률
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[
                        ['all', '전체'],
                        ['daily', '일간'],
                        ['weekly', '주간']
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setPeriod(value)}
                            className={`btn btn-sm ${period === value ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22d3ee' }}>
                            {stats.completed}/{stats.total}
                        </div>
                        <div style={statLabelStyle}>완료 퀘스트</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                            {stats.memberDone}/{stats.memberTotal}
                        </div>
                        <div style={statLabelStyle}>최고 참여 현황</div>
                    </div>
                </div>

                {error && (
                    <div style={messageStyle}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={successMessageStyle}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="card">
                        <div className="card-body text-muted">팀 퀘스트를 불러오는 중입니다.</div>
                    </div>
                ) : quests.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-muted">현재 표시할 팀 퀘스트가 없습니다.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {quests.map(quest => {
                            const totalCount = quest.totalMemberCount || 0;
                            const completedCount = quest.completedMemberCount || 0;
                            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                            const myMember = quest.members?.find(member => member.me);

                            return (
                                <div key={`${quest.code}-${quest.periodKey}`} style={{
                                    padding: '1.25rem',
                                    borderRadius: '8px',
                                    background: quest.completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${quest.completed ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.08)'}`
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                            <span style={iconStyle}>{questIcons[quest.conditionType] || '?'}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{quest.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                                                    {quest.description}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={badgeStyle(quest.type)}>
                                            {quest.type === 'DAILY' ? '일간' : '주간'}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.75rem',
                                            color: '#94a3b8',
                                            marginBottom: '0.3rem'
                                        }}>
                                            <span>진행 상황: {completedCount}/{totalCount}명 완료</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div style={barTrackStyle}>
                                            <div style={{
                                                ...barFillStyle,
                                                width: `${progress}%`,
                                                background: quest.completed
                                                    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                                                    : 'linear-gradient(90deg, #22d3ee, #3b82f6)'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                                        {(quest.members || []).map(member => (
                                            <div key={member.userId} style={memberChipStyle(member)}>
                                                {member.completed ? '완료' : '대기'} {member.name}{member.me ? ' (나)' : ''}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        color: '#94a3b8',
                                        fontSize: '0.8rem'
                                    }}>
                                        <span>
                                            팀 완료 보상 +{quest.reward?.points || 0}P +{quest.reward?.exp || 0}EXP
                                            {quest.reward?.gold ? ` +${quest.reward.gold}G` : ''}
                                        </span>
                                        {quest.completed && !quest.rewardClaimed ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleClaim(quest.id)}
                                            >
                                                보상 수령
                                            </button>
                                        ) : (
                                            <span style={{
                                                color: quest.rewardClaimed || myMember?.completed ? '#4ade80' : '#64748b',
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {quest.rewardClaimed ? '보상 수령 완료' : myMember?.completed ? '내 몫 완료' : '활동 대기'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

const statCardStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)'
};

const statLabelStyle = {
    fontSize: '0.72rem',
    color: '#94a3b8'
};

const messageStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    fontSize: '0.85rem',
    fontWeight: 600
};

const successMessageStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#86efac',
    fontSize: '0.85rem',
    fontWeight: 700
};

const iconStyle = {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    background: 'rgba(34,211,238,0.12)',
    color: '#67e8f9',
    fontWeight: 800
};

const badgeStyle = (type) => ({
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    background: type === 'DAILY' ? 'rgba(234,179,8,0.15)' : 'rgba(59,130,246,0.15)',
    color: type === 'DAILY' ? '#fbbf24' : '#93c5fd'
});

const barTrackStyle = {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '4px',
    height: '8px',
    overflow: 'hidden'
};

const barFillStyle = {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s'
};

const memberChipStyle = (member) => ({
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: member.completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
    color: member.completed ? '#4ade80' : '#94a3b8',
    border: member.me ? '1px solid rgba(59,130,246,0.45)' : '1px solid transparent'
});

export default TeamQuestPage;
