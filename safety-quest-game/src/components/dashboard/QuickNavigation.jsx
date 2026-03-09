import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    { path: '/education', label: '교육', icon: '📚', color: '#3b82f6' },
    { path: '/daily', label: '퀘스트', icon: '🎯', color: '#22c55e' },
    { path: '/safety-score', label: 'AI 분석', icon: '🤖', color: '#8b5cf6' },
    { path: '/alert-management', label: '알림', icon: '🔔', color: '#f59e0b', badge: 3 }
];

function QuickNavigation({ alertCount = 0 }) {
    const navigate = useNavigate();

    return (
        <div className="new-quicknav-section">
            <h3 className="new-quicknav-title">빠른 이동</h3>
            <div className="new-quicknav-grid">
                {NAV_ITEMS.map((item) => {
                    const badgeCount = item.label === '알림' ? (alertCount || item.badge) : 0;
                    return (
                        <button
                            key={item.path}
                            type="button"
                            className="new-quicknav-btn"
                            onClick={() => navigate(item.path)}
                            style={{ '--qn-color': item.color }}
                        >
                            <div className="new-quicknav-icon-wrap">
                                <span className="new-quicknav-icon">{item.icon}</span>
                                {badgeCount > 0 && (
                                    <span className="new-quicknav-badge">{badgeCount}</span>
                                )}
                            </div>
                            <span className="new-quicknav-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default QuickNavigation;
