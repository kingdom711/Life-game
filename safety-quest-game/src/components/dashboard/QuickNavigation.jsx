import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    { path: '/education', label: '교육', icon: '📚', color: '#3b82f6' },
    { path: '/daily', label: '퀘스트', icon: '🎯', color: '#22c55e' },
    { path: '/safety-score', label: 'AI 분석', icon: '🤖', color: '#8b5cf6' },
    { path: '/shop', label: '상점', icon: '🛒', color: '#f59e0b' },
    { path: '/reward-center', label: '보상센터', icon: '🏆', color: '#ec4899' }
];

function QuickNavigation() {
    const navigate = useNavigate();

    return (
        <div className="new-quicknav-section">
            <h3 className="new-quicknav-title">빠른 이동</h3>
            <div className="new-quicknav-grid">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.path}
                        type="button"
                        className="new-quicknav-btn"
                        onClick={() => navigate(item.path)}
                        style={{ '--qn-color': item.color }}
                    >
                        <div className="new-quicknav-icon-wrap">
                            <span className="new-quicknav-icon">{item.icon}</span>
                        </div>
                        <span className="new-quicknav-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuickNavigation;
