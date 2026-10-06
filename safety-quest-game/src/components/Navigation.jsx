import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Route, User, Users, Menu, X, BookOpen, Target, Trophy, ShoppingCart, Gift, MessageSquare, ShieldCheck, BarChart3, Camera, Clapperboard, Bot, Newspaper, Thermometer, Swords } from 'lucide-react';

const extras = [
    {path:'/education',label:'안전교육',Icon:BookOpen}, {path:'/daily',label:'일일 퀘스트',Icon:Target},
    {path:'/weekly',label:'주간 퀘스트',Icon:Target}, {path:'/monthly',label:'월간 퀘스트',Icon:Target},
    {path:'/hazard-cycle',label:'위험 제보와 개선',Icon:Camera}, {path:'/scenario',label:'현장 시나리오',Icon:Clapperboard},
    {path:'/specialization',label:'전직 센터',Icon:ShieldCheck}, {path:'/inventory',label:'장비 보관함',Icon:User},
    {path:'/shop',label:'장비 상점',Icon:ShoppingCart}, {path:'/achievements',label:'업적',Icon:Trophy},
    {path:'/season-ranking',label:'시즌 랭킹',Icon:Trophy}, {path:'/team-quest',label:'팀 퀘스트',Icon:Users},
    {path:'/department-battle',label:'부서 대항전',Icon:Swords}, {path:'/learning-path',label:'학습 경로',Icon:Route},
    {path:'/safety-score',label:'AI 분석',Icon:Bot}, {path:'/daily-briefing',label:'AI 브리핑',Icon:Newspaper},
    {path:'/hazard-heatmap',label:'위험 히트맵',Icon:Thermometer}, {path:'/compliance-report',label:'리포트',Icon:BarChart3},
    {path:'/feedback',label:'게시판',Icon:MessageSquare}, {path:'/reward-center',label:'보상안내',Icon:Gift}
    , {path:'/work-stop-history',label:'작업중지 기록',Icon:ShieldCheck}, {path:'/risk-solution',label:'위험 조치',Icon:ShieldCheck},
    {path:'/alert-management',label:'현장 알림',Icon:MessageSquare}, {path:'/exchange',label:'골드 교환소',Icon:Gift}
];

function Navigation({showAdminLinks=false,showReportLink=false,participantLockdown=false}) {
    const location = useLocation();
    const menu = useRef(null);
    const main = participantLockdown ? [
        {path:'/profile',label:'내 점수',Icon:User}, {path:'/reward-center',label:'보상안내',Icon:Gift}, {path:'/feedback',label:'게시판',Icon:MessageSquare}
    ] : [{path:'/',label:showAdminLinks?'홈':'모험',Icon:Route},{path:'/profile',label:'캐릭터',Icon:User},{path:'/my-team',label:'우리 팀',Icon:Users}];
    const menuItems = [...extras, ...(showAdminLinks ? [{path:'/admin',label:'관리 대시보드',Icon:ShieldCheck},{path:'/admin/feedback',label:'의견관리',Icon:MessageSquare},{path:'/admin/reward-approval',label:'보상 승인',Icon:Gift},{path:'/admin/password-reset-requests',label:'비밀번호 승인',Icon:ShieldCheck}] : []), ...(showReportLink ? [{path:'/reports',label:'성장 리포트',Icon:BarChart3},{path:'/client-activity-report',label:'참여 리포트',Icon:BarChart3}] : [])];
    const active = path => path === '/' ? location.pathname === '/' || (showAdminLinks && location.pathname === '/admin') : location.pathname === path || location.pathname.startsWith(path + '/');
    return <>
        <nav className="adventure-nav" aria-label="주 메뉴">{main.map(item => <Link key={item.path} to={item.path} className={active(item.path)?'is-active':''} aria-current={active(item.path)?'page':undefined}><item.Icon size={21} aria-hidden="true" /><span>{item.label}</span></Link>)}
            {!participantLockdown && <button type="button" className={!main.some(item=>active(item.path))?'is-active':''} aria-haspopup="dialog" onClick={()=>menu.current.showModal()}><Menu size={21} aria-hidden="true" /><span>전체</span></button>}
        </nav>
        {!participantLockdown && <dialog ref={menu} className="adventure-menu" aria-labelledby="adventure-menu-title"><div className="adventure-menu-header"><h2 id="adventure-menu-title">모험의 모든 길</h2><button type="button" aria-label="전체 메뉴 닫기" onClick={()=>menu.current.close()}><X size={20} aria-hidden="true" /></button></div><div className="adventure-menu-links">{menuItems.map(item=><Link key={item.path} to={item.path} aria-current={active(item.path)?'page':undefined} onClick={()=>menu.current.close()}><item.Icon size={19} aria-hidden="true" />{item.label}</Link>)}</div></dialog>}
    </>;
}
export default Navigation;
