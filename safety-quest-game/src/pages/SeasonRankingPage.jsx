import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getSeasonData, getSeasonDisplayName, getSeasonRemainingDays,
    getSeasonProgress, getMockSeasonRankings, getSeasonRewards,
    getSeasonHistory, getHallOfFame
} from '../utils/seasonManager';

function SeasonRankingPage() {
    const [seasonData, setSeasonData] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [tab, setTab] = useState('ranking'); // ranking | rewards | history

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setSeasonData(getSeasonData());
        setRankings(getMockSeasonRankings());
    };

    if (!seasonData) return null;

    const seasonName = getSeasonDisplayName();
    const remainingDays = getSeasonRemainingDays();
    const progress = getSeasonProgress();
    const rewards = getSeasonRewards();
    const history = getSeasonHistory();
    const hallOfFame = getHallOfFame();

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">← 대시보드</Link>
                </div>

                {/* 시즌 헤더 */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(249,115,22,0.15))',
                    border: '2px solid rgba(234,179,8,0.3)',
                    borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>
                            🏆 {seasonName}
                        </h1>
                        <div style={{
                            background: 'rgba(234,179,8,0.2)', borderRadius: '8px',
                            padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24'
                        }}>
                            D-{remainingDays}
                        </div>
                    </div>

                    {/* 시즌 진행바 */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
                        height: '8px', marginBottom: '0.5rem', overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            height: '100%', borderRadius: '6px',
                            width: `${progress}%`, transition: 'width 0.5s'
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span>시즌 시작</span>
                        <span>{progress}% 진행</span>
                        <span>시즌 종료</span>
                    </div>

                    {/* 내 시즌 스탯 */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem', marginTop: '1rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>
                                {seasonData.seasonPoints.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>시즌 포인트</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa' }}>
                                {seasonData.questsCompleted}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>퀘스트 완료</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                                {seasonData.educationCompleted}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>교육 이수</div>
                        </div>
                    </div>
                </div>

                {/* 탭 */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[
                        { id: 'ranking', label: '🏅 순위' },
                        { id: 'rewards', label: '🎁 시즌 보상' },
                        { id: 'history', label: '📜 이전 시즌' }
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                            background: tab === t.id ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)',
                            color: tab === t.id ? '#fbbf24' : '#94a3b8',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* 순위 탭 */}
                {tab === 'ranking' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {rankings.map((user, idx) => (
                            <div key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', borderRadius: '12px',
                                background: user.isMe
                                    ? 'rgba(59,130,246,0.15)'
                                    : idx < 3 ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.03)',
                                border: user.isMe ? '2px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <div style={{
                                    width: '32px', textAlign: 'center', fontWeight: 800,
                                    fontSize: idx < 3 ? '1.2rem' : '0.9rem',
                                    color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : '#64748b'
                                }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : user.rank}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 700, fontSize: '0.9rem',
                                        color: user.isMe ? '#60a5fa' : '#e2e8f0'
                                    }}>
                                        {user.name} {user.isMe && '(나)'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        퀘스트 {user.questsCompleted}개 완료
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.95rem' }}>
                                        {user.seasonPoints.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>SP</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 보상 탭 */}
                {tab === 'rewards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {rewards.map((reward, idx) => (
                            <div key={idx} style={{
                                padding: '1rem', borderRadius: '12px',
                                background: idx === 0 ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${idx === 0 ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.06)'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>
                                            {reward.label}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                            {reward.title && <span style={{ color: '#c084fc' }}>{reward.title} + </span>}
                                            {reward.gold}G + {reward.trophy} 트로피
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        filter: idx === 0 ? 'drop-shadow(0 0 8px rgba(234,179,8,0.5))' : 'none'
                                    }}>
                                        {idx === 0 ? '🏆' : idx === 1 ? '🏅' : '🎖️'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 이전 시즌 탭 */}
                {tab === 'history' && (
                    <div>
                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
                                이전 시즌 기록이 없습니다.<br />
                                첫 시즌이 종료되면 기록이 남습니다.
                            </div>
                        ) : (
                            history.map((season, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div style={{ fontWeight: 700, color: '#e2e8f0' }}>
                                        {season.seasonId} 시즌
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        시즌 포인트: {season.seasonPoints} | 퀘스트: {season.questsCompleted}개
                                    </div>
                                </div>
                            ))
                        )}

                        {/* 명예의 전당 */}
                        {hallOfFame.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.75rem' }}>
                                    👑 명예의 전당
                                </h3>
                                {hallOfFame.map((entry, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem',
                                        background: 'rgba(234,179,8,0.08)',
                                        border: '1px solid rgba(234,179,8,0.2)'
                                    }}>
                                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                                            {entry.seasonId}
                                        </span>
                                        {' — '}
                                        <span style={{ color: '#e2e8f0' }}>{entry.userName}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {' '}({entry.seasonPoints}SP)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeasonRankingPage;
