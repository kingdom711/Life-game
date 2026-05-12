import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getAllAchievementsWithStatus,
    getAchievementSummary,
    claimAchievementReward
} from '../utils/achievementManager';
import {
    ACHIEVEMENT_CATEGORY,
    ACHIEVEMENT_CATEGORY_NAMES,
    ACHIEVEMENT_CATEGORY_ICONS,
    RARITY_COLORS,
    RARITY_BG
} from '../data/achievementData';
import { RARITY_NAMES } from '../data/itemsData';

function AchievementPage() {
    const [achievements, setAchievements] = useState([]);
    const [summary, setSummary] = useState({ total: 0, unlocked: 0, unclaimed: 0, percent: 0 });
    const [activeCategory, setActiveCategory] = useState('all');
    const [claimMessage, setClaimMessage] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setAchievements(getAllAchievementsWithStatus());
        setSummary(getAchievementSummary());
    };

    const handleClaim = (achievementId) => {
        const result = claimAchievementReward(achievementId);
        if (result.success) {
            setClaimMessage(result.message);
            loadData();
            setTimeout(() => setClaimMessage(null), 3000);
        }
    };

    const categories = [
        { id: 'all', name: '전체', icon: '🏆' },
        ...Object.values(ACHIEVEMENT_CATEGORY).map(cat => ({
            id: cat,
            name: ACHIEVEMENT_CATEGORY_NAMES[cat],
            icon: ACHIEVEMENT_CATEGORY_ICONS[cat]
        }))
    ];

    const filtered = activeCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === activeCategory);

    // 정렬: 미수령 보상 > 달성 미수령 > 미달성 (진행률 높은 순)
    const sorted = [...filtered].sort((a, b) => {
        if (a.unlocked && !a.rewardClaimed && !(b.unlocked && !b.rewardClaimed)) return -1;
        if (b.unlocked && !b.rewardClaimed && !(a.unlocked && !a.rewardClaimed)) return 1;
        if (a.unlocked && !b.unlocked) return -1;
        if (b.unlocked && !a.unlocked) return 1;
        return b.progress.percent - a.progress.percent;
    });

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>

                {/* 헤더 */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🏆 업적
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                        장기 목표를 달성하고 특별한 보상을 받으세요
                    </p>
                </div>

                {/* 보상 수령 알림 */}
                {claimMessage && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        color: '#4ade80',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {claimMessage}
                    </div>
                )}

                {/* 요약 통계 */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    달성 현황
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                                        {summary.unlocked}
                                    </span>
                                    <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                                        / {summary.total}
                                    </span>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: '#fbbf24',
                                        fontWeight: 600,
                                        marginLeft: '0.5rem'
                                    }}>
                                        ({summary.percent}%)
                                    </span>
                                </div>
                                {/* 프로그레스 바 */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '999px',
                                    height: '8px',
                                    marginTop: '0.5rem',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                        height: '100%',
                                        borderRadius: '999px',
                                        width: `${summary.percent}%`,
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                            {summary.unclaimed > 0 && (
                                <div style={{
                                    background: 'rgba(234, 179, 8, 0.15)',
                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
                                        {summary.unclaimed}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
                                        수령 대기
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 카테고리 필터 */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    marginBottom: '1.5rem'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                border: activeCategory === cat.id
                                    ? '1px solid rgba(251, 191, 36, 0.5)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: activeCategory === cat.id
                                    ? 'rgba(251, 191, 36, 0.15)'
                                    : 'rgba(255,255,255,0.05)',
                                color: activeCategory === cat.id ? '#fbbf24' : 'var(--color-text-muted)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* 업적 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sorted.map(achievement => {
                        const rarityColor = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
                        const rarityBg = RARITY_BG[achievement.rarity] || RARITY_BG.common;
                        const isHidden = achievement.hidden && !achievement.unlocked;
                        const canClaim = achievement.unlocked && !achievement.rewardClaimed;

                        return (
                            <div
                                key={achievement.id}
                                className="card"
                                style={{
                                    opacity: achievement.unlocked ? 1 : 0.7,
                                    border: canClaim
                                        ? `2px solid ${rarityColor}`
                                        : undefined,
                                    boxShadow: canClaim
                                        ? `0 0 20px ${rarityColor}22`
                                        : undefined
                                }}
                            >
                                <div className="card-body" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem'
                                }}>
                                    {/* 아이콘 */}
                                    <div style={{
                                        fontSize: '2rem',
                                        width: '52px',
                                        height: '52px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        background: rarityBg,
                                        flexShrink: 0,
                                        filter: isHidden ? 'grayscale(1) blur(2px)' : 'none'
                                    }}>
                                        {isHidden ? '❓' : achievement.icon}
                                    </div>

                                    {/* 내용 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: achievement.unlocked ? '#f1f5f9' : 'var(--color-text-muted)',
                                                fontSize: '0.95rem'
                                            }}>
                                                {isHidden ? '??? 히든 업적' : achievement.name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '0.15rem 0.4rem',
                                                borderRadius: '4px',
                                                background: rarityBg,
                                                color: rarityColor,
                                                fontWeight: 700
                                            }}>
                                                {RARITY_NAMES[achievement.rarity] || achievement.rarity}
                                            </span>
                                            {achievement.unlocked && (
                                                <span style={{ fontSize: '0.8rem' }}>✅</span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: '0.4rem'
                                        }}>
                                            {isHidden ? '조건을 달성하면 공개됩니다' : achievement.description}
                                        </div>

                                        {/* 진행률 바 */}
                                        {!achievement.unlocked && !isHidden && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    flex: 1,
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '999px',
                                                    height: '6px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        background: rarityColor,
                                                        height: '100%',
                                                        borderRadius: '999px',
                                                        width: `${achievement.progress.percent}%`,
                                                        transition: 'width 0.5s ease'
                                                    }} />
                                                </div>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    color: 'var(--color-text-muted)',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {achievement.progress.current}/{achievement.progress.target}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 보상/수령 버튼 */}
                                    <div style={{ flexShrink: 0 }}>
                                        {canClaim ? (
                                            <button
                                                onClick={() => handleClaim(achievement.id)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}cc)`,
                                                    color: '#0f172a',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    animation: 'pulse 2s infinite'
                                                }}
                                            >
                                                +{achievement.reward.points}P 수령
                                            </button>
                                        ) : achievement.rewardClaimed ? (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-text-muted)',
                                                fontWeight: 600
                                            }}>
                                                수령 완료
                                            </span>
                                        ) : (
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: rarityColor,
                                                fontWeight: 600
                                            }}>
                                                {achievement.reward?.points}P
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default AchievementPage;
