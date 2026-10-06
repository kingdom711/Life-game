import { BookOpen, Camera, ClipboardCheck, CircleCheck, LockKeyhole, LogIn, ShieldCheck, Sparkles, Coins, ArrowRight, Target } from 'lucide-react';

const QUEST_ICONS = { daily_education_1: BookOpen, daily_quiz_1: Target, daily_checklist_1: ClipboardCheck, daily_hazard_1: Camera, daily_photo_1: Camera, daily_login_1: LogIn, daily_review_1: CircleCheck, daily_safety_1: ShieldCheck };
const cleanTitle = quest => (quest.title || quest.name || '안전 퀘스트').replace(/^[^\p{L}\p{N}]+/u, '');
const shortLabels = { daily_login_1: '출석', daily_education_1: '안전교육', daily_hazard_1: '위험 찾기', daily_photo_1: '현장 촬영', daily_checklist_1: '안전 점검', daily_review_1: '점검 검토', daily_safety_1: '위험 확인' };

function TodayMissions({ quests = [], onQuestAction }) {
    const completed = quests.filter(quest => quest.isCompleted).length;
    const path = [...quests.filter(quest => quest.id === 'daily_login_1'), ...quests.filter(quest => quest.id === 'daily_education_1'), ...quests.filter(quest => !['daily_login_1', 'daily_education_1'].includes(quest.id))];
    const available = quests.filter(quest => quest.isActive && !quest.isLocked && !quest.isCompleted);
    const current = available.find(quest => quest.id === 'daily_education_1') || available.find(quest => quest.id === 'daily_login_1') || available[0];
    const CurrentIcon = QUEST_ICONS[current?.id] || Target;
    return <section className="adventure-missions" aria-labelledby="adventure-missions-title">
        <div className="adventure-section-heading"><h2 id="adventure-missions-title">오늘의 퀘스트 경로</h2><span>{completed} / {quests.length} 완료</span></div>
        {path.length > 0 && <ol className="adventure-path" style={{ '--path-count': path.length }}>{path.map(quest => {
            const Icon = quest.isCompleted ? CircleCheck : quest.isLocked ? LockKeyhole : QUEST_ICONS[quest.id] || Target;
            const status = quest.isCompleted ? '완료' : quest.isLocked ? '교육 후 진행' : current?.id === quest.id ? '지금 도전' : '도전 가능';
            return <li key={quest.id} className={`adventure-path-step${quest.isCompleted ? ' is-complete' : ''}${current?.id === quest.id ? ' is-current' : ''}`}>
                <button type="button" className="adventure-path-node" disabled={quest.isLocked || quest.isCompleted} onClick={() => onQuestAction?.(quest)} aria-label={`${shortLabels[quest.id] || cleanTitle(quest)}, ${status}`}><Icon size={22} aria-hidden="true" /></button><strong>{shortLabels[quest.id] || cleanTitle(quest)}</strong><span>{status}</span>
            </li>;
        })}</ol>}
        {current ? <article className="adventure-current-quest"><span className="adventure-quest-tag"><CurrentIcon size={15} aria-hidden="true" />현재 퀘스트{current.mandatory ? ' · 필수 교육' : ''}</span><h3>{cleanTitle(current)}</h3><p>{current.description}</p>
            <div className="adventure-quest-rewards">{Number(current.reward?.exp) > 0 && <span><Sparkles size={15} aria-hidden="true" />+{current.reward.exp} XP</span>}{Number(current.reward?.points) > 0 && <span><Coins size={15} aria-hidden="true" />+{current.reward.points} P</span>}</div>
            <button type="button" className="adventure-button adventure-button--primary" onClick={() => onQuestAction?.(current)}>{current.id === 'daily_login_1' ? '출석하고 모험 시작' : '퀘스트 이어하기'}<ArrowRight size={18} aria-hidden="true" /></button>
        </article> : <div className="adventure-quest-summary" role="status"><CircleCheck size={25} aria-hidden="true" /><h3>{quests.length && completed === quests.length ? '오늘의 퀘스트 완료!' : '오늘의 퀘스트를 준비하고 있어요'}</h3><p>{quests.length && completed === quests.length ? '쌓인 경험치와 다음 성장 목표를 확인해 보세요.' : quests.length ? '목록에서 진행 상태를 확인해 주세요.' : '퀘스트가 준비되면 이곳에서 다음 도전을 안내해 드릴게요.'}</p></div>}
        {quests.length > 0 && <details className="adventure-quest-list"><summary>오늘의 모든 퀘스트 <span>{quests.length}개</span></summary><ul>{quests.map(quest => {
            const Icon = QUEST_ICONS[quest.id] || Target;
            return <li key={quest.id}><button type="button" disabled={quest.isLocked || quest.isCompleted} onClick={() => onQuestAction?.(quest)}><Icon size={19} aria-hidden="true" /><span>{cleanTitle(quest)}</span><small>{quest.isCompleted ? '완료' : quest.isLocked ? '교육 후 진행' : '도전'}</small></button></li>;
        })}</ul></details>}
    </section>;
}
export default TodayMissions;
