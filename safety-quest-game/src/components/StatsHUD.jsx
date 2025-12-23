import React, { useState, useEffect } from 'react';
import { getActiveStatsForHUD, getTotalCombinedStats } from '../utils/pointsCalculator';
import { ITEM_SETS } from '../data/setsData';

/**
 * 활성 스탯 HUD 컴포넌트
 * 현재 장착된 아이템의 총 스탯 및 세트 효과 표시
 */
const StatsHUD = ({ compact = false, showSetBonuses = true }) => {
    const [statsData, setStatsData] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        const data = getActiveStatsForHUD();
        setStatsData(data);
    };

    // 외부에서 갱신 가능하도록 노출
    useEffect(() => {
        window.refreshStatsHUD = loadStats;
        return () => {
            delete window.refreshStatsHUD;
        };
    }, []);

    if (!statsData) return null;

    const hasAnyStats = statsData.totalPointBoost > 0 || 
                        statsData.totalXpAccelerator > 0 || 
                        statsData.totalStreakSaver > 0;

    if (!hasAnyStats && !statsData.activeSetBonuses?.length) {
        return null; // 스탯이 없으면 표시하지 않음
    }

    // Compact 모드 (인라인 표시)
    if (compact) {
        return (
            <div className="stats-hud-compact">
                {statsData.totalPointBoost > 0 && (
                    <div className="stat-chip point-boost">
                        <span className="stat-icon">💰</span>
                        <span className="stat-value">+{statsData.totalPointBoost}%</span>
                    </div>
                )}
                {statsData.totalXpAccelerator > 0 && (
                    <div className="stat-chip xp-boost">
                        <span className="stat-icon">⚡</span>
                        <span className="stat-value">+{statsData.totalXpAccelerator}%</span>
                    </div>
                )}
                {statsData.totalStreakSaver > 0 && (
                    <div className="stat-chip streak-protect">
                        <span className="stat-icon">🛡️</span>
                        <span className="stat-value">{statsData.totalStreakSaver}%</span>
                    </div>
                )}
                {statsData.activeSetBonuses?.length > 0 && (
                    <div className="stat-chip set-bonus">
                        <span className="stat-icon">✨</span>
                        <span className="stat-value">{statsData.activeSetBonuses.length}</span>
                    </div>
                )}
            </div>
        );
    }

    // Full 모드
    return (
        <div className={`stats-hud ${statsData.visualAuraCssClass || ''}`}>
            <div 
                className="stats-hud-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3>
                    <span className="hud-icon">📊</span>
                    활성 스탯
                </h3>
                <button className="expand-btn">
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            <div className={`stats-hud-body ${isExpanded ? 'expanded' : ''}`}>
                {/* 주요 스탯 */}
                <div className="stats-main">
                    <div className="stat-item">
                        <div className="stat-header">
                            <span className="stat-icon-large">💰</span>
                            <span className="stat-name">포인트 부스트</span>
                        </div>
                        <div className="stat-value-large">
                            +{statsData.totalPointBoost}%
                        </div>
                        <div className="stat-breakdown">
                            <span>아이템: {statsData.itemStats?.pointBoost || 0}%</span>
                            <span>세트: {statsData.setStats?.pointBoost || 0}%</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-header">
                            <span className="stat-icon-large">⚡</span>
                            <span className="stat-name">XP 가속기</span>
                        </div>
                        <div className="stat-value-large">
                            +{statsData.totalXpAccelerator}%
                        </div>
                        <div className="stat-breakdown">
                            <span>아이템: {statsData.itemStats?.xpAccelerator || 0}%</span>
                            <span>세트: {statsData.setStats?.xpAccelerator || 0}%</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-header">
                            <span className="stat-icon-large">🛡️</span>
                            <span className="stat-name">스트릭 보호</span>
                        </div>
                        <div className="stat-value-large">
                            {statsData.totalStreakSaver}%
                        </div>
                        <div className="stat-breakdown">
                            <span>아이템: {statsData.itemStats?.streakSaver || 0}%</span>
                            <span>세트: {statsData.setStats?.streakSaver || 0}%</span>
                        </div>
                    </div>
                </div>

                {/* 세트 효과 */}
                {showSetBonuses && statsData.activeSetBonuses?.length > 0 && (
                    <div className="stats-set-bonuses">
                        <h4>활성 세트 효과</h4>
                        {statsData.activeSetBonuses.map((bonus, index) => (
                            <div key={index} className={`set-bonus-item rarity-${ITEM_SETS[bonus.setId]?.rarity || 'common'}`}>
                                <div className="set-info">
                                    <span className="set-name">{bonus.setName}</span>
                                    <span className="set-pieces">
                                        ({bonus.pieceCount}/{bonus.maxPieces})
                                    </span>
                                </div>
                                <div className="set-bonus-name">{bonus.bonusName}</div>
                                <div className="set-bonus-desc">{bonus.bonusDescription}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 시각 효과 표시 */}
                {statsData.visualAuraName && (
                    <div className="stats-aura-info">
                        <span className="aura-icon">✨</span>
                        <span className="aura-name">{statsData.visualAuraName} 활성화</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * 인라인 스탯 배지 (대시보드 등에서 사용)
 */
export const StatsBadge = ({ type, value }) => {
    const configs = {
        pointBoost: { icon: '💰', label: '포인트', color: '#10b981' },
        xpAccelerator: { icon: '⚡', label: 'XP', color: '#f59e0b' },
        streakSaver: { icon: '🛡️', label: '보호', color: '#6366f1' }
    };

    const config = configs[type];
    if (!config || value <= 0) return null;

    return (
        <span 
            className="stats-badge"
            style={{ '--badge-color': config.color }}
        >
            {config.icon} +{value}%
        </span>
    );
};

/**
 * 세트 진행도 표시 컴포넌트
 */
export const SetProgressIndicator = ({ setId, currentPieces, maxPieces }) => {
    const setInfo = ITEM_SETS[setId];
    if (!setInfo) return null;

    const bonusTiers = Object.keys(setInfo.bonuses).map(Number).sort((a, b) => a - b);
    
    return (
        <div className="set-progress-indicator">
            <div className="set-progress-header">
                <span className="set-name">{setInfo.name}</span>
                <span className="set-count">{currentPieces}/{maxPieces}</span>
            </div>
            <div className="set-progress-bar">
                <div 
                    className="set-progress-fill"
                    style={{ width: `${(currentPieces / maxPieces) * 100}%` }}
                />
                {bonusTiers.map(tier => (
                    <div 
                        key={tier}
                        className={`tier-marker ${currentPieces >= tier ? 'achieved' : ''}`}
                        style={{ left: `${(tier / maxPieces) * 100}%` }}
                    >
                        <span className="tier-label">{tier}</span>
                    </div>
                ))}
            </div>
            <div className="set-bonus-preview">
                {bonusTiers.map(tier => (
                    <div 
                        key={tier}
                        className={`bonus-tier ${currentPieces >= tier ? 'active' : 'locked'}`}
                    >
                        <span className="tier-number">{tier}피스:</span>
                        <span className="tier-name">{setInfo.bonuses[tier].name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsHUD;

