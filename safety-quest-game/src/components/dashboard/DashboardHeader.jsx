import { useNavigate } from 'react-router-dom';
import useTeamGate from '../../hooks/useTeamGate';

const ROLE_LABELS = {
    technician: '기술인',
    supervisor: '관리감독자',
    safetyManager: '안전관리자'
};

function DashboardHeader({ playerStats, role, activeWorkStopCount = 0, unreadNotifCount = 0, onNotificationClick }) {
    const navigate = useNavigate();
    const teamGate = useTeamGate();
    const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const teamLabel = teamGate.team?.name || (teamGate.isPending ? '팀 승인 대기' : '팀 미설정');
    const levelName = playerStats?.level?.name || 'Bronze III';
    const numericLevel = Number(playerStats?.experience?.current || 1);
    const streakDays = Number(playerStats?.streak?.current || 0);
    const roleLabel = ROLE_LABELS[role] || '기술인';

    return (
        <div className="dash-hero-banner">
            {/* 배경 글로우 오브 */}
            <div className="dash-hero-glow dash-hero-glow--blue" />
            <div className="dash-hero-glow dash-hero-glow--purple" />

            {/* 메인 콘텐츠: 브랜드 + 배지 */}
            <div className="dash-hero-content">
                {/* 로고 + 타이틀 */}
                <div className="dash-hero-brand">
                    <div className="dash-hero-logo-wrap">
                        <img
                            src="/assets/safety_road_logo-removebg-preview.png"
                            alt="안전의 길 로고"
                            className="dash-hero-logo"
                        />
                    </div>
                    <div className="dash-hero-titles">
                        <h1 className="dash-hero-title">안전의 길</h1>
                        <p className="dash-hero-subtitle">안전한 현장, 강한 팀</p>
                    </div>
                </div>

                {/* 우측 배지 */}
                <div className="dash-hero-badges">
                    {/* 작업중지 현황 배지 — 미해결 건이 있을 때 표시 */}
                    <div
                        className={`dash-hero-badge dash-hero-badge--stop${activeWorkStopCount > 0 ? ' dash-hero-badge--stop-active' : ''}`}
                        onClick={() => navigate('/work-stop-history')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/work-stop-history')}
                    >
                        <span className="dash-hero-badge-icon">✋</span>
                        <span className="dash-hero-badge-value">
                            {activeWorkStopCount > 0 ? `${activeWorkStopCount}건` : '-'}
                        </span>
                        <span className="dash-hero-badge-label">작업중지</span>
                    </div>
                    <div className="dash-hero-badge dash-hero-badge--fire">
                        <span className="dash-hero-badge-icon">🔥</span>
                        <span className="dash-hero-badge-value">{streakDays}일</span>
                        <span className="dash-hero-badge-label">연속</span>
                    </div>
                    {onNotificationClick && (
                        <button
                            type="button"
                            className="dash-hero-badge dash-hero-badge-button dash-hero-badge--notif"
                            onClick={onNotificationClick}
                            aria-label="알림 센터"
                        >
                            <span className="dash-hero-badge-icon">🔔</span>
                            <span className="dash-hero-badge-value">
                                {unreadNotifCount > 0 ? `${unreadNotifCount > 9 ? '9+' : unreadNotifCount}` : '0'}
                            </span>
                            <span className="dash-hero-badge-label">
                                {unreadNotifCount > 0 ? '새 알림' : '알림'}
                            </span>
                            {unreadNotifCount > 0 && (
                                <span className="dash-hero-notif-badge">
                                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                </span>
                            )}
                        </button>
                    )}
                    <div
                        id="dashboard-bgm-control-slot"
                        className="dash-hero-sound-slot"
                        aria-label="배경음악 제어"
                    />
                </div>
            </div>

            {/* 구분선 */}
            <div className="dash-hero-divider" />

            {/* 하단 메타 정보 */}
            <div className="dash-hero-meta">
                <span className="dash-hero-meta-item">
                    <span className="dash-hero-meta-icon">📅</span>
                    {today}
                </span>
                <span className="dash-hero-meta-sep">·</span>
                <span className="dash-hero-meta-item">
                    <span className="dash-hero-meta-icon">🏗️</span>
                    {teamLabel}
                </span>
                <span className="dash-hero-meta-sep">·</span>
                <span className="dash-hero-meta-item">
                    <span className="dash-hero-meta-icon">⚡</span>
                    Lv.{numericLevel} · {levelName}
                </span>
                <span className="dash-hero-meta-sep">·</span>
                <span className="dash-hero-meta-item dash-hero-meta-role">
                    {roleLabel}
                </span>
            </div>
        </div>
    );
}

export default DashboardHeader;
