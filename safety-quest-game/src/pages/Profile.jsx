import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { points, level, streak, userProfile, storage } from '../utils/storage';
import { calculateLevel, TIERS } from '../utils/pointsCalculator';
import { getRoleById } from '../data/rolesData';
import { getInventoryStats } from '../utils/inventoryManager';
import { useAuth } from '../context/AuthContext';
import useTeamGate from '../hooks/useTeamGate';
import TeamJoinWizard from '../components/team/TeamJoinWizard';
import LanguageSelector from '../components/LanguageSelector';

function Profile({ role }) {
    const { user, logout } = useAuth();
    const teamGate = useTeamGate({ autoLoad: Boolean(user) });
    const navigate = useNavigate();
    const [showTeamWizard, setShowTeamWizard] = useState(false);
    const [stats, setStats] = useState({
        points: 0,
        level: calculateLevel(0),
        streak: { current: 0, longest: 0 },
        inventory: {},
        profile: {}
    });

    useEffect(() => {
        const currentPoints = points.get();
        const levelData = level.get();
        setStats({
            points: currentPoints,
            level: { ...calculateLevel(currentPoints), current: levelData.current },
            streak: streak.get(),
            inventory: getInventoryStats(),
            profile: userProfile.get()
        });
    }, []);

    const handleLogout = async () => {
        if (!window.confirm('로그아웃할까요?')) return;
        await logout();
        navigate('/');
    };

    const roleInfo = getRoleById(role);
    const team = teamGate.team || user?.team;

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">대시보드로 돌아가기</Link>
                </div>

                <div className="mb-8 text-center">
                    <div className="text-7xl mb-4 h-40 flex items-center justify-center relative">
                        {roleInfo?.image ? (
                            <img src={roleInfo.image} alt={roleInfo.name} className="h-full w-auto object-contain drop-shadow-2xl relative z-10" />
                        ) : (
                            <span className="relative z-10">{roleInfo?.icon || 'User'}</span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {stats.profile.name || user?.name || '사용자'}
                    </h1>
                    <p className="text-slate-600 text-lg">{roleInfo?.name}</p>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">팀 상태</h3>
                    </div>
                    <div className="card-body">
                        {teamGate.loading ? (
                            <p className="text-muted">팀 정보를 불러오는 중입니다.</p>
                        ) : teamGate.isActive || team ? (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>현장</div>
                                    <div style={{ color: '#e2e8f0', fontWeight: 800 }}>{team?.siteName || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>팀</div>
                                    <div style={{ color: '#e2e8f0', fontWeight: 800 }}>
                                        {team?.name || teamGate.membership?.teamName}
                                        {teamGate.isLeader && <span style={{ marginLeft: 8, color: '#38bdf8' }}>리더</span>}
                                    </div>
                                </div>
                            </div>
                        ) : teamGate.isPending ? (
                            <div>
                                <div style={{ color: '#fbbf24', fontWeight: 800 }}>가입 승인 대기 중</div>
                                <p className="text-muted" style={{ marginTop: '0.35rem' }}>
                                    {teamGate.membership?.teamName} 리더의 승인을 기다리고 있습니다.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-muted">팀을 설정하면 팀 퀘스트와 랭킹에 참여할 수 있습니다.</p>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowTeamWizard(true)}>
                                    팀 설정하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card mb-xl">
                    <div className="card-header">
                        <h3 className="card-title">레벨 정보</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <div className="text-muted">현재 레벨</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stats.level.color }}>
                                    {stats.level.name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="text-muted">총 포인트</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                                    {stats.points.toLocaleString()}P
                                </div>
                            </div>
                        </div>
                        <div className="progress h-4 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="progress-bar h-full rounded-full"
                                style={{
                                    width: `${stats.level.progress}%`,
                                    background: `linear-gradient(90deg, ${stats.level.color}, ${stats.level.color}cc)`
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            {Object.entries(TIERS).map(([tierKey, tierInfo]) => (
                                <div key={tierKey} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, background: `${tierInfo.color}15`, color: tierInfo.color, textAlign: 'center', fontWeight: 700 }}>
                                    {tierInfo.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {roleInfo && (
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-header">
                            <h3 className="card-title">{roleInfo.name}</h3>
                        </div>
                        <div className="card-body">
                            <p className="mb-md">{roleInfo.description}</p>
                        </div>
                    </div>
                )}

                <div className="card mb-lg">
                    <div className="card-header">
                        <h3 className="card-title">언어 설정</h3>
                    </div>
                    <div className="card-body">
                        <LanguageSelector />
                    </div>
                </div>

                <div className="grid grid-2 gap-6 mt-xl">
                    <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
                        <div className="card-header">
                            <h3 className="card-title text-primary">계정 관리</h3>
                        </div>
                        <div className="card-body">
                            <button onClick={handleLogout} className="btn btn-secondary w-full">
                                로그아웃
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
                        <div className="card-header">
                            <h3 className="card-title text-danger">초기화</h3>
                        </div>
                        <div className="card-body">
                            <button
                                onClick={() => {
                                    storage.clearCurrentUserData();
                                    window.location.reload();
                                }}
                                className="btn btn-danger w-full"
                            >
                                전체 초기화
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <TeamJoinWizard
                isOpen={showTeamWizard}
                onClose={() => setShowTeamWizard(false)}
                onComplete={async () => {
                    await teamGate.refresh();
                    setShowTeamWizard(false);
                }}
            />
        </div>
    );
}

export default Profile;
