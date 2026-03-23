import { useState, useEffect } from 'react';
import { RARITY_COLORS } from '../data/achievementData';

/**
 * 업적 달성 시 팝업 토스트 알림
 * 화면 상단에 슬라이드 인/아웃 애니메이션으로 표시
 */
function AchievementToast({ achievement, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!achievement) return;

        // 슬라이드 인
        requestAnimationFrame(() => setIsVisible(true));

        // 4초 후 자동 닫기
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 400);
        }, 4000);

        return () => clearTimeout(timer);
    }, [achievement, onClose]);

    if (!achievement) return null;

    const rarityColor = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

    return (
        <div
            style={{
                position: 'fixed',
                top: isVisible ? '1.5rem' : '-120px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                width: '90%',
                maxWidth: '420px'
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%)',
                    border: `2px solid ${rarityColor}`,
                    borderRadius: '16px',
                    padding: '1rem 1.25rem',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${rarityColor}33`,
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 400);
                }}
            >
                {/* 아이콘 */}
                <div style={{
                    fontSize: '2.5rem',
                    flexShrink: 0,
                    animation: 'bounce 0.6s ease-in-out'
                }}>
                    {achievement.icon}
                </div>

                {/* 내용 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: rarityColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '0.2rem'
                    }}>
                        업적 달성!
                    </div>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#f1f5f9',
                        marginBottom: '0.15rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {achievement.name}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8'
                    }}>
                        {achievement.description}
                    </div>
                </div>

                {/* 보상 */}
                {achievement.reward?.gold && (
                    <div style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#fbbf24',
                        flexShrink: 0
                    }}>
                        +{achievement.reward.gold}G
                    </div>
                )}
            </div>
        </div>
    );
}

export default AchievementToast;
