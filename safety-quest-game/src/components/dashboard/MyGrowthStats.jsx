function MyGrowthStats({ points = 0, safetyScore = 92, ranking = 3 }) {
    return (
        <div className="new-growth-section">
            <h3 className="new-growth-title">내 성장</h3>
            <div className="new-growth-stats">
                <div className="new-growth-stat">
                    <span className="new-growth-stat-icon">☆</span>
                    <span className="new-growth-stat-value">{points.toLocaleString()}</span>
                    <span className="new-growth-stat-label">포인트</span>
                </div>
                <div className="new-growth-stat">
                    <span className="new-growth-stat-icon">◎</span>
                    <span className="new-growth-stat-value">{safetyScore}점</span>
                    <span className="new-growth-stat-label">안전지수</span>
                </div>
                <div className="new-growth-stat">
                    <span className="new-growth-stat-icon">↗</span>
                    <span className="new-growth-stat-value">#{ranking}</span>
                    <span className="new-growth-stat-label">랭킹</span>
                </div>
            </div>
        </div>
    );
}

export default MyGrowthStats;
