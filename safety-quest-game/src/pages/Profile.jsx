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
                <div className="mb-8 text-center">
                    <div className="text-7xl mb-4 h-40 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 
                          to-purple-500/20 rounded-full blur-3xl opacity-50" />
                        {roleInfo?.image ? (
                            <img
                                src={roleInfo.image}
                                alt={roleInfo.name}
                                className="h-full w-auto object-contain drop-shadow-2xl relative z-10 
                                  hover:scale-110 transition-transform duration-300"
                            />
                        ) : (
                            <span className="relative z-10 hover:scale-110 transition-transform duration-300">
                                {roleInfo?.icon || '👤'}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-slate-800 
                      via-blue-600 to-slate-800 bg-clip-text text-transparent">
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
                        <div className="flex justify-between mb-8">
                            <div>
                                <div className="text-slate-600 mb-2 text-sm font-semibold">현재 레벨</div>
                                <div className="badge badge-primary bg-gradient-to-r from-indigo-500 to-blue-500 
                                  text-white border-0 shadow-xl shadow-indigo-500/30 text-lg px-4 py-2 
                                  rounded-full inline-flex items-center">
                                    {stats.level.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-slate-600 mb-2 text-sm font-semibold">총 포인트</div>
                                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 
                                  to-indigo-600 bg-clip-text text-transparent">
                                    {stats.points.toLocaleString()}P
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-600 text-sm font-semibold">다음 레벨까지</span>
                                <span className="font-bold text-indigo-600">{stats.level.progress}%</span>
                            </div>
                            <div className="progress h-4 bg-slate-200 rounded-full overflow-hidden 
                              shadow-inner">
                                <div className="progress-bar h-full bg-gradient-to-r from-indigo-500 
                                  via-blue-500 to-indigo-500 rounded-full relative overflow-hidden" 
                                  style={{ width: `${stats.level.progress}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                      via-white/30 to-transparent animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-2 mb-xl gap-6">
                    {/* 출석 정보 */}
                    <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-orange-50/50 
                      to-white/60 border border-orange-200/50 rounded-2xl p-6 shadow-xl 
                      shadow-orange-500/10 hover:shadow-2xl transition-all duration-500 
                      relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full 
                          blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500" />
                        <div className="card-header relative z-10 mb-4">
                            <h3 className="card-title text-lg font-bold bg-gradient-to-r from-orange-600 
                              to-red-600 bg-clip-text text-transparent">
                              🔥 출석 정보
                            </h3>
                        </div>
                        <div className="card-body relative z-10">
                            <div className="mb-6">
                                <div className="text-slate-600 mb-2 text-sm font-semibold">현재 연속 출석</div>
                                <div className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 
                                  to-red-600 bg-clip-text text-transparent">
                                    {stats.streak.current}일
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-600 mb-2 text-sm font-semibold">최장 연속 출석</div>
                                <div className="text-2xl font-bold text-slate-800">
                                    {stats.streak.longest}일
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 인벤토리 정보 */}
                    <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-emerald-50/50 
                      to-white/60 border border-emerald-200/50 rounded-2xl p-6 shadow-xl 
                      shadow-emerald-500/10 hover:shadow-2xl transition-all duration-500 
                      relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full 
                          blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500" />
                        <div className="card-header relative z-10 mb-4">
                            <h3 className="card-title text-lg font-bold bg-gradient-to-r from-emerald-600 
                              to-teal-600 bg-clip-text text-transparent">
                              🎒 인벤토리 정보
                            </h3>
                        </div>
                        <div className="card-body relative z-10">
                            <div className="mb-6">
                                <div className="text-slate-600 mb-2 text-sm font-semibold">보유 아이템</div>
                                <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 
                                  to-teal-600 bg-clip-text text-transparent">
                                    {stats.inventory.totalItems || 0}개
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-600 mb-2 text-sm font-semibold">총 가치</div>
                                <div className="text-2xl font-bold text-slate-800">
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
