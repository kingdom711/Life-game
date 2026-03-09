import { pointsHistory } from '../../utils/storage';

const REWARD_ICONS = {
    '출석': '🔥',
    '교육': '📚',
    '퀴즈': '🏆',
    '위험': '💰',
    '체크리스트': '📋',
    '사진': '📸',
    default: '⭐'
};

function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    return `${diffDays}일 전`;
}

function getRewardIcon(source = '') {
    for (const [key, icon] of Object.entries(REWARD_ICONS)) {
        if (key !== 'default' && source.includes(key)) return icon;
    }
    return REWARD_ICONS.default;
}

function RecentRewards() {
    const recentHistory = pointsHistory.getRecent(5)
        .filter(entry => entry.amount > 0)
        .slice(0, 3);

    const fallbackRewards = [
        { id: '1', source: '연속 출석 7일 달성', timestamp: new Date().toISOString(), amount: 100 },
        { id: '2', source: '위험요인 신고 보상', timestamp: new Date(Date.now() - 86400000).toISOString(), amount: 60 },
        { id: '3', source: '퀴즈 전문가 뱃지', timestamp: new Date(Date.now() - 172800000).toISOString(), amount: 50 }
    ];

    const rewards = recentHistory.length > 0 ? recentHistory : fallbackRewards;

    return (
        <div className="new-rewards-section">
            <h3 className="new-rewards-title">
                <span className="new-rewards-title-icon">🎁</span>
                최근 보상
            </h3>
            <div className="new-rewards-list">
                {rewards.map((reward) => (
                    <div key={reward.id} className="new-reward-item">
                        <span className="new-reward-icon">{getRewardIcon(reward.source)}</span>
                        <span className="new-reward-text">{reward.source || reward.sourceDetail}</span>
                        <span className="new-reward-time">{getTimeAgo(reward.timestamp)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentRewards;
