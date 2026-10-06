import { useEffect } from 'react';
import { ArrowRight, HardHat, BookOpen, Target, Sparkles, Users, Camera, ShieldCheck, ChevronRight } from 'lucide-react';
import { analytics } from '../utils/analytics';
import { BETA_CLOSED } from '../config/betaConfig';

const features = [
    {Icon:BookOpen,title:'배우며 도전하고',text:'안전교육과 상황 퀴즈를 퀘스트로 만나세요.'},
    {Icon:Camera,title:'현장을 바꾸고',text:'위험을 발견하고, 개선된 모습을 함께 확인하세요.'},
    {Icon:Sparkles,title:'나의 캐릭터를 키우고',text:'쌓인 경험치와 장비로 나의 성장을 기록하세요.'},
    {Icon:Users,title:'동료와 함께 완성해요',text:'우리 팀의 공동 퀘스트로 안전 활동을 이어가세요.'}
];

function LandingPage({onEnter,onShowTeam,onLogin}) {
    useEffect(()=>{analytics.pageView('/landing','안전의 길');},[]);
    return <div className="adventure-landing">
        <nav className="landing-top"><a href="#" className="adventure-brand"><HardHat size={25} aria-hidden="true" />안전의 길</a><div className="landing-top-actions"><div id="dashboard-bgm-control-slot" aria-label="배경음악 제어" /><button type="button" className="adventure-button" onClick={onLogin}>로그인<ArrowRight size={17} aria-hidden="true" /></button></div></nav>
        <main><section className="landing-hero"><div className="landing-hero-copy"><span className="adventure-quest-tag"><Target size={15} aria-hidden="true" />현장에서 시작하는 안전 모험</span><h1>안전을 게임으로.<br /><span>오늘의 현장이,<br />나의 성장으로.</span></h1><p>교육으로 배우고, 위험을 찾고, 동료와 함께 개선하세요.<br />매일의 안전 활동이 캐릭터의 경험이 됩니다.</p>
            {BETA_CLOSED ? <div className="landing-season-notice"><ShieldCheck size={20} aria-hidden="true" /><div><strong>베타 참여가 종료되었습니다</strong><p>로그인해 성장 기록과 보상안내를 확인하세요.</p></div></div> : null}
            <div className="landing-hero-actions"><button type="button" className="adventure-button adventure-button--primary" onClick={BETA_CLOSED?onLogin:onEnter}>{BETA_CLOSED?'나의 성장 기록 보기':'안전 모험 시작하기'}<ArrowRight size={19} aria-hidden="true" /></button><a href="#adventure-about" className="landing-text-link">어떤 모험인가요?<ChevronRight size={17} aria-hidden="true" /></a></div>
        </div><div className="landing-game-preview" aria-label="안전 모험 서비스 화면 예시"><div className="landing-preview-top"><HardHat size={20} aria-hidden="true" /><strong>나의 안전 여정</strong><span>화면 예시</span></div><div className="landing-character"><img src="/role_technician.png" alt="기술인 캐릭터" /><div><span className="adventure-eyebrow">오늘도 한 걸음</span><h2>현장 수호자</h2><p>배우고, 실천하고, 성장하는 나</p><div className="landing-preview-xp"><span /></div><span className="adventure-quest-tag">다음 목표 · 안전교육</span></div></div><div className="landing-preview-route"><span><BookOpen size={21} aria-hidden="true" />배우기</span><i aria-hidden="true" /><span><ShieldCheck size={21} aria-hidden="true" />실천하기</span><i aria-hidden="true" /><span><Sparkles size={21} aria-hidden="true" />성장하기</span></div><div className="landing-preview-quest"><span className="adventure-quest-tag">오늘의 퀘스트</span><h3>높은 곳에서도, 안전하게</h3><p>안전교육으로 익히는 현장의 기본</p><div className="adventure-quest-rewards"><span>+30 XP</span><span>+100 P</span></div></div></div></section>
        <section id="adventure-about" className="landing-about"><p className="adventure-eyebrow">안전의 길을 즐기는 방법</p><h2>작은 실천이 쌓이는, 나의 모험.</h2><div className="landing-features">{features.map(({Icon,title,text})=><article key={title}><Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className="landing-party"><div><span className="adventure-quest-tag">우리 현장의 주인공</span><h2>각자의 역할로, 함께 안전하게.</h2><p>기술인·관리감독자·안전관리자가 함께 만드는 현장의 변화.</p></div><div className="landing-party-characters">{[{src:'/role_technician.png',name:'기술인'},{src:'/role_supervisor.png',name:'관리감독자'},{src:'/role_safety_manager.png',name:'안전관리자'}].map(role=><figure key={role.name}><img src={role.src} alt={role.name+' 캐릭터'} loading="lazy" /><figcaption>{role.name}</figcaption></figure>)}</div></section></main>
        <footer className="landing-footer"><span>© {new Date().getFullYear()} 안전의 길 · Safety Quest</span><button type="button" onClick={onShowTeam}>만든 사람들</button></footer>
    </div>;
}
export default LandingPage;
