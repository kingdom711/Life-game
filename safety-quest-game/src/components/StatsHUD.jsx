import React, { useState, useEffect } from 'react';
import { Coins, Zap, ShieldCheck, Sparkles, BarChart2 } from 'lucide-react';
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
                        <Coins size={14} strokeWidth={2} className="stat-icon" aria-hidden="true" />
                        <span className="stat-value">+{statsData.totalPointBoost}%</span>
                    </div>
                )}
                {statsData.totalXpAccelerator > 0 && (
                    <div className="stat-chip xp-boost">
                        <Zap size={14} strokeWidth={2} className="stat-icon" aria-hidden="true" />
                        <span className="stat-value">+{statsData.totalXpAccelerator}%</span>
                    </div>
                )}
                {statsData.totalStreakSaver > 0 && (
                    <div className="stat-chip streak-protect">
                        <ShieldCheck size={14} strokeWidth={2} className="stat-icon" aria-hidden="true" />
                        <span className="stat-value">{statsData.totalStreakSaver}%</span>
                    </div>
                )}
                {statsData.activeSetBonuses?.length > 0 && (
                    <div className="stat-chip set-bonus">
                        <Sparkles size={14} strokeWidth={2} className="stat-icon" aria-hidden="true" />
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
                    <BarChart2 size={16} strokeWidth={2} className="hud-icon" aria-hidden="true" />
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
                            <Coins size={20} strokeWidth={1.75} className="stat-icon-large" aria-hidden="true" />
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
                            <Zap size={20} strokeWidth={1.75} className="stat-icon-large" aria-hidden="true" />
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
                            <ShieldCheck size={20} strokeWidth={1.75} className="stat-icon-large" aria-hidden="true" />
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
                        <Sparkles size={16} strokeWidth={1.75} className="aura-icon" aria-hidden="true" />
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
        pointBoost:    { Icon: Coins,       label: '포인트', color: 'var(--color-safe)' },
        xpAccelerator: { Icon: Zap,         label: 'XP',    color: 'var(--color-warning)' },
        streakSaver:   { Icon: ShieldCheck, label: '보호',   color: 'var(--color-primary-light)' }
    };

    const config = configs[type];
    if (!config || value <= 0) return null;

    return (
        <span
            className="stats-badge"
            style={{ '--badge-color': config.color }}
        >
            <config.Icon size={12} strokeWidth={2} aria-hidden="true" />
            +{value}%
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

