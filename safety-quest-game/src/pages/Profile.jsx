import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { points, level, streak, userProfile, storage } from '../utils/storage';
import { calculateLevel, getPointsToNextLevel, TIERS } from '../utils/pointsCalculator';
import { getRoleById } from '../data/rolesData';
import { getInventoryStats } from '../utils/inventoryManager';
import { getActiveSpecialization, getUnlockedSpecializations } from '../utils/specializationManager';
import { getAllSpecializationProgress } from '../utils/specializationManager';
import { SPECIALIZATIONS, SPECIALIZATION_STATUS } from '../data/specializationData';
import { useAuth } from '../context/AuthContext';

const COLOR = {
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    bronze: 'var(--color-bronze)'
};

function Profile({ role }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        points: 0,
        level: {
            name: 'Bronze III',
            current: 1,
            color: COLOR.bronze,
            min: 0,
            max: 10000,
            progress: 0,
            tier: 'bronze',
            tierName: 'Bronze',
            tierIcon: '🥉',
            rank: 1,
            subRank: 3,
            totalRanks: 15,
            tierRanks: 3
        },
        streak: { current: 0, longest: 0 },
        inventory: {},
        profile: {}
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const currentPoints = points.get();
        const currentLevel = calculateLevel(currentPoints);
        const levelData = level.get();
        const streakData = streak.get();
        const inventoryStats = getInventoryStats();
        const profileData = userProfile.get();

        setStats({
            points: currentPoints,
            level: { ...currentLevel, current: levelData.current },
            streak: streakData,
            inventory: inventoryStats,
            profile: profileData
        });
    };

    const handleLogout = async () => {
        if (window.confirm('정말 로그아웃 하시겠습니까?')) {
            try {
                await logout();
                navigate('/');
            } catch (error) {
                console.error("Logout failed", error);
                alert("로그아웃 중 오류가 발생했습니다.");
            }
        }
    };

    const roleInfo = getRoleById(role);

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>
                {/* ... existing header code ... */}
                <div className="mb-8 text-center">
                    <div className="text-7xl mb-4 h-40 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 
                          to-purple-500/20 rounded-full blur-3xl opacity-50" />
                        {roleInfo?.image ? (
                            <img
                                src={roleInfo.image}
                                alt={roleInfo.name}
                                className="h-full w-auto object-contain drop-shadow-2xl relative z-10 
                                  hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <span className="relative z-10 hover:scale-105 transition-transform duration-300">
                                {roleInfo?.icon || '👤'}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 
                      via-teal-600 to-green-600 bg-clip-text text-transparent">
                        {stats.profile.name}
                    </h1>
                    <p className="text-slate-600 text-lg">{roleInfo?.name}</p>
                </div>

                {/* 레벨 정보 */}
                <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-indigo-50/50 
                  to-white/60 border border-indigo-200/50 rounded-2xl p-6 mb-xl shadow-xl 
                  shadow-indigo-500/10 hover:shadow-2xl transition-all duration-500 relative 
                  overflow-hidden group">
                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }} />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full 
                      blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-500" />
                    <div className="card-header relative z-10 mb-4">
                        <h3 className="card-title text-xl font-bold bg-gradient-to-r from-indigo-600 
                          to-blue-600 bg-clip-text text-transparent">
                            📊 레벨 정보
                        </h3>
                    </div>
                    <div className="card-body relative z-10">
                        {/* 티어 및 레벨 정보 */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-slate-300 mb-2 text-sm font-semibold">현재 레벨</div>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{stats.level.tierIcon}</span>
                                    <div>
                                        <div className="text-2xl font-extrabold" style={{ color: stats.level.color }}>
                                            {stats.level.name}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            Rank {stats.level.rank} / {stats.level.totalRanks}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-slate-300 mb-2 text-sm font-semibold">총 포인트</div>
                                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 
                                  to-indigo-500 bg-clip-text text-transparent">
                                    {stats.points.toLocaleString()}P
                                </div>
                            </div>
                        </div>

                        {/* 티어 진행도 */}
                        <div className="mb-6">
                            <div className="text-slate-300 mb-3 text-sm font-semibold">티어 진행도</div>
                            <div className="flex gap-2">
                                {Object.entries(TIERS).map(([tierKey, tierInfo]) => {
                                    const isCurrentTier = stats.level.tier === tierKey;
                                    const isPastTier = Object.keys(TIERS).indexOf(tierKey) < Object.keys(TIERS).indexOf(stats.level.tier);
                                    return (
                                        <div
                                            key={tierKey}
                                            className={`flex-1 p-3 rounded-lg text-center transition-all duration-300 ${isCurrentTier
                                                ? 'ring-2 ring-offset-2 shadow-lg'
                                                : isPastTier
                                                    ? 'opacity-100'
                                                    : 'opacity-40'
                                                }`}
                                            style={{
                                                backgroundColor: isPastTier || isCurrentTier ? `${tierInfo.color}20` : COLOR.text,
                                                borderColor: tierInfo.color,
                                                ringColor: isCurrentTier ? tierInfo.color : 'transparent'
                                            }}
                                        >
                                            <div className="text-2xl mb-1">{tierInfo.icon}</div>
                                            <div className="text-xs font-semibold" style={{ color: isPastTier || isCurrentTier ? tierInfo.color : COLOR.textMuted }}>
                                                {tierInfo.name}
                                            </div>
                                            {isCurrentTier && (
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {4 - stats.level.subRank}/3
                                                </div>
                                            )}
                                            {isPastTier && (
                                                <div className="text-xs text-emerald-500 mt-1">✓</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 다음 레벨까지 진행도 */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-300 text-sm font-semibold">
                                    다음 레벨까지
                                </span>
                                <span className="font-bold text-indigo-400">
                                    {stats.level.max !== Infinity
                                        ? `${(stats.level.max - stats.points).toLocaleString()}P 남음`
                                        : '최고 레벨 달성!'
                                    }
                                </span>
                            </div>
                            <div className="progress h-4 bg-slate-200 rounded-full overflow-hidden 
                              shadow-inner">
                                <div className="progress-bar h-full rounded-full relative overflow-hidden"
                                    style={{
                                        width: `${stats.level.progress}%`,
                                        background: `linear-gradient(90deg, ${stats.level.color}, ${stats.level.color}cc)`
                                    }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                      via-white/30 to-transparent" />
                                </div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-slate-500">
                                <span>{stats.level.min.toLocaleString()}P</span>
                                <span className="font-semibold">{stats.level.progress}%</span>
                                <span>{stats.level.max !== Infinity ? stats.level.max.toLocaleString() + 'P' : '∞'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 출석 정보 & 인벤토리 정보 - 비활성화 */}

                {/* 역할 정보 + 전직 정보 (1:1 가로 배치) */}
                <div style={{ display: 'grid', gridTemplateColumns: role === 'technician' ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'stretch' }}>
                    {/* 역할 정보 */}
                    {roleInfo && (
                        <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <h3 className="card-title">💼 {roleInfo.name}</h3>
                            </div>
                            <div className="card-body" style={{ flex: 1 }}>
                                <p className="mb-md">{roleInfo.description}</p>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>주요 기능</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {roleInfo.features.map((feature, index) => (
                                            <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: roleInfo.color }}>✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 전직 정보 - 기술인만 */}
                    {role === 'technician' && (() => {
                        const activeSpec = getActiveSpecialization();
                        const unlockedSpecs = getUnlockedSpecializations();
                        return (
                            <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                                <div className="card-header">
                                    <h3 className="card-title">⚔️ 전직 정보</h3>
                                </div>
                                <div className="card-body" style={{ flex: 1 }}>
                                    {/* 현재 전직 상태 */}
                                    {activeSpec ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            background: `${activeSpec.color}10`,
                                            border: `1px solid ${activeSpec.color}30`,
                                            marginBottom: '1rem'
                                        }}>
                                            <span style={{ fontSize: '2rem' }}>{activeSpec.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, color: activeSpec.color }}>{activeSpec.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                    포인트 x{activeSpec.bonuses.pointMultiplier} 보너스 적용 중
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                            아직 전직하지 않았습니다
                                        </p>
                                    )}

                                    {/* 전체 역할 목록 */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                            전직 가능 역할
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {SPECIALIZATIONS.map(spec => {
                                                const progress = getAllSpecializationProgress().find(p => p.specId === spec.id);
                                                const isActive = activeSpec?.id === spec.id;
                                                const isUnlocked = progress?.status === SPECIALIZATION_STATUS.UNLOCKED || progress?.status === SPECIALIZATION_STATUS.ACTIVE;
                                                const isInProgress = progress?.status === SPECIALIZATION_STATUS.IN_PROGRESS;
                                                const isAvailable = progress?.status === SPECIALIZATION_STATUS.AVAILABLE;
                                                return (
                                                    <div key={spec.id} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.6rem',
                                                        padding: '0.4rem 0.6rem',
                                                        borderRadius: '0.4rem',
                                                        background: isActive ? `${spec.color}15` : 'rgba(255,255,255,0.03)',
                                                        border: isActive ? `1px solid ${spec.color}30` : '1px solid transparent',
                                                        opacity: isActive || isUnlocked || isInProgress || isAvailable ? 1 : 0.5
                                                    }}>
                                                        <span style={{ fontSize: '1.2rem', width: '1.5rem', textAlign: 'center' }}>{spec.icon}</span>
                                                        <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: isActive ? 700 : 400, color: isActive ? spec.color : 'var(--color-text-secondary)' }}>
                                                            {spec.name}
                                                        </span>
                                                        <span style={{ fontSize: '0.7rem', color: isActive ? spec.color : isUnlocked ? '#22c55e' : isInProgress ? '#f59e0b' : 'var(--color-text-tertiary)' }}>
                                                            {isActive ? '⚡ 장착중' : isUnlocked ? '✓ 해금' : isInProgress ? '진행중' : isAvailable ? '가능' : '🔒'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Link
                                        to="/specialization"
                                        className="btn btn-secondary btn-sm"
                                        style={{ marginTop: 'auto', display: 'inline-block' }}
                                    >
                                        전직 센터 바로가기 →
                                    </Link>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* 로그아웃 & 초기화 버튼 */}
                <div className="grid grid-2 gap-6 mt-xl">
                    <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
                        <div className="card-header">
                            <h3 className="card-title text-primary">🚪 계정 관리</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-md">
                                안전하게 로그아웃하고 메인 화면으로 돌아갑니다.
                            </p>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary w-full"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
                        <div className="card-header">
                            <h3 className="card-title text-danger">⚠️ 위험 구역</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-md">
                                모든 진행도를 초기화하고 처음부터 다시 시작합니다. 이 작업은 되돌릴 수 없습니다.
                            </p>
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
        </div>
    );
}

export default Profile;
