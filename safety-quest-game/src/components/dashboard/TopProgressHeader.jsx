import { Link } from 'react-router-dom';
import Avatar from '../Avatar';
import EquipmentSidebar from './EquipmentSidebar';
import StreakButton from '../StreakButton';
import { userProfile } from '../../utils/storage';
import { LEVELS } from '../../utils/pointsCalculator';

const FALLBACK_NAME_BY_ROLE = {
    technician: '김안전',
    supervisor: '관리자',
    safetyManager: '안전관리자'
};

const getNextLevelInfo = (currentPoints) => {
    const sortedLevels = Object.values(LEVELS).sort((a, b) => a.min - b.min);
    return sortedLevels.find((levelInfo) => currentPoints < levelInfo.min) || null;
};

const formatPoints = (value) => Number(value || 0).toLocaleString();

function TopProgressHeader({ playerStats, role, onPointsClick, equippedItems, onNavigateShop, onNavigateAvatar, latestAlerts = [], hasNewAlerts = false, onAlertClick, onCheckIn, onShowMonthlyRewards }) {
    const pointsValue = Number(playerStats?.points || 0);
    const levelInfo = playerStats?.level || {};
    const levelName = levelInfo.name || 'Bronze III';
    const levelColor = levelInfo.color || '#22c55e';
    const levelProgress = Number.isFinite(levelInfo.progress) ? levelInfo.progress : 0;
    const streakDays = Number(playerStats?.streak?.current || 0);
    const displayName = userProfile.getName() || FALLBACK_NAME_BY_ROLE[role] || 'Worker';

    const nextLevel = getNextLevelInfo(pointsValue);
    const nextLevelText = nextLevel
        ? `(Next: ${nextLevel.name} - ${formatPoints(nextLevel.min - pointsValue)}P left)`
        : '(Max level reached)';

    return (
        <div className="top-progress-wrapper">
            <header className="top-progress-header">
                <div className="top-progress-box-logo">
                    <img src="/assets/safety_road_logo-removebg-preview.png" alt="안전의 길" className="top-progress-logo-icon" />
                    <span className="top-progress-logo-text">안전의 길</span>
                </div>

                <div className="top-progress-center-column">
                    <div className="top-progress-box-info">
                        <div className="top-progress-profile">
                            <Link to="/profile" className="top-progress-profile-link">
                                <div className="top-progress-avatar-wrap">
                                    <Avatar size={40} roleId={role} equippedItems={{}} />
                                </div>
                                <div className="top-progress-user-line">{displayName}</div>
                            </Link>
                            <div className="top-progress-profile-content">
                                <div className="top-progress-level-line">Level: {levelName}</div>
                                <div className="top-progress-level-track" aria-label="Level progress">
                                    <span
                                        className="top-progress-level-fill"
                                        style={{
                                            width: `${Math.max(0, Math.min(100, levelProgress))}%`,
                                            background: `linear-gradient(90deg, ${levelColor}, ${levelColor}aa)`
                                        }}
                                    />
                                </div>
                                <div className="top-progress-next-level">{nextLevelText}</div>

                                {/* 포인트 & 스트릭 — 레벨 바 아래로 이동 */}
                                <div className="top-progress-metrics">
                                    <button
                                        type="button"
                                        className="top-progress-metric-btn"
                                        onClick={onPointsClick}
                                        aria-label="포인트 내역 보기"
                                    >
                                        <span className="metric-icon" aria-hidden="true">💰</span>
                                        <span className="metric-value">{formatPoints(pointsValue)}P</span>
                                    </button>
                                    <div className="top-progress-metric">
                                        <span className="metric-icon" aria-hidden="true">🔥</span>
                                        <span className="metric-value">{streakDays}Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 모바일 전용: 장비 바로가기 버튼 (데스크탑에서는 CSS로 숨김) */}
                    <div className="mobile-equip-shortcuts">
                        <button type="button" className="mobile-equip-shortcut-btn" onClick={onNavigateAvatar}>
                            🛠️ 장비 관리
                        </button>
                        <button type="button" className="mobile-equip-shortcut-btn" onClick={onNavigateShop}>
                            🛒 상점 가기
                        </button>
                    </div>
                </div>

                <div className="top-progress-box-equip">
                    <EquipmentSidebar
                        equippedItems={equippedItems}
                        onNavigateShop={onNavigateShop}
                        onNavigateAvatar={onNavigateAvatar}
                    />
                </div>
            </header>

            {/* 스트릭 + 실시간 알림: 헤더 하단 별도 행 */}
            <div className="top-progress-sub-row">
                <div className="top-progress-checkin-area">
                    <StreakButton
                        onCheckIn={onCheckIn}
                        onShowMonthlyRewards={onShowMonthlyRewards}
                    />
                </div>
                <div className="dashboard-alert-inline">
                    <button
                        type="button"
                        className="dashboard-alert-inline-button"
                        onClick={onAlertClick}
                    >
                        <span className="dashboard-alert-inline-label">실시간 알림</span>
                        <span className="dashboard-alert-inline-message">
                            {latestAlerts[0]
                                ? `${latestAlerts[0].zone} ${latestAlerts[0].message}`
                                : '새로운 알림이 없습니다.'}
                        </span>
                        {hasNewAlerts && <span className="dashboard-alert-inline-dot" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TopProgressHeader;
