// Development-only component review. Vite's production entry does not include this page.
// Example data stays in this component; no authentication, network mutations or storage writes.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Camera, Clapperboard } from 'lucide-react';
import '../src/styles/index.css';
import DashboardHeader from '../src/components/dashboard/DashboardHeader';
import PlayerCard from '../src/components/dashboard/PlayerCard';
import TodayMissions from '../src/components/dashboard/TodayMissions';
import MyGrowthStats from '../src/components/dashboard/MyGrowthStats';
import EquippedGearDisplay from '../src/components/dashboard/EquippedGearDisplay';
import SiteInfoSection from '../src/components/dashboard/SiteInfoSection';
import Navigation from '../src/components/Navigation';
import RewardCenter from '../src/pages/RewardCenter';
import { dailyQuests } from '../src/data/questsData';
import { items } from '../src/data/itemsData';

function Review() {
    const [state, setState] = useState('locked');
    const [role, setRole] = useState('technician');
    const [gear, setGear] = useState(true);
    const [lockdown, setLockdown] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [view, setView] = useState('home');
    const eligible = dailyQuests.filter(quest => quest.role === 'all' || quest.role === role);
    const login = eligible.find(quest => quest.id === 'daily_login_1');
    const visible = [...eligible.filter(quest => quest.id !== 'daily_login_1').slice(0,3), login].filter(Boolean);
    const quests = state === 'empty' ? [] : visible.map(quest => {
        const isCompleted = state === 'completed' || (state === 'available' && ['daily_login_1','daily_education_1'].includes(quest.id));
        const isLocked = state === 'locked' && !['daily_login_1','daily_education_1'].includes(quest.id);
        return {...quest,isCompleted,isLocked,isActive:!isCompleted && !isLocked};
    });
    const equipped = gear ? Object.fromEntries(['helmet','vest','gloves'].map(category => [category, items.find(item => item.category === category && item.image)]).filter(([,item]) => item)) : {};
    return <div className="app"><aside className="ui-review-toolbar"><strong>개발용 검토 · 모든 수치는 예시</strong><label>화면<select value={view} onChange={e=>setView(e.target.value)}><option value="home">홈</option><option value="reward">보상안내</option></select></label><label>역할<select value={role} onChange={e=>setRole(e.target.value)}><option value="technician">기술인</option><option value="supervisor">관리감독자</option><option value="safetyManager">안전관리자</option></select></label><label>퀘스트 상태<select value={state} onChange={e=>{setState(e.target.value);setFeedback('');}}><option value="locked">교육 전</option><option value="available">교육 완료</option><option value="completed">모두 완료</option><option value="empty">목록 없음</option></select></label><label><input type="checkbox" checked={gear} onChange={e=>setGear(e.target.checked)} />장비 표시</label><label><input type="checkbox" checked={lockdown} onChange={e=>setLockdown(e.target.checked)} />베타 종료 메뉴</label><output aria-live="polite">{feedback}</output></aside>
        {view === 'reward' ? <RewardCenter /> : <div className="page dashboard-page"><div className="container"><DashboardHeader playerStats={{streak:{current:3}}} unreadNotifCount={2} onNotificationClick={()=>setFeedback('알림 센터 선택 · 검토용 화면입니다.')} /><div className="new-dashboard-layout"><main className="new-dashboard-left"><PlayerCard name="현장 수호자" role={role} experience={{current:7,exp:180,expToNext:300}} equippedItems={equipped} siteName="우리 현장" teamName="안전 동행팀" /><TodayMissions quests={quests} onQuestAction={quest=>setFeedback(`선택한 도전: ${quest.title} · 검토에서는 보상을 지급하지 않습니다.`)} /><div className="adventure-explore"><a href="#review"><Camera size={23}/><strong>현장 위험 탐색</strong><span>발견부터 개선 확인까지</span></a><a href="#review"><Clapperboard size={23}/><strong>현장 시나리오</strong><span>선택하며 배우는 안전</span></a></div><SiteInfoSection alerts={[]} alertCount={0} workStopCount={0} /></main><aside className="new-dashboard-right"><MyGrowthStats points={2480} completedQuests={quests.filter(q=>q.isCompleted).length} totalQuests={quests.length} equippedCount={Object.keys(equipped).length} /><EquippedGearDisplay equippedItems={equipped} /><section className="new-rewards-section"><h3 className="new-rewards-title">성장과 함께 쌓이는 보상</h3><p className="adventure-empty">실제 홈에서는 나의 최근 보상 내역을 표시합니다.</p></section><section className="new-team-section"><h3 className="new-team-title">동료와 함께하는 모험</h3><p className="adventure-empty">우리 팀의 공동 퀘스트와 참여 기록을 이어가세요.</p></section></aside></div></div></div>}
        <Navigation participantLockdown={lockdown} />
    </div>;
}
const reviewRoot = createRoot(document.getElementById('root'));
reviewRoot.render(<MemoryRouter><Review /></MemoryRouter>);
if (import.meta.hot) import.meta.hot.dispose(() => reviewRoot.unmount());
