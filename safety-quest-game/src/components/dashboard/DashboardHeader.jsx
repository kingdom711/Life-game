import { userProfile } from '../../utils/storage';

const ROLE_LABELS = {
    technician: '기술인',
    supervisor: '관리감독자',
    safetyManager: '안전관리자'
};

function DashboardHeader({ playerStats, role }) {
    const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const affiliation = userProfile.getAffiliation() || 'ESQ실';
    const levelName = playerStats?.level?.name || 'Lv.1';
    const streakDays = Number(playerStats?.streak?.current || 0);
    const safetyScore = 92;
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
                    <div className="dash-hero-badge dash-hero-badge--fire">
                        <span className="dash-hero-badge-icon">🔥</span>
                        <span className="dash-hero-badge-value">{streakDays}일</span>
                        <span className="dash-hero-badge-label">연속</span>
                    </div>
                    <div className="dash-hero-badge dash-hero-badge--star">
                        <span className="dash-hero-badge-icon">⭐</span>
                        <span className="dash-hero-badge-value">{safetyScore}</span>
                        <span className="dash-hero-badge-label">안전점수</span>
                    </div>
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
                    {affiliation}
                </span>
                <span className="dash-hero-meta-sep">·</span>
                <span className="dash-hero-meta-item">
                    <span className="dash-hero-meta-icon">⚡</span>
                    {levelName}
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
