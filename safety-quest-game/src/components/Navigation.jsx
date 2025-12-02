import { Link, useLocation } from 'react-router-dom';

function Navigation() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: '홈', icon: '🏠', active: location.pathname === '/' },
        { path: '/daily', label: '일간', icon: '📅', active: location.pathname === '/daily' },
        { path: '/weekly', label: '주간', icon: '📊', active: location.pathname === '/weekly' },
        { path: '/shop', label: '상점', icon: '🛒', active: location.pathname === '/shop' },
        { path: '/profile', label: '프로필', icon: '👤', active: location.pathname === '/profile' }
    ];

    return (
        <nav className="mobile-nav">
            {navItems.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-item ${item.active ? 'active' : ''}`}
                >
                    <div className="mobile-nav-icon">{item.icon}</div>
                    <div className="mobile-nav-label">{item.label}</div>
                </Link>
            ))}
        </nav>
    );
}

export default Navigation;
