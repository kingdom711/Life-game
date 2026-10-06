import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import Avatar from '../Avatar';
import { getRoleById } from '../../data/rolesData';

const positiveNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;

function PlayerCard({ name = '안전 탐험가', role = 'technician', experience = {}, equippedItems = {}, siteName = '', teamName = '', children }) {
    const current = Math.max(1, positiveNumber(experience.current, 1));
    const exp = positiveNumber(experience.exp);
    const target = Math.max(1, positiveNumber(experience.expToNext, 100));
    const progress = Math.min(100, Math.round(exp / target * 100));
    const remaining = Math.max(0, target - exp);
    const roleInfo = getRoleById(role);
    return (
        <section className="adventure-player" aria-label="나의 캐릭터와 성장">
            <Link to="/profile" className="adventure-player-portrait" aria-label="내 캐릭터와 성장 기록 보기"><Avatar size={128} roleId={role} equippedItems={equippedItems} showGear /><span className="adventure-level">Lv. {current}</span></Link>
            <div className="adventure-player-info"><p className="adventure-eyebrow">{siteName || teamName || '나의 안전 여정'}{siteName && teamName ? ` · ${teamName}` : ''}</p><h2>{name}</h2><p className="adventure-player-role">{roleInfo?.name || '기술인'} · 오늘의 활동이 나의 성장으로</p>
                <div className="adventure-xp" role="progressbar" aria-label="다음 레벨까지 경험치" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${exp.toLocaleString()} / ${target.toLocaleString()} XP`}><div style={{ width: `${progress}%` }} /></div>
                <div className="adventure-player-progress"><span><Sparkles size={14} aria-hidden="true" />다음 레벨까지 {remaining.toLocaleString()} XP</span><Link to="/profile" aria-label="성장 기록 보기"><ChevronRight size={18} aria-hidden="true" /></Link></div>{children}
            </div>
        </section>
    );
}
export default PlayerCard;
