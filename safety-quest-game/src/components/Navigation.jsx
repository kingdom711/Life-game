import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { hasCompletedTodayEducation } from '../utils/educationManager';

function Navigation() {
    const location = useLocation();
    const [educationCompleted, setEducationCompleted] = useState(true);

    // 교육 완료 여부 체크
    useEffect(() => {
        const checkEducation = () => {
            try {
                setEducationCompleted(hasCompletedTodayEducation());
            } catch (error) {
                console.error('교육 상태 확인 실패:', error);
            }
        };

        checkEducation();
        
        // 페이지 변경 시마다 체크
        const interval = setInterval(checkEducation, 5000);
        return () => clearInterval(interval);
    }, [location.pathname]);

    const navItems = [
<<<<<<< Updated upstream
        { path: '/game', label: '홈', icon: '🏠', active: location.pathname === '/game' || location.pathname === '/game/' },
        { path: '/game/daily', label: '일간', icon: '📅', active: location.pathname.includes('/daily') },
        { path: '/game/weekly', label: '주간', icon: '📊', active: location.pathname.includes('/weekly') },
        { path: '/game/shop', label: '상점', icon: '🛒', active: location.pathname.includes('/shop') },
        { path: '/game/profile', label: '프로필', icon: '👤', active: location.pathname.includes('/profile') }
=======
        { path: '/', label: '홈', icon: '🏠', active: location.pathname === '/' },
        { path: '/education', label: '교육', icon: '📚', active: location.pathname === '/education', badge: !educationCompleted },
        { path: '/daily', label: '일간', icon: '📅', active: location.pathname === '/daily' },
        { path: '/shop', label: '상점', icon: '🛒', active: location.pathname === '/shop' },
        { path: '/profile', label: '프로필', icon: '👤', active: location.pathname === '/profile' }
>>>>>>> Stashed changes
    ];

    return (
        <nav className="mobile-nav backdrop-blur-2xl bg-slate-900/90 border-t border-slate-700/50 
          shadow-2xl shadow-black/20">
            {navItems.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`
                        mobile-nav-item flex flex-col items-center justify-center p-3 rounded-xl
                        transition-all duration-300 relative group min-w-[60px]
                        ${item.active
                            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400'
                            : 'text-slate-400 hover:bg-slate-800/50'
                        }
                    `}
                >
                    {/* 활성 인디케이터 */}
                    {item.active && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 
                          bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                    )}

                    {/* 미완료 뱃지 (교육 등) */}
                    {item.badge && (
                        <div 
                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full 
                              shadow-lg shadow-red-500/50 animate-pulse"
                            style={{
                                border: '2px solid rgb(15, 23, 42)'
                            }}
                        />
                    )}

                    <div className="mobile-nav-icon text-2xl mb-1 group-hover:scale-110 
                      transition-transform duration-300">
                        {item.icon}
                    </div>
                    <div className="mobile-nav-label text-xs font-semibold">
                        {item.label}
                    </div>

                    {/* 호버 효과 */}
                    {!item.active && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 
                          to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 
                          transition-opacity duration-300" />
                    )}
                </Link>
            ))}
        </nav>
    );
}

export default Navigation;
