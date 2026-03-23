import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeamQuests, updateMyTeamProgress, claimTeamReward, getTeamQuestStats } from '../utils/teamQuestManager';

function TeamQuestPage() {
    const [quests, setQuests] = useState([]);
    const [stats, setStats] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setQuests(getTeamQuests());
        setStats(getTeamQuestStats());
    };

    const handleComplete = (questId) => {
        const result = updateMyTeamProgress(questId, true);
        if (result.success) {
            if (result.isTeamCompleted) {
                setMessage({ type: 'success', text: '🎉 팀 퀘스트 완료! 보상을 수령하세요!' });
            } else {
                setMessage({ type: 'info', text: '✅ 내 미션 완료! 팀원들을 기다리는 중...' });
            }
        }
        loadData();
    };

    const handleClaim = (questId) => {
        const result = claimTeamReward(questId);
        if (result.success) {
            setMessage({
                type: 'success',
                text: `🎁 팀 보상 수령! +${result.reward.points}P +${result.reward.exp}EXP`
            });
        }
        loadData();
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">← 대시보드</Link>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        🤝 팀 퀘스트
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        팀원과 함께 완료하는 협동 미션
                    </p>
                </div>

                {/* 팀 통계 */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        padding: '0.75rem', borderRadius: '12px', textAlign: 'center',
                        background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)'
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22d3ee' }}>
                            {stats.completed}/{stats.total}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>팀 퀘스트 완료</div>
                    </div>
                    <div style={{
                        padding: '0.75rem', borderRadius: '12px', textAlign: 'center',
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)'
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                            {stats.completedMembers}/{stats.totalMembers}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>팀원 참여</div>
                    </div>
                </div>

                {/* 메시지 */}
                {message && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
                        background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
                        color: message.type === 'success' ? '#4ade80' : '#60a5fa',
                        fontSize: '0.85rem', fontWeight: 600
                    }}>
                        {message.text}
                    </div>
                )}

                {/* 퀘스트 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {quests.map(quest => {
                        const completedCount = quest.members.filter(m => m.completed).length;
                        const totalCount = quest.members.length;
                        const progress = Math.round((completedCount / totalCount) * 100);
                        const myMember = quest.members.find(m => m.isMe);

                        return (
                            <div key={quest.id} style={{
                                padding: '1.25rem', borderRadius: '14px',
                                background: quest.isCompleted
                                    ? 'rgba(34,197,94,0.08)'
                                    : 'rgba(255,255,255,0.03)',
                                border: `2px solid ${quest.isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`
                            }}>
                                {/* 헤더 */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{quest.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{quest.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {quest.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: quest.type === 'daily' ? 'rgba(234,179,8,0.15)' : 'rgba(168,85,247,0.15)',
                                        color: quest.type === 'daily' ? '#fbbf24' : '#c084fc'
                                    }}>
                                        {quest.type === 'daily' ? '일간' : '주간'}
                                    </div>
                                </div>

                                {/* 진행 바 */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem'
                                    }}>
                                        <span>진행 상황: {completedCount}/{totalCount} 명 완료</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
                                        height: '8px', overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: quest.isCompleted
                                                ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                                                : 'linear-gradient(90deg, #22d3ee, #3b82f6)',
                                            height: '100%', borderRadius: '4px',
                                            width: `${progress}%`, transition: 'width 0.5s'
                                        }} />
                                    </div>
                                </div>

                                {/* 팀원 상태 */}
                                <div style={{
                                    display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem'
                                }}>
                                    {quest.members.map((member, idx) => (
                                        <div key={idx} style={{
                                            padding: '0.25rem 0.5rem', borderRadius: '6px',
                                            fontSize: '0.75rem', fontWeight: 600,
                                            background: member.completed
                                                ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                                            color: member.completed ? '#4ade80' : '#64748b',
                                            border: member.isMe ? '1px solid rgba(59,130,246,0.3)' : 'none'
                                        }}>
                                            {member.completed ? '✅' : '⬜'} {member.name}
                                            {member.isMe && ' (나)'}
                                        </div>
                                    ))}
                                </div>

                                {/* 보상 */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        💰 완료 시: 팀원 각 +{quest.reward.points}P +{quest.reward.exp}EXP
                                    </div>

                                    {/* 액션 버튼 */}
                                    {quest.isCompleted && !quest.rewardClaimed ? (
                                        <button onClick={() => handleClaim(quest.id)} style={{
                                            padding: '0.4rem 1rem', borderRadius: '8px', border: 'none',
                                            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                                            color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                                        }}>
                                            보상 수령
                                        </button>
                                    ) : quest.rewardClaimed ? (
                                        <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>
                                            ✅ 수령 완료
                                        </span>
                                    ) : myMember && !myMember.completed ? (
                                        <button onClick={() => handleComplete(quest.id)} style={{
                                            padding: '0.4rem 1rem', borderRadius: '8px', border: 'none',
                                            background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                                            color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                                        }}>
                                            내 미션 완료
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            팀원 대기 중...
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default TeamQuestPage;
