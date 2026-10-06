import { Gift, Coins } from 'lucide-react';
import { pointsHistory } from '../../utils/storage';
function RecentRewards() {
    const history=pointsHistory.getRecent().filter(entry=>entry.amount>0).slice(0,3);
    return <section className="new-rewards-section"><h3 className="new-rewards-title"><Gift size={19} aria-hidden="true" />최근 획득한 보상</h3>{history.length? <div className="new-rewards-list">{history.map((reward,index)=><div key={reward.id||index} className="new-reward-item"><Coins size={17} className="new-reward-icon" aria-hidden="true" /><span className="new-reward-text">{reward.source||reward.sourceDetail||'활동 보상'}</span><span className="new-reward-time">+{reward.amount} P</span></div>)}</div>:<p className="adventure-empty">아직 획득한 보상이 없어요. 첫 퀘스트에 도전해 보세요.</p>}</section>;
}
export default RecentRewards;
