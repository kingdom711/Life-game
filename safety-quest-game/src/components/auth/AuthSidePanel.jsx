import { BookOpen, Sparkles, Users, ArrowRight } from 'lucide-react';

const roles = [{name:'기술인',image:'/role_technician.png',label:'현장을 실천하는 주인공'},{name:'관리감독자',image:'/role_supervisor.png',label:'동료의 안전을 잇는 리더'},{name:'안전관리자',image:'/role_safety_manager.png',label:'함께 개선하는 수호자'}];
function AuthSidePanel() {
    return <aside className="auth-side-panel" aria-label="안전 모험 소개"><div className="auth-side-panel__header"><span className="auth-side-panel__header-text">안전을 게임으로.</span></div><p className="auth-adventure-copy">오늘의 현장이, 나의 성장으로.<br />각자의 역할로 함께 만드는 안전 모험.</p><div className="auth-side-panel__roles">{roles.map(role=><div key={role.name} className="auth-side-panel__role"><img src={role.image} alt={role.name+' 캐릭터'} className="auth-side-panel__role-image" loading="lazy" /><div className="auth-side-panel__role-name">{role.name}</div><div className="auth-side-panel__role-id">{role.label}</div></div>)}</div><div className="auth-adventure-loop"><BookOpen size={18} aria-hidden="true" />교육<ArrowRight size={16} aria-hidden="true" /><Users size={18} aria-hidden="true" />실천<ArrowRight size={16} aria-hidden="true" /><Sparkles size={18} aria-hidden="true" />성장</div></aside>;
}
export default AuthSidePanel;
