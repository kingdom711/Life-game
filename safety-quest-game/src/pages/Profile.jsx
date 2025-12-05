import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { points, level, streak, userProfile } from '../utils/storage';
import { calculateLevel } from '../utils/pointsCalculator';
import { getRoleById } from '../data/rolesData';
import { getInventoryStats } from '../utils/inventoryManager';

function Profile({ role }) {
    const [stats, setStats] = useState({
        points: 0,
        level: { name: 'Bronze', current: 1 },
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

    const roleInfo = getRoleById(role);

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {roleInfo?.image ? (
                            <img
                                src={roleInfo.image}
                                alt={roleInfo.name}
                                style={{
                                    height: '100%',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                                }}
                            />
                        ) : (
                            roleInfo?.icon || '👤'
                        )}
                    </div>
                    <h1>{stats.profile.name}</h1>
                    <p className="text-muted">{roleInfo?.name}</p>
                </div>

                {/* 레벨 정보 */}
                <div className="card mb-xl">
                    <div className="card-header">
                        <h3 className="card-title">📊 레벨 정보</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <div className="text-muted mb-sm">현재 레벨</div>
                                <div className="badge badge-primary" style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
                                    {stats.level.name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="text-muted mb-sm">총 포인트</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                                    {stats.points.toLocaleString()}P
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className="text-muted">다음 레벨까지</span>
                                <span className="font-semibold">{stats.level.progress}%</span>
                            </div>
                            <div className="progress" style={{ height: '16px' }}>
                                <div className="progress-bar" style={{ width: `${stats.level.progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-2 mb-xl">
                    {/* 출석 정보 */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🔥 출석 정보</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div className="text-muted mb-sm">현재 연속 출석</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                    {stats.streak.current}일
                                </div>
                            </div>
                            <div>
                                <div className="text-muted mb-sm">최장 연속 출석</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                                    {stats.streak.longest}일
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 인벤토리 정보 */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🎒 인벤토리 정보</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div className="text-muted mb-sm">보유 아이템</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                    {stats.inventory.totalItems || 0}개
                                </div>
                            </div>
                            <div>
                                <div className="text-muted mb-sm">총 가치</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                                    {(stats.inventory.totalValue || 0).toLocaleString()}P
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 역할 정보 */}
                {roleInfo && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">💼 {roleInfo.name}</h3>
                        </div>
                        <div className="card-body">
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

                {/* 초기화 버튼 */}
                <div className="card mt-xl" style={{ borderColor: 'var(--color-danger)' }}>
                    <div className="card-header">
                        <h3 className="card-title text-danger">⚠️ 위험 구역</h3>
                    </div>
                    <div className="card-body">
                        <p className="text-muted mb-md">
                            모든 진행도를 초기화하고 처음부터 다시 시작합니다. 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <button
                            onClick={() => {
                                // 사용자 요청으로 확인 팝업 제거
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="btn btn-danger"
                        >
                            전체 초기화
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
