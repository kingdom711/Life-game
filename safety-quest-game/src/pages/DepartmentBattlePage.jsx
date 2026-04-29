import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getDeptRankings, getMyDeptInfo, getBattleRemainingDays,
    getScoreCategories, getBattleRewards
} from '../utils/departmentBattleManager';
import useTeamGate from '../hooks/useTeamGate';

function DepartmentBattlePage() {
    const teamGate = useTeamGate();
    const [rankings, setRankings] = useState([]);
    const [myDept, setMyDept] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setRankings(getDeptRankings());
        setMyDept(getMyDeptInfo());
    };

    const remainingDays = getBattleRemainingDays();
    const categories = getScoreCategories();
    const rewards = getBattleRewards();

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
                                {teamGate.isPending ? '팀 리더의 승인을 기다리고 있습니다.' : '팀에 가입해야 부서 대전에 참여할 수 있습니다.'}
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
                    <Link to="/" className="btn btn-secondary btn-sm">← 대시보드</Link>
                </div>

                {/* 대항전 헤더 */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))',
                    border: '2px solid rgba(168,85,247,0.3)',
                    borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <h1 style={{
                                margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#c084fc'
                            }}>
                                🏆 부서 대항전
                            </h1>
                            <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                                이번 달 안전 종합 점수 경쟁
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(168,85,247,0.2)', borderRadius: '8px',
                            padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#c084fc'
                        }}>
                            D-{remainingDays}
                        </div>
                    </div>

                    {/* 내 부서 현황 */}
                    {myDept && (
                        <div style={{
                            marginTop: '1rem', padding: '0.75rem', borderRadius: '10px',
                            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)'
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>
                                        {myDept.rank}위
                                    </span>
                                    <span style={{ color: '#e2e8f0', fontWeight: 600, marginLeft: '0.5rem' }}>
                                        {myDept.name}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.3rem' }}>
                                        (우리 부서)
                                    </span>
                                </div>
                                <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>
                                    {myDept.totalScore}점
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 순위 목록 */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
                        부서별 순위
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {rankings.map((dept, idx) => {
                            const isMyDept = myDept && dept.id === myDept.id;
                            const isExpanded = selectedDept === dept.id;

                            return (
                                <div key={dept.id}
                                    onClick={() => setSelectedDept(isExpanded ? null : dept.id)}
                                    style={{
                                        padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                                        background: isMyDept
                                            ? 'rgba(59,130,246,0.1)'
                                            : idx < 3 ? 'rgba(234,179,8,0.05)' : 'rgba(255,255,255,0.02)',
                                        border: isMyDept
                                            ? '2px solid rgba(59,130,246,0.3)'
                                            : '1px solid rgba(255,255,255,0.06)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                                    }}>
                                        <div style={{
                                            width: '32px', textAlign: 'center', fontWeight: 800,
                                            fontSize: idx < 3 ? '1.2rem' : '0.9rem',
                                            color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : '#64748b'
                                        }}>
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : dept.rank}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: 700, color: isMyDept ? '#60a5fa' : '#e2e8f0',
                                                fontSize: '0.9rem'
                                            }}>
                                                {dept.name} {isMyDept && '(우리)'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                {dept.memberCount}명
                                                {dept.rankChange > 0 && <span style={{ color: '#4ade80' }}> ▲{dept.rankChange}</span>}
                                                {dept.rankChange < 0 && <span style={{ color: '#f87171' }}> ▼{Math.abs(dept.rankChange)}</span>}
                                                {dept.rankChange === 0 && <span style={{ color: '#64748b' }}> —</span>}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>
                                                {dept.totalScore}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>점</div>
                                        </div>
                                    </div>

                                    {/* 확장 상세 */}
                                    {isExpanded && (
                                        <div style={{
                                            marginTop: '0.75rem', paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.06)'
                                        }}>
                                            {Object.entries(categories).map(([key, cat]) => (
                                                <div key={key} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    marginBottom: '0.4rem'
                                                }}>
                                                    <div style={{
                                                        flex: 1, fontSize: '0.75rem', color: '#94a3b8'
                                                    }}>
                                                        {cat.label}
                                                    </div>
                                                    <div style={{
                                                        width: '100px', background: 'rgba(0,0,0,0.3)',
                                                        borderRadius: '3px', height: '6px', overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            background: '#c084fc',
                                                            height: '100%', borderRadius: '3px',
                                                            width: `${(dept.scores[key] / cat.maxScore) * 100}%`
                                                        }} />
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem', color: '#e2e8f0',
                                                        fontWeight: 600, width: '50px', textAlign: 'right'
                                                    }}>
                                                        {dept.scores[key]}/{cat.maxScore}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 보상 테이블 */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)', borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem'
                }}>
                    <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
                        🎁 대항전 보상
                    </h3>
                    {rewards.map((r, idx) => (
                        <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.5rem 0',
                            borderBottom: idx < rewards.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{r.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                                    {r.rank ? `${r.rank}위` : '참여 부서'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.reward}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DepartmentBattlePage;
