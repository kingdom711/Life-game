import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTeam, getTeamMembers, getTeamPraiseSummary, getRecentPraiseHistory } from '../utils/teamManager';
import { userProfile } from '../utils/storage';
import PraiseModal from '../components/PraiseModal';

function TeamDetailPage() {
    const navigate = useNavigate();
    const [praiseModal, setPraiseModal] = useState({ isOpen: false, targetUser: null });
    const [refreshKey, setRefreshKey] = useState(0);

    const team = getMyTeam();
    const members = getTeamMembers();
    const praiseSummary = getTeamPraiseSummary();
    const recentHistory = getRecentPraiseHistory(10);
    const myName = userProfile.getName() || 'guest';

    const handlePraiseClose = useCallback(() => {
        setPraiseModal({ isOpen: false, targetUser: null });
        setRefreshKey(k => k + 1);
    }, []);

    const formatRelativeTime = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            color: '#f1f5f9',
            paddingBottom: '6rem'
        }}>
            {/* 헤더 */}
            <div style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(15,23,42,0.9)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '10px',
                        width: '36px',
                        height: '36px',
                        color: '#94a3b8',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >←</button>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>우리 팀</h2>
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 팀 정보 카드 */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(51,65,85,0.6))',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid rgba(59,130,246,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '2rem' }}>{team.icon}</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{team.name}</h3>
                            <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                                안전 참여 점수: {team.score}점 · 랭킹 {team.rank}위
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>이번 주 퀘스트 수행률</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>{team.weeklyProgress}%</span>
                        </div>
                        <div style={{
                            height: '8px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.1)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${team.weeklyProgress}%`,
                                height: '100%',
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #3b82f6, #38bdf8)',
                                transition: 'width 0.8s ease-out'
                            }} />
                        </div>
                    </div>
                </div>

                {/* 칭찬 현황 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.5rem'
                }}>
                    {[
                        { label: '보낸 칭찬', value: praiseSummary.totalSent, color: '#fbbf24' },
                        { label: '받은 칭찬', value: praiseSummary.totalReceived, color: '#34d399' },
                        { label: '오늘 남은', value: `${praiseSummary.todayRemaining}/5`, color: '#60a5fa' }
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            background: 'rgba(30,41,59,0.8)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* 팀원 목록 */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>👥</span> 팀원 ({members.length}명)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {members.map(member => (
                            <div key={member.id} style={{
                                background: 'rgba(30,41,59,0.8)',
                                borderRadius: '14px',
                                padding: '1rem 1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'border-color 0.2s'
                            }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'rgba(59,130,246,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    flexShrink: 0
                                }}>
                                    {member.avatar}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{member.roleLabel}</span>
                                        {member.praiseCount > 0 && (
                                            <span style={{
                                                fontSize: '0.68rem',
                                                color: '#fbbf24',
                                                background: 'rgba(251,191,36,0.12)',
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '6px'
                                            }}>
                                                칭찬 {member.praiseCount}회
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPraiseModal({ isOpen: true, targetUser: { id: member.id, name: member.name } })}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))',
                                        border: '1px solid rgba(251,191,36,0.3)',
                                        borderRadius: '10px',
                                        padding: '0.45rem 0.75rem',
                                        color: '#fbbf24',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                        flexShrink: 0
                                    }}
                                >
                                    👏 칭찬
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 최근 칭찬 내역 */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>📋</span> 최근 칭찬 내역
                    </h3>
                    {recentHistory.length === 0 ? (
                        <div style={{
                            background: 'rgba(30,41,59,0.6)',
                            borderRadius: '14px',
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '0.85rem'
                        }}>
                            아직 칭찬 내역이 없습니다.
                            <br />팀원에게 첫 칭찬을 보내보세요!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {recentHistory.map(item => (
                                <div key={item.id} style={{
                                    background: 'rgba(30,41,59,0.6)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    border: '1px solid rgba(255,255,255,0.04)'
                                }}>
                                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.praiseIcon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                                            {item.direction === 'sent'
                                                ? <><strong>{item.targetName}</strong>님에게 <span style={{ color: '#fbbf24' }}>"{item.praiseLabel}"</span> 칭찬</>
                                                : <><strong>{item.senderId}</strong>님이 <span style={{ color: '#34d399' }}>"{item.praiseLabel}"</span> 칭찬</>
                                            }
                                        </div>
                                        {item.message && (
                                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                                                "{item.message}"
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        {formatRelativeTime(item.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 칭찬 모달 */}
            <PraiseModal
                isOpen={praiseModal.isOpen}
                onClose={handlePraiseClose}
                targetUser={praiseModal.targetUser}
            />
        </div>
    );
}

export default TeamDetailPage;
