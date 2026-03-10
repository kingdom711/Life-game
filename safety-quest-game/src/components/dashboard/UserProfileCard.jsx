import { Link } from 'react-router-dom';
import Avatar from '../Avatar';
import { userProfile } from '../../utils/storage';

const ROLE_LABELS = {
    technician: '기술인',
    supervisor: '관리감독자',
    safetyManager: '안전관리자'
};

function UserProfileCard({ playerStats, role, equippedItems, educationCompleted }) {
    const pointsValue = Number(playerStats?.points || 0);
    const levelInfo = playerStats?.level || {};
    const levelName = levelInfo.name || 'Bronze III';
    const levelProgress = Number.isFinite(levelInfo.progress) ? levelInfo.progress : 0;
    const levelRank = levelInfo.rank || 1;
    const streakDays = Number(playerStats?.streak?.current || 0);
    const displayName = userProfile.getName() || '김현수';
    const affiliation = userProfile.getAffiliation();
    const safetyScore = 92; // TODO: integrate with safetyScoreCalculator

    const currentXP = pointsValue;
    const levelMax = levelInfo.max || 3000;
    const levelMin = levelInfo.min || 0;
    const xpInLevel = currentXP - levelMin;
    const xpNeeded = levelMax - levelMin;

    return (
        <div className="new-profile-card">
            <div className="new-profile-top">
                <div className="new-profile-avatar-area">
                    <Link to="/profile" className="new-profile-avatar-link">
                        <div className="new-profile-avatar-circle">
                            <Avatar size={48} roleId={role} equippedItems={{}} />
                        </div>
                        <span className="new-profile-level-badge">
                            {levelRank}
                        </span>
                    </Link>
                    <div className="new-profile-identity">
                        <div className="new-profile-name-row">
                            <span className="new-profile-name">{displayName}</span>
                            <span className="new-profile-role-badge">{ROLE_LABELS[role] || '기술인'}</span>
                        </div>
                        {affiliation ? (
                            <div className="new-profile-company">{affiliation}</div>
                        ) : (
                            <Link to="/profile?setup=affiliation" className="new-profile-company">
                                소속 미입력 · 프로필에서 설정
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="new-profile-stats-row">
                <div className="new-profile-level-section">
                    <div className="new-profile-level-label">
                        Lv.{levelRank}
                        <span className="new-profile-xp-text">
                            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                        </span>
                    </div>
                    <div className="new-profile-xp-bar">
                        <div
                            className="new-profile-xp-fill"
                            style={{ width: `${Math.max(0, Math.min(100, levelProgress))}%` }}
                        />
                    </div>
                </div>
            </div>

            {!educationCompleted && (
                <Link to="/education" className="new-profile-hint">
                    <span className="new-profile-hint-icon">💡</span>
                    오늘 안전 교육을 완료하면 작업 권한이 활성화됩니다
                    <span className="new-profile-hint-arrow">&gt;</span>
                </Link>
            )}
        </div>
    );
}

export default UserProfileCard;
