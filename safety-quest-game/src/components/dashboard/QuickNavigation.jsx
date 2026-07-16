import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Target, Bot, ShoppingCart, Gift,
  Trophy, Route, Users, Swords, Newspaper,
  Thermometer, Clapperboard, BarChart2, MessageSquare
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/education',        label: '교육',      Icon: BookOpen,     color: '#3b82f6' },
    { path: '/daily',            label: '퀘스트',    Icon: Target,       color: '#22c55e' },
    { path: '/feedback',         label: '게시판',    Icon: MessageSquare,color: '#0ea5e9' },
    { path: '/safety-score',     label: 'AI 분석',   Icon: Bot,          color: '#8b5cf6' },
    { path: '/shop',             label: '상점',      Icon: ShoppingCart, color: '#f59e0b' },
    { path: '/reward-center',    label: '보상안내',   Icon: Gift,         color: '#ec4899' },
    { path: '/season-ranking',   label: '시즌 랭킹',  Icon: Trophy,       color: '#eab308' },
    { path: '/learning-path',    label: '학습 경로',  Icon: Route,        color: '#6366f1' },
    { path: '/team-quest',       label: '팀 퀘스트',  Icon: Users,        color: '#06b6d4' },
    { path: '/department-battle',label: '부서 대항전', Icon: Swords,       color: '#a855f7' },
    { path: '/daily-briefing',   label: 'AI 브리핑',  Icon: Newspaper,    color: '#14b8a6' },
    { path: '/hazard-heatmap',   label: '위험 히트맵', Icon: Thermometer,  color: '#ef4444' },
    { path: '/scenario',         label: '시나리오',   Icon: Clapperboard, color: '#f97316' },
    { path: '/compliance-report',label: '리포트',     Icon: BarChart2,    color: '#0ea5e9' }
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
                            <item.Icon
                                size={22}
                                strokeWidth={1.75}
                                className="new-quicknav-icon"
                                aria-hidden="true"
                            />
                        </div>
                        <span className="new-quicknav-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuickNavigation;
